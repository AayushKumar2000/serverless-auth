variable "api_name" {
  default = "api"
  type = string
}

variable "api_description" {
  default = "api gateway"
  type = string
}

variable "api_endpoint" {
  default = "REGIONAL"
  type = string
}

variable "api_resource_path" {
  default = []
  type = list
}

variable "api_http_method" {
  default = []
  type = list
}

variable "api_integration_type" {
  default = []
  type = list
}

variable "lambda_function_name" {
  default = []
  type = list
}

variable "integration_uri" {
  default = []
  type = list
}

variable "api_deployment_stage_name" {
  default = "dev"
  type = string
}


variable "authorizer_name" {
  default = "auth"
  type = string
}

variable "lambda_authorizer-invoke_arn" {
  default = null
  type = string
}

variable "lambda_authorizer-arn" {
  default = null
  type = string
}

variable "authorizer_identity_source" {
  default = "method.request.header.Authorization"
  type = string
}

variable "authorizer_type" {
  default = "TOKEN"
  type = string
}

variable "authorizer_cache_ttl" {
  default = 0
  type = number
}

variable "enable_authorizer" {
  default = null
  type = list
}

variable "api_new_stage" {
  type = string
  default = null
}

variable "api_cors_origin" {
  type = string
}
