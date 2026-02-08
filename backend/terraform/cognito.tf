resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-user-pool-${var.stage}"

  # Allow sign-in with Phone Number
  username_attributes = ["phone_number"]
  
  # Password policy (simplified for demo)
  password_policy {
    minimum_length    = 8
    require_lowercase = false
    require_numbers   = false
    require_symbols   = false
    require_uppercase = false
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
  }
  
  auto_verified_attributes = ["phone_number"]
}

resource "aws_cognito_user_pool_client" "client" {
  name = "${var.project_name}-app-client-${var.stage}"
  user_pool_id = aws_cognito_user_pool.main.id
  
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH", 
    "ALLOW_REFRESH_TOKEN_AUTH", 
    "ALLOW_USER_SRP_AUTH"
  ]
}
