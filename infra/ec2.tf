data "aws_ssm_parameter" "ecs_ami" {
  name = "/aws/service/ecs/optimized-ami/amazon-linux-2/recommended/image_id"
}

resource "aws_eip" "app" {
  domain = "vpc"
}

resource "aws_launch_template" "app" {
  name_prefix   = "ren-ai-"
  image_id      = data.aws_ssm_parameter.ecs_ami.value
  instance_type = var.instance_type

  iam_instance_profile {
    name = aws_iam_instance_profile.ec2.name
  }

  vpc_security_group_ids = [
    aws_security_group.ec2.id,
    aws_security_group.ecs.id,
  ]

  user_data = base64encode(templatefile("${path.module}/user_data.sh.tpl", {
    ecs_cluster_name  = aws_ecs_cluster.main.name
    eip_allocation_id = aws_eip.app.allocation_id
    aws_region        = var.aws_region
  }))

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "ren-ai-ecs-host"
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_group" "app" {
  name                = "ren-ai"
  vpc_zone_identifier = [aws_subnet.public.id]
  min_size            = 1
  max_size            = 1
  desired_capacity    = 1

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  # Required so ECS can manage this ASG as a capacity provider
  tag {
    key                 = "AmazonECSManaged"
    value               = "true"
    propagate_at_launch = true
  }

  tag {
    key                 = "Name"
    value               = "ren-ai-ecs-host"
    propagate_at_launch = true
  }

  lifecycle {
    ignore_changes = [desired_capacity]
  }
}
