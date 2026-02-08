resource "aws_s3_bucket" "uploads_bucket" {
  bucket = "${var.project_name}-uploads-${var.stage}-${random_id.suffix.hex}"
}

# Block all public access (Crucial for Privacy)
resource "aws_s3_bucket_public_access_block" "uploads_block" {
  bucket = aws_s3_bucket.uploads_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "random_id" "suffix" {
  byte_length = 4
}
