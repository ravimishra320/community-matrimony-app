resource "aws_dynamodb_table" "users_table" {
  name           = "${var.project_name}-users-${var.stage}"
  billing_mode   = "PAY_PER_REQUEST" # Serverless pricing
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "gender"
    type = "S"
  }

  # Global Secondary Index for querying by Gender
  global_secondary_index {
    name               = "GenderIndex"
    hash_key           = "gender"
    projection_type    = "ALL"
  }

  tags = {
    Name = "${var.project_name}-users"
  }
}
