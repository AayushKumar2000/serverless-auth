variable "function_name" {
  default = "lambda"
  type = string
}

variable "lambda_dynamodb_policy" {
  default = false
  type = bool
}
variable "dynamodb_arn" {
  default = null
  type = string
}


variable "filename" {
  type = string
  default = null
}

variable "handler" {
  default = null
  type = string
}


variable "environment_variable" {
  type = map(string)
  default =  null
}

variable "kms_key_arn" {
  default = null
  type = string
}
