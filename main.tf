
provider "aws" {
  region = "us-east-1"
}

#dynamodb
module "dynamodb_module" {
  source = "./dynamodb"

  db_name = "auth-user2"
  hash_key = "userID"
  hash_key_type = "S"
}


# lambda function
module "lambda_oauth" {
  source = "./lambda"

  function_name = "oauth2"
  dynamodb_arn = module.dynamodb_module.dynamodb_table_arn
  lambda_dynamodb_policy  = true
  filename = "./files/oauth2.zip"
  handler = "index.handler"
  environment_variable = {
     clientID = "866376299020-r892qoobkoc9j8s1gfilgtdmijbq8d8n.apps.googleusercontent.com",
     clientSecret = "YNnsZ5jV_yyvpJWrwe2dSrw9"
     kms_KeyID = module.kms_key.kms_key_id
     db_name =  "auth-user2"
	 
	 origin = "http://localhost:3000"
	 
	 # after google authentication user redirect
	 redirect_url = "http://localhost:3000"
	 
	  # time in minutes
	 jwt_expire = 5
  }
 kms_key_arn = module.kms_key.kms_key_arn
}

module "lambda_authorizer" {
  source = "./lambda"

  function_name = "authorizer2"
  lambda_dynamodb_policy  = false
  filename = "./files/authorizer2.zip"
  handler = "index.handler"
  environment_variable = {
     kms_KeyID = module.kms_key.kms_key_id
  }
  kms_key_arn = module.kms_key.kms_key_arn
}

module "lambda_test-lambda" {
  source = "./lambda"

  function_name = "test-lambda2"
  lambda_dynamodb_policy  = false
  filename = "./files/test-lambda2.zip"
  handler = "index.handler"
}


#api gateway

module "apigateway_auth" {
  source = "./apigateway"

  api_name = "test-auth2"
  api_description = "api for auth"
  api_endpoint = "REGIONAL"
  api_resource_path = ["{proxy+}","test"]
  api_http_method = ["ANY","GET"]
  api_integration_type = ["AWS_PROXY","AWS_PROXY"]
  lambda_function_name = ["oauth2","test-lambda2"]
  integration_uri = [module.lambda_oauth.lambda_invoke_arn,module.lambda_test-lambda.lambda_invoke_arn]
  enable_authorizer = [false,true]
  authorizer_name = "test-authorizer"
  lambda_authorizer-invoke_arn =  module.lambda_authorizer.lambda_invoke_arn
  lambda_authorizer-arn =  module.lambda_authorizer.lambda_arn
  authorizer_identity_source = "method.request.header.authorization,method.request.querystring.fingerprintID"
  authorizer_type = "REQUEST"

  api_deployment_stage_name = "dev"
  # api_new_stage = "prod"

}


# kms key

module "kms_key" {
  source = "./kms"

  key_usage = "SIGN_VERIFY"
  customer_master_key_spec = "RSA_4096"
}


# outputs
output "api-deployment-url"{
  value= module.apigateway_auth.api-deployment-url
}

# inserting api url in the react .env file
resource "null_resource" "react_env_file" {

triggers = {
  always_run = "${timestamp()}"
}
  provisioner "local-exec" {
    command = "echo REACT_APP_API_GATEWAY_URL=${module.apigateway_auth.api-deployment-url} > ./client/.env"
    // working_dir="D:\\React\\test-auth"

  }
}
