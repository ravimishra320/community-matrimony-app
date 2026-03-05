# Lambda Functions Deployment

# Auth - Register
resource "aws_lambda_function" "auth_register" {
  filename         = "../lambdas/dist/auth-register.zip"
  function_name    = "${var.app_name}-${var.environment}-auth-register"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "auth/register.handler"
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 512

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_SECRET_NAME = aws_secretsmanager_secret.db_credentials.name
      AWS_REGION     = var.aws_region
    }
  }
}

# Profile - Get
resource "aws_lambda_function" "profile_get" {
  filename         = "../lambdas/dist/profile-get.zip"
  function_name    = "${var.app_name}-${var.environment}-profile-get"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "profile/get-profile.handler"
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 512

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_SECRET_NAME = aws_secretsmanager_secret.db_credentials.name
      AWS_REGION     = var.aws_region
    }
  }
}

# Profile - Update
resource "aws_lambda_function" "profile_update" {
  filename         = "../lambdas/dist/profile-update.zip"
  function_name    = "${var.app_name}-${var.environment}-profile-update"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "profile/update-profile.handler"
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 512

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_SECRET_NAME = aws_secretsmanager_secret.db_credentials.name
      AWS_REGION     = var.aws_region
    }
  }
}

# Recommendations - Get
resource "aws_lambda_function" "recommendations_get" {
  filename         = "../lambdas/dist/recommendations-get.zip"
  function_name    = "${var.app_name}-${var.environment}-recommendations-get"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "recommendations/get-recommendations.handler"
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 512

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_SECRET_NAME = aws_secretsmanager_secret.db_credentials.name
      AWS_REGION     = var.aws_region
    }
  }
}

# Recommendations - Swipe
resource "aws_lambda_function" "recommendations_swipe" {
  filename         = "../lambdas/dist/recommendations-swipe.zip"
  function_name    = "${var.app_name}-${var.environment}-recommendations-swipe"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "recommendations/swipe.handler"
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 512

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_SECRET_NAME = aws_secretsmanager_secret.db_credentials.name
      AWS_REGION     = var.aws_region
    }
  }
}

# Upload - Presigned URL
resource "aws_lambda_function" "upload_presigned" {
  filename         = "../lambdas/dist/upload-presigned.zip"
  function_name    = "${var.app_name}-${var.environment}-upload-presigned"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "upload/presigned-url.handler"
  runtime         = "nodejs20.x"
  timeout         = 10
  memory_size     = 256

  environment {
    variables = {
      S3_BUCKET_NAME = aws_s3_bucket.user_uploads.id
      AWS_REGION     = var.aws_region
    }
  }
}

# Verification - Status
resource "aws_lambda_function" "verification_status" {
  filename         = "../lambdas/dist/verification-status.zip"
  function_name    = "${var.app_name}-${var.environment}-verification-status"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "verification/status.handler"
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 512

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_SECRET_NAME = aws_secretsmanager_secret.db_credentials.name
      AWS_REGION     = var.aws_region
    }
  }
}

# Verification - Submit
resource "aws_lambda_function" "verification_submit" {
  filename         = "../lambdas/dist/verification-submit.zip"
  function_name    = "${var.app_name}-${var.environment}-verification-submit"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "verification/submit.handler"
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 512

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_SECRET_NAME = aws_secretsmanager_secret.db_credentials.name
      AWS_REGION     = var.aws_region
    }
  }
}
