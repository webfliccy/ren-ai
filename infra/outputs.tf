output "ecr_repository_url" {
  description = "URL of the ECR repository (use as the docker push target)"
  value       = aws_ecr_repository.ren_ai.repository_url
}

output "ecr_repository_arn" {
  description = "ARN of the ECR repository"
  value       = aws_ecr_repository.ren_ai.arn
}
