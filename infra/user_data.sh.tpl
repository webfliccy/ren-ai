#!/bin/bash
set -euo pipefail

# Register with the ECS cluster before the agent starts
cat >> /etc/ecs/ecs.config <<EOF
ECS_CLUSTER=${ecs_cluster_name}
ECS_ENABLE_CONTAINER_METADATA=true
EOF

# Install nginx (reverse-proxies port 80 → container port 3000)
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
INSTANCE_ID=$(curl -sf http://169.254.169.254/latest/meta-data/instance-id)
aws ec2 associate-address \
  --instance-id "$INSTANCE_ID" \
  --allocation-id ${eip_allocation_id} \
  --region ${aws_region} \
  --allow-reassociation
