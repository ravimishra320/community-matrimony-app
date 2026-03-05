# IAM Role for Lambda Functions
resource "aws_iam_role" "lambda_exec" {
  name = "${var.app_name}-${var.environment}-lambda-exec-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# Attach basic Lambda execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Attach VPC execution policy
resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Attach S3 pre-signed URL policy
resource "aws_iam_role_policy_attachment" "lambda_s3" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.s3_presigned_url.arn
}

# Policy for Secrets Manager access
resource "aws_iam_policy" "lambda_secrets" {
  name        = "${var.app_name}-${var.environment}-lambda-secrets-policy"
  description = "Allow Lambda to read database credentials from Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = aws_secretsmanager_secret.db_credentials.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_secrets" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_secrets.arn
}

# Policy for Cognito access
resource "aws_iam_policy" "lambda_cognito" {
  name        = "${var.app_name}-${var.environment}-lambda-cognito-policy"
  description = "Allow Lambda to interact with Cognito"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminUpdateUserAttributes",
          "cognito-idp:ListUsers"
        ]
        Resource = aws_cognito_user_pool.main.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_cognito" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_cognito.arn
}

# CloudWatch Log Groups (will be created when Lambdas are deployed)
resource "aws_cloudwatch_log_group" "lambda_logs" {
  for_each = toset([
    "auth",
    "profile",
    "recommendations",
    "verification",
    "upload"
  ])

  name              = "/aws/lambda/${var.app_name}-${var.environment}-${each.key}"
  retention_in_days = 14

  tags = {
    Name = "${var.app_name}-${var.environment}-${each.key}-logs"
  }
}
