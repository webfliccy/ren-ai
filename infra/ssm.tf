locals {
  # Maps container env-var name → SSM parameter path.
  # Includes the three S3 vars not in the original table but required for
  # the S3 upload acceptance criterion (storage.ts requires explicit creds).
  ssm_paths = {
    ADMIN_SECRET          = "/ren-ai/admin-secret"
    AUTH_SECRET           = "/ren-ai/auth-secret"
    AUTH_GITHUB_ID        = "/ren-ai/auth-github-id"
    AUTH_GITHUB_SECRET    = "/ren-ai/auth-github-secret"
    AUTH_GOOGLE_ID        = "/ren-ai/auth-google-id"
    AUTH_GOOGLE_SECRET    = "/ren-ai/auth-google-secret"
    TURSO_DATABASE_URL    = "/ren-ai/turso-database-url"
    TURSO_AUTH_TOKEN      = "/ren-ai/turso-auth-token"
    NEXT_PUBLIC_SITE_URL  = "/ren-ai/next-public-site-url"
    NEXT_PUBLIC_S3_URL    = "/ren-ai/next-public-s3-url"
    AWS_ACCESS_KEY_ID     = "/ren-ai/aws-access-key-id"
    AWS_SECRET_ACCESS_KEY = "/ren-ai/aws-secret-access-key"
    S3_BUCKET             = "/ren-ai/s3-bucket"
  }
}

resource "aws_ssm_parameter" "app" {
  for_each = local.ssm_paths
  name     = each.value
  type     = "SecureString"
  value    = var.app_secrets[each.key]
}
