
variable "db_name"{
  default = "dynamodb"
  type = string
}

variable "hash_key" {
  default = "id"
  type = string
}

variable "hash_key_type" {
  default = "S"
  type = string
}


resource "aws_dynamodb_table" "dynamodb" {
  name           = var.db_name
  read_capacity  = 20
  write_capacity = 20
  hash_key       = var.hash_key


  attribute {
    name = var.hash_key
    type = var.hash_key_type
  }



}

output "dynamodb_table_arn" {
  value= aws_dynamodb_table.dynamodb.arn
}
