#!/bin/bash
set -euo pipefail

# Register with the ECS cluster before the agent starts
cat >> /etc/ecs/ecs.config <<EOF
ECS_CLUSTER=${ecs_cluster_name}
ECS_ENABLE_CONTAINER_METADATA=true
EOF

# Install nginx (reverse-proxies port 80 → container port 3000)
# AL2's base repos don't carry nginx; it's only available via amazon-linux-extras.
amazon-linux-extras install -y nginx1
yum install -y nginx

cat > /etc/nginx/nginx.conf <<'NGINXEOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /run/nginx.pid;

include /usr/share/nginx/modules/*.conf;

events {
    worker_connections 1024;
}

http {
    include      /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile     on;
    keepalive_timeout 65;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent"';
    access_log /var/log/nginx/access.log main;

    server {
        listen      80 default_server;
        server_name _;

        location / {
            proxy_pass         http://127.0.0.1:3000;
            proxy_http_version 1.1;
            proxy_set_header   Host            $host;
            proxy_set_header   X-Real-IP       $remote_addr;
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_read_timeout 300s;
        }
    }
}
NGINXEOF

systemctl enable nginx
systemctl start nginx

# Associate the Elastic IP so this host has a stable public address.
# map_public_ip_on_launch gives the instance an ephemeral public IP first,
# enabling the API call below; the EIP then takes over and the ephemeral IP
# is released.
# The ECS-optimized AL2 AMI doesn't ship the AWS CLI; install it too.
amazon-linux-extras install -y awscli1
INSTANCE_ID=$(curl -sf http://169.254.169.254/latest/meta-data/instance-id)
aws ec2 associate-address \
  --instance-id "$INSTANCE_ID" \
  --allocation-id ${eip_allocation_id} \
  --region ${aws_region} \
  --allow-reassociation

# CloudWatch agent: EC2 doesn't publish memory metrics by default, but the
# "high memory" alarm needs mem_used_percent. append_dimensions ties the
# published metric to this instance's Auto Scaling group so the alarm can
# find it without knowing the instance ID. Runs last — after nginx and the
# EIP association — so a failure here can't block the host from becoming
# reachable.
yum install -y amazon-cloudwatch-agent

cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json <<'CWAGENTEOF'
{
  "metrics": {
    "append_dimensions": {
      "AutoScalingGroupName": "$${aws:AutoScalingGroupName}"
    },
    "metrics_collected": {
      "mem": {
        "measurement": ["mem_used_percent"],
        "metrics_collection_interval": 60
      }
    }
  }
}
CWAGENTEOF

/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config -m ec2 -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
