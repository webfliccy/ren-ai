This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## AWS Infrastructure

Production runs on AWS, provisioned by Terraform in [`infra/`](infra/). It is a deliberately small single-instance stack: CloudFront terminates TLS at the edge and forwards to one EC2 host running the app as an ECS task behind nginx.

```mermaid
flowchart TB
    User([Browser])

    subgraph edge["Edge (global / us-east-1)"]
        R53["Route 53<br/>hosted zone · apex A alias"]
        CF["CloudFront<br/>ACM cert · HTTPS<br/>cache /_next/static/*, SSR uncached"]
    end

    subgraph vpc["VPC 10.0.0.0/16 — public subnet"]
        subgraph host["EC2 host (t3.micro, ASG min/max 1, Elastic IP)"]
            NGINX["nginx<br/>:80 → :3000"]
            TASK["ECS task 'ren-ai'<br/>Next.js container :3000"]
        end
    end

    subgraph services["Supporting services"]
        ECR["ECR<br/>image repo (keep last 5)"]
        SSM["SSM Parameter Store<br/>SecureString app secrets"]
        S3["S3 bucket<br/>file uploads (not managed here)"]
        CW["CloudWatch<br/>logs · Container Insights · alarms"]
        SNS["SNS → alert email"]
    end

    GHA["GitHub Actions<br/>(OIDC role, main branch only)"]

    User -->|HTTPS| CF
    R53 -.->|DNS| CF
    CF -->|"HTTP :80 (SG allows CloudFront IPs only)"| NGINX
    NGINX --> TASK
    ECR -->|image pull| TASK
    SSM -->|secrets at task start| TASK
    TASK -->|uploads| S3
    TASK -->|logs & metrics| CW
    CW -->|alarms| SNS
    GHA -->|docker push| ECR
    GHA -->|ecs update-service| TASK
```

### How the pieces fit

- **DNS & TLS** — a Route 53 hosted zone serves the apex domain, aliased to a CloudFront distribution. The ACM certificate is DNS-validated and issued in us-east-1 (a CloudFront requirement, hence the second provider alias in `main.tf`).
- **CDN behavior** — SSR routes use the `CachingDisabled` policy and forward all cookies/headers/query strings, so auth and dynamic pages behave exactly as at origin. `/_next/static/*` (immutable hashed assets) uses `CachingOptimized` for long-lived edge caching.
- **Compute** — an ECS cluster on the EC2 launch type, backed by a single-instance Auto Scaling Group (t3.micro). The ECS service runs one task (bridge networking, port 3000) with a rolling stop-then-start deploy (~15s downtime, no ALB) and a deployment circuit breaker that auto-rolls-back failed releases.
- **Networking** — the host sits in one public subnet with an Elastic IP it associates to itself on boot (`user_data.sh.tpl`). Its security group only accepts port 80 from CloudFront's origin-facing IP ranges, so the public internet can't bypass the CDN. nginx on the host proxies 80 → 3000; the container port is only reachable from the host SG.
- **Secrets** — app env vars (auth, Turso, S3 credentials) live in SSM Parameter Store as SecureStrings under `/ren-ai/*` and are injected into the container at task start by the ECS execution role.
- **CI/CD** — GitHub Actions assumes an OIDC-federated IAM role (scoped to pushes to `main` on this repo) to push images to ECR and call `ecs:UpdateService`. ECR keeps the last 5 tagged images.
- **Monitoring** — CloudWatch alarms for site down (`RunningTaskCount < 1` via Container Insights), high CPU, and high memory (via the CloudWatch agent installed in user data), plus an EventBridge rule for deployment circuit-breaker failures — all notify an SNS topic with an email subscription.
- **Shell access** — no bastion or SSH key; the instance role includes `AmazonSSMManagedInstanceCore`, so use SSM Session Manager.

Terraform state is local (not committed); each operator keeps their own state file. Secrets come from `terraform.tfvars` (copy `terraform.tfvars.example`).
