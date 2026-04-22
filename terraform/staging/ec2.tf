data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

resource "aws_key_pair" "main" {
  key_name   = "${var.project_name}-${var.environment}"
  public_key = file(var.public_key_path)
}

resource "aws_security_group" "ec2" {
  name        = "${var.project_name}-${var.environment}-ec2-sg"
  description = "Security group for ${var.project_name} ${var.environment} EC2 instance"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH from admin IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name      = "${var.project_name}-${var.environment}-ec2-sg"
    ManagedBy = "terraform"
  }
}

resource "aws_iam_role" "ec2_role" {
  name = "${var.project_name}-${var.environment}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "ec2_access" {
  name = "${var.project_name}-${var.environment}-ec2-access"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ec2:DescribeInstances", "ec2:DescribeTags", "ec2:DescribeInstanceStatus"]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [aws_secretsmanager_secret.app_secrets.arn]
      },
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject"]
        Resource = ["${aws_s3_bucket.init_scripts.arn}/*"]
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.project_name}-${var.environment}-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

resource "aws_instance" "main" {
  ami                    = var.ec2_ami
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public_a.id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  key_name               = aws_key_pair.main.key_name

  root_block_device {
    volume_size           = var.volume_size
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
  }

  user_data_replace_on_change = true
  user_data = base64encode(templatefile("${path.module}/user_data/bootstrap.sh", {
    s3_bucket                = aws_s3_bucket.init_scripts.id
    s3_key                   = aws_s3_object.init_script.key
    environment              = var.environment
    project_name             = var.project_name
    db_password              = random_password.db_password.result
    jwt_secret               = random_password.jwt_secret.result
    github_repo              = var.github_repo
    github_branch            = var.github_branch
    domain                   = var.domain
    cloudflare_tunnel_id     = var.cloudflare_tunnel_id
    cloudflare_tunnel_secret = var.cloudflare_tunnel_secret
    cloudflare_account_tag   = var.cloudflare_account_tag
    cloudflare_tunnel_token  = var.cloudflare_tunnel_token
    site_name                = var.site_name
    site_tagline             = var.site_tagline
    primary_color            = var.primary_color
    secondary_color          = var.secondary_color
  }))

  tags = merge(
    {
      Name      = "${var.project_name}-${var.environment}"
      ManagedBy = "terraform"
    },
    var.tags
  )

  lifecycle {
    ignore_changes = [ami, user_data]
  }

  timeouts {
    create = "15m"
    update = "10m"
    delete = "10m"
  }
}
