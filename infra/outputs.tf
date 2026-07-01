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
