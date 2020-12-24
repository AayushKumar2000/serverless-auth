variable "key_usage" {
  type = string
}

variable "customer_master_key_spec" {
  type = string
}


resource "aws_kms_key" "kms_key" {
  description  = "kms key"
  key_usage = var.key_usage
  customer_master_key_spec = var.customer_master_key_spec

}


output "kms_key_arn" {
  value = aws_kms_key.kms_key.arn
}

output "kms_key_id" {
  value = aws_kms_key.kms_key.id
}
