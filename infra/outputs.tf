output "elastic_ip" {
  description = "Stable public IP of the ECS host — curl http://<this> to verify the app"
  value       = aws_eip.app.public_ip
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = aws_ecs_service.app.name
}

output "ecr_repository_url" {
  description = "URL of the ECR repository (use as the docker push target)"
  value       = aws_ecr_repository.ren_ai.repository_url
}

output "ecr_repository_arn" {
  description = "ARN of the ECR repository"
  value       = aws_ecr_repository.ren_ai.arn
}

output "route53_name_servers" {
  description = "Delegate the domain's NS records at the registrar to these — required before ACM DNS validation and public DNS resolution will work"
  value       = aws_route53_zone.main.name_servers
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain (CNAME target if you also want a www alias)"
  value       = aws_cloudfront_distribution.app.domain_name
}

output "app_url" {
  description = "Production URL — https://<domain> once DNS has propagated"
  value       = "https://${var.domain_name}"
}

output "github_actions_role_arn" {
  description = "Set as the AWS_DEPLOY_ROLE_ARN GitHub Actions secret"
  value       = aws_iam_role.github_actions_deploy.arn
}
