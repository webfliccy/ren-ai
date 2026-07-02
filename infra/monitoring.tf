# ── SNS: alarm notifications ──────────────────────────────────────────────────

resource "aws_sns_topic" "alerts" {
  name = "ren-ai-alerts"
}

resource "aws_sns_topic_subscription" "alerts_email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# EventBridge (used by the deploy-failure alarm below) needs an explicit grant
# to publish to the topic; CloudWatch alarms in the same account don't.
resource "aws_sns_topic_policy" "alerts" {
  arn = aws_sns_topic.alerts.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "AllowEventBridgePublish"
      Effect    = "Allow"
      Principal = { Service = "events.amazonaws.com" }
      Action    = "sns:Publish"
      Resource  = aws_sns_topic.alerts.arn
      Condition = {
        ArnEquals = {
          "aws:SourceArn" = aws_cloudwatch_event_rule.deploy_failure.arn
        }
      }
    }]
  })
}

# ── Alarm: site down ──────────────────────────────────────────────────────────
# Container Insights (enabled on the cluster in ecs.tf) is required for the
# RunningTaskCount metric.

resource "aws_cloudwatch_metric_alarm" "site_down" {
  alarm_name          = "ren-ai-site-down"
  alarm_description   = "ren-ai ECS service has no running tasks"
  namespace           = "ECS/ContainerInsights"
  metric_name         = "RunningTaskCount"
  statistic           = "Average"
  period              = 60
  evaluation_periods  = 2
  threshold           = 1
  comparison_operator = "LessThanThreshold"
  # "missing" (not "breaching"): RunningTaskCount has no history right after
  # this alarm is first created, which would otherwise page immediately.
  # A genuinely stopped service still reports a real 0 datapoint, not a gap.
  treat_missing_data = "missing"

  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = aws_ecs_service.app.name
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
}

# ── Alarm: high CPU ───────────────────────────────────────────────────────────
# CloudWatch aggregates standard EC2 metrics by AutoScalingGroupName
# automatically for instances launched by an ASG — no extra agent needed.

resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "ren-ai-high-cpu"
  alarm_description   = "ren-ai EC2 host CPU above 80% for 5 minutes"
  namespace           = "AWS/EC2"
  metric_name         = "CPUUtilization"
  statistic           = "Average"
  period              = 300
  evaluation_periods  = 1
  threshold           = 80
  comparison_operator = "GreaterThanThreshold"

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.app.name
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
}

# ── Alarm: high memory ────────────────────────────────────────────────────────
# EC2 doesn't publish memory metrics by default; the CloudWatch agent
# (installed via user_data.sh.tpl) publishes CWAgent/mem_used_percent.

resource "aws_cloudwatch_metric_alarm" "high_memory" {
  alarm_name          = "ren-ai-high-memory"
  alarm_description   = "ren-ai EC2 host memory above 80% for 5 minutes"
  namespace           = "CWAgent"
  metric_name         = "mem_used_percent"
  statistic           = "Average"
  period              = 300
  evaluation_periods  = 1
  threshold           = 80
  comparison_operator = "GreaterThanThreshold"

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.app.name
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
}

# ── Alarm: deploy failure ─────────────────────────────────────────────────────
# The circuit breaker (enabled on the service in ecs.tf) emits an
# SERVICE_DEPLOYMENT_FAILED event on EventBridge when a new task fails to
# reach a steady state — there's no CloudWatch metric for this, so an
# EventBridge rule stands in for a metric alarm. Event shape (AWS docs,
# "Amazon ECS service deployment state change events"): the deployment
# outcome is `detail.eventName` (`eventType` is only ever INFO/ERROR), and
# the service is identified by ARN in the top-level `resources` array, not
# a field inside `detail`.
resource "aws_cloudwatch_event_rule" "deploy_failure" {
  name        = "ren-ai-deploy-failure"
  description = "ren-ai ECS deployment circuit breaker tripped"

  event_pattern = jsonencode({
    source        = ["aws.ecs"]
    "detail-type" = ["ECS Deployment State Change"]
    resources     = [aws_ecs_service.app.id]
    detail = {
      eventName = ["SERVICE_DEPLOYMENT_FAILED"]
    }
  })
}

resource "aws_cloudwatch_event_target" "deploy_failure_sns" {
  rule = aws_cloudwatch_event_rule.deploy_failure.name
  arn  = aws_sns_topic.alerts.arn

  # Ensure EventBridge's publish grant exists before the target can invoke it.
  depends_on = [aws_sns_topic_policy.alerts]
}
