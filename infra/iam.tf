data "aws_iam_policy_document" "ecs_tasks_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "ec2_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

data "aws_kms_key" "ssm" {
  key_id = "alias/aws/ssm"
}

# ── ECS task execution role ───────────────────────────────────────────────────
# Used by the ECS agent to pull the image from ECR, fetch SSM secrets, and
# write container logs to CloudWatch.

resource "aws_iam_role" "ecs_execution" {
  name               = "ren-ai-ecs-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume.json
}

resource "aws_iam_role_policy_attachment" "ecs_execution_managed" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "ecs_execution_ssm" {
  name = "ren-ai-ssm-read"
  role = aws_iam_role.ecs_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ssm:GetParameters", "ssm:GetParameter"]
        Resource = "arn:aws:ssm:*:*:parameter/ren-ai/*"
      },
      {
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = data.aws_kms_key.ssm.arn
      }
    ]
  })
}

# ── ECS task role ─────────────────────────────────────────────────────────────
# Used by the application container itself (S3 file uploads).

resource "aws_iam_role" "ecs_task" {
  name               = "ren-ai-ecs-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume.json
}

resource "aws_iam_role_policy" "task_s3" {
  name = "ren-ai-s3-uploads"
  role = aws_iam_role.ecs_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:PutObject", "s3:GetObject", "s3:HeadObject"]
      Resource = "arn:aws:s3:::${var.app_secrets["S3_BUCKET"]}/*"
    }]
  })
}

# ── EC2 instance role ─────────────────────────────────────────────────────────
# Used by the EC2 host to register with the ECS cluster, allow SSM Session
# Manager access (no bastion needed), and associate the Elastic IP on boot.

resource "aws_iam_role" "ec2_instance" {
  name               = "ren-ai-ec2-instance"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}

resource "aws_iam_role_policy_attachment" "ec2_ecs" {
  role       = aws_iam_role.ec2_instance.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_role_policy_attachment" "ec2_ssm_core" {
  role       = aws_iam_role.ec2_instance.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "ec2_cloudwatch_agent" {
  role       = aws_iam_role.ec2_instance.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

resource "aws_iam_role_policy" "ec2_eip" {
  name = "ren-ai-eip-associate"
  role = aws_iam_role.ec2_instance.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ec2:AssociateAddress"]
      Resource = "*"
    }]
  })
}

resource "aws_iam_instance_profile" "ec2" {
  name = "ren-ai-ec2"
  role = aws_iam_role.ec2_instance.name
}
