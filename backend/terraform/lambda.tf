# 1. Zip the Source Code automatically
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "../src" # Points to your backend/src folder
  output_path = "${path.module}/lambda_function.zip"
}

# 2. Feed Function
resource "aws_lambda_function" "feed_function" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.project_name}-feed-${var.stage}"
  role             = aws_iam_role.lambda_exec_role.arn
  handler          = "feed.handler" # Filename.ExportName
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "nodejs18.x"

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.users_table.name
    }
  }
}

# 3. Swipe Function (Placeholder)
resource "aws_lambda_function" "swipe_function" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.project_name}-swipe-${var.stage}"
  role             = aws_iam_role.lambda_exec_role.arn
  handler          = "swipe.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "nodejs18.x"

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.users_table.name
    }
  }
}
