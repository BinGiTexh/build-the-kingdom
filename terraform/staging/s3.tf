resource "random_id" "bucket_suffix" {
  byte_length = 8
}

resource "aws_s3_bucket" "init_scripts" {
  bucket = "${var.project_name}-${var.environment}-init-scripts-${random_id.bucket_suffix.hex}"

  tags = {
    Name      = "${var.project_name}-${var.environment}-init-scripts"
    ManagedBy = "terraform"
  }
}

resource "aws_s3_bucket_versioning" "init_scripts" {
  bucket = aws_s3_bucket.init_scripts.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "init_scripts" {
  bucket = aws_s3_bucket.init_scripts.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "init_scripts" {
  bucket                  = aws_s3_bucket.init_scripts.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_object" "init_script" {
  bucket = aws_s3_bucket.init_scripts.id
  key    = "scripts/init.sh"
  source = "${path.module}/user_data/init.sh"
  etag   = filemd5("${path.module}/user_data/init.sh")

  tags = {
    Name      = "init-script"
    ManagedBy = "terraform"
  }
}
