resource "random_password" "db_password" {
  length  = 32
  special = false
}

resource "random_password" "jwt_secret" {
  length  = 64
  special = false
}

resource "aws_secretsmanager_secret" "app_secrets" {
  name_prefix             = "${var.project_name}-${var.environment}-secrets-"
  recovery_window_in_days = 0

  tags = {
    Name        = "${var.project_name}-${var.environment}-secrets"
    ManagedBy   = "terraform"
  }
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode(merge(
    {
      db_password   = random_password.db_password.result
      jwt_secret    = random_password.jwt_secret.result
      site_name     = var.site_name
      site_tagline  = var.site_tagline
      primary_color = var.primary_color
      secondary_color = var.secondary_color
    },
    var.cloudflare_tunnel_token != "" ? { cloudflare_tunnel_token = var.cloudflare_tunnel_token } : {}
  ))
}
