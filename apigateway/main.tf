resource "aws_api_gateway_rest_api" "api_gateway" {
  name        = var.api_name
  description = var.api_description

  endpoint_configuration {
    types = [ var.api_endpoint ]
  }
 }

 #  api-gateway resource
resource "aws_api_gateway_resource" "resource" {
  count = length(var.api_resource_path)

  path_part   = var.api_resource_path[count.index]
  parent_id   = aws_api_gateway_rest_api.api_gateway.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.api_gateway.id
}


resource "aws_api_gateway_method" "method" {
  count = length(var.api_http_method)

  rest_api_id   = aws_api_gateway_rest_api.api_gateway.id
  resource_id   = aws_api_gateway_resource.resource[count.index].id
  http_method   = var.api_http_method[count.index]
  authorization = var.enable_authorizer[count.index] ? "CUSTOM":"NONE"
  authorizer_id = var.enable_authorizer[count.index] ? aws_api_gateway_authorizer.authorizer.id : null

  request_models = {
  "application/json" =  "Empty"
}
}
# resource "aws_api_gateway_method_response" "response_200" {
#   count =  length(var.api_resource_path)
#
#   rest_api_id = aws_api_gateway_rest_api.api_gateway.id
#   resource_id = aws_api_gateway_resource.resource[count.index].id
#   http_method             = aws_api_gateway_method.method[count.index].http_method
#   status_code = "200"
# }

resource "aws_api_gateway_integration" "integration" {
count =  length(var.api_resource_path)

  rest_api_id             = aws_api_gateway_rest_api.api_gateway.id
  resource_id             = aws_api_gateway_resource.resource[count.index].id
  http_method             = aws_api_gateway_method.method[count.index].http_method
  integration_http_method = "POST"
  type                    = var.api_integration_type[count.index]
 uri                     = var.integration_uri[count.index]

  request_templates = {
   "application/json" = "Empty"

  }
}

resource "aws_api_gateway_gateway_response" "test" {
  rest_api_id   = aws_api_gateway_rest_api.api_gateway.id
  status_code   = "401"
  response_type = "UNAUTHORIZED"

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Credentials" = "'true'",
    "gatewayresponse.header.Access-Control-Allow-Origin" = "'http://localhost:3000'"
  }
}



# to enable coros
module "cors" {
  count = length(var.api_resource_path)
  source = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.1"

  api_id          = aws_api_gateway_rest_api.api_gateway.id
  api_resource_id = aws_api_gateway_resource.resource[count.index].id
  allow_origin = "http://localhost:3000"
  allow_credentials = "true"

}


# aws account ID
data "aws_caller_identity" "current" {}

# aws region
data "aws_region" "current" {}


resource "aws_lambda_permission" "apigw_lambda" {
  count = length(var.lambda_function_name) != 0 ? length(var.lambda_function_name) : 0

  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name[count.index]
  principal     = "apigateway.amazonaws.com"

  # More: http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
  source_arn = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:${aws_api_gateway_rest_api.api_gateway.id}/*/${aws_api_gateway_method.method[count.index].http_method}${aws_api_gateway_resource.resource[count.index].path}"
}




# lambda authorizer

resource "aws_api_gateway_authorizer" "authorizer" {
  name                   = var.authorizer_name
  rest_api_id            = aws_api_gateway_rest_api.api_gateway.id
  authorizer_uri         = var.lambda_authorizer-invoke_arn
  authorizer_credentials = aws_iam_role.invocation_role.arn

  identity_source = var.authorizer_identity_source
  type = var.authorizer_type
  authorizer_result_ttl_in_seconds = var.authorizer_cache_ttl
}

resource "aws_iam_role" "invocation_role" {
  name = "api_gateway_auth_invocation"
  path = "/"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "apigateway.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "invocation_policy" {
  name = "default"
  role = aws_iam_role.invocation_role.id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "lambda:InvokeFunction",
      "Effect": "Allow",
      "Resource": "${var.lambda_authorizer-arn}"
    }
  ]
}
EOF
}



resource "aws_api_gateway_stage" "test" {
    count = var.api_new_stage == null ? 0 : 1

  stage_name    = var.api_new_stage
  rest_api_id   = aws_api_gateway_rest_api.api_gateway.id
  deployment_id = aws_api_gateway_deployment.MyDemoDeployment.id

}



#api gate-way deployment
resource "aws_api_gateway_deployment" "MyDemoDeployment" {

 rest_api_id = aws_api_gateway_rest_api.api_gateway.id
 stage_name = var.api_deployment_stage_name


 triggers = {
   redeployment = sha1(join(",", list(
     jsonencode(aws_api_gateway_integration.integration),
     jsonencode(aws_api_gateway_resource.resource),
     jsonencode(aws_api_gateway_method.method)

   )))
 }

 lifecycle {
   create_before_destroy = true
 }

}




output "api-deployment-url"{
  value= aws_api_gateway_deployment.MyDemoDeployment.invoke_url
}
