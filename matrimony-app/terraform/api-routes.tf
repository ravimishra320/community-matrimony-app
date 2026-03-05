# API Gateway Routes and Integrations

# Auth Routes
resource "aws_apigatewayv2_integration" "auth_register" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.auth_register.invoke_arn
}

resource "aws_apigatewayv2_route" "auth_register" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /auth/register"
  target    = "integrations/${aws_apigatewayv2_integration.auth_register.id}"
}

resource "aws_lambda_permission" "auth_register" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.auth_register.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# Profile Routes
resource "aws_apigatewayv2_integration" "profile_get" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.profile_get.invoke_arn
}

resource "aws_apigatewayv2_route" "profile_get" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /profile/me"
  target             = "integrations/${aws_apigatewayv2_integration.profile_get.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_lambda_permission" "profile_get" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.profile_get.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_apigatewayv2_integration" "profile_update" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.profile_update.invoke_arn
}

resource "aws_apigatewayv2_route" "profile_update" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "PUT /profile/me"
  target             = "integrations/${aws_apigatewayv2_integration.profile_update.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_lambda_permission" "profile_update" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.profile_update.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# Recommendations Routes
resource "aws_apigatewayv2_integration" "recommendations_get" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.recommendations_get.invoke_arn
}

resource "aws_apigatewayv2_route" "recommendations_get" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /recommendations"
  target             = "integrations/${aws_apigatewayv2_integration.recommendations_get.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_lambda_permission" "recommendations_get" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.recommendations_get.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_apigatewayv2_integration" "recommendations_swipe" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.recommendations_swipe.invoke_arn
}

resource "aws_apigatewayv2_route" "recommendations_swipe" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /recommendations/swipe"
  target             = "integrations/${aws_apigatewayv2_integration.recommendations_swipe.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_lambda_permission" "recommendations_swipe" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.recommendations_swipe.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# Upload Routes
resource "aws_apigatewayv2_integration" "upload_presigned" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.upload_presigned.invoke_arn
}

resource "aws_apigatewayv2_route" "upload_presigned" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /upload/presigned-url"
  target             = "integrations/${aws_apigatewayv2_integration.upload_presigned.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_lambda_permission" "upload_presigned" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.upload_presigned.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# Verification Routes
resource "aws_apigatewayv2_integration" "verification_status" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.verification_status.invoke_arn
}

resource "aws_apigatewayv2_route" "verification_status" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /verification/status"
  target             = "integrations/${aws_apigatewayv2_integration.verification_status.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_lambda_permission" "verification_status" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.verification_status.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_apigatewayv2_integration" "verification_submit" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.verification_submit.invoke_arn
}

resource "aws_apigatewayv2_route" "verification_submit" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /verification/submit"
  target             = "integrations/${aws_apigatewayv2_integration.verification_submit.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_lambda_permission" "verification_submit" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.verification_submit.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
