# 1. HTTP API Gateway (Cheaper & Faster than REST API)
resource "aws_apigatewayv2_api" "http_api" {
  name          = "${var.project_name}-api-${var.stage}"
  protocol_type = "HTTP"
  
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["content-type", "authorization"]
  }
}

# 2. Stage (Deployment)
resource "aws_apigatewayv2_stage" "default" {
  api_id = aws_apigatewayv2_api.http_api.id
  name   = "$default" # Auto-deploy
  auto_deploy = true
}

# 3. Integration: API Gateway -> Lambda (Feed)
resource "aws_apigatewayv2_integration" "feed_integration" {
  api_id           = aws_apigatewayv2_api.http_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.feed_function.invoke_arn
  payload_format_version = "2.0"
}

# 4. Route: GET /feed
resource "aws_apigatewayv2_route" "feed_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /feed"
  target    = "integrations/${aws_apigatewayv2_integration.feed_integration.id}"
}

# 5. Permission: Allow API Gateway to invoke Lambda
resource "aws_lambda_permission" "api_gw_feed" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.feed_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*/feed"
}
