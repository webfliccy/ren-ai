resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/ren-ai"
  retention_in_days = 30
}

resource "aws_ecs_cluster" "main" {
  name = "ren-ai"

  # Required for the RunningTaskCount metric backing the "site down" alarm.
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_capacity_provider" "ec2" {
  name = "ren-ai-ec2"

  auto_scaling_group_provider {
    auto_scaling_group_arn         = aws_autoscaling_group.app.arn
    managed_termination_protection = "DISABLED"

    managed_scaling {
      status = "DISABLED"
    }
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name       = aws_ecs_cluster.main.name
  capacity_providers = [aws_ecs_capacity_provider.ec2.name]

  default_capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.ec2.name
    weight            = 1
  }
}

resource "aws_ecs_task_definition" "app" {
  family                   = "ren-ai"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn
  cpu                      = "512"
  memory                   = "768"

  container_definitions = jsonencode([{
    name      = "ren-ai"
    image     = "${aws_ecr_repository.ren_ai.repository_url}:${var.image_tag}"
    cpu       = 512
    memory    = 768
    essential = true

    portMappings = [{
      containerPort = 3000
      hostPort      = 3000
      protocol      = "tcp"
    }]

    environment = [{
      name  = "AWS_REGION"
      value = var.aws_region
    }]

    secrets = [for env_name, _ in local.ssm_paths : {
      name      = env_name
      valueFrom = aws_ssm_parameter.app[env_name].arn
    }]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.app.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_ecs_service" "app" {
  name            = "ren-ai"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 1

  # Rolling deploy: stop old task then start new (~15s downtime, no ALB needed)
  deployment_minimum_healthy_percent = 0
  deployment_maximum_percent         = 100

  # Rolls back and fires the "deploy failure" alarm if the new task fails
  # to reach a steady state (e.g. crash-loops on startup).
  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.ec2.name
    weight            = 1
  }

  # CI/CD updates task_definition on each release; ignore drift here
  lifecycle {
    ignore_changes = [task_definition]
  }

  depends_on = [aws_ecs_cluster_capacity_providers.main]
}
