variable "aws_region" {
  description = "AWS region to deploy resources into"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type for the ECS host; upgrade to t3.small if memory pressure is observed in CloudWatch"
  type        = string
  default     = "t3.micro"
}

variable "image_tag" {
  description = "ECR image tag to run; CI/CD updates the ECS task definition on each release"
  type        = string
  default     = "latest"
}

variable "domain_name" {
  description = "Apex domain the app is served from (ACM cert, Route 53 zone, CloudFront alias)"
  type        = string
  default     = "ren-ai.dev"
}

variable "app_secrets" {
  description = "Secret env-var values written to SSM; never committed — copy terraform.tfvars.example to terraform.tfvars and fill in real values"
  type        = map(string)
  sensitive   = true
}
