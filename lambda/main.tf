
locals  {

  env_var = var.environment_variable==null?[]:[var.environment_variable]
}

#kms key policy
resource "aws_iam_policy" "lambda_kms_key" {
 count = var.kms_key_arn == null? 0 : 1

  name        = "lambda_kms_key-${var.function_name}"
  path        = "/"
  description = "IAM policy for dynamodb execution"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "kms:DescribeKey",
        "kms:GetPublicKey",
        "kms:Sign",
        "kms:Verify"
      ],
      "Resource": "${var.kms_key_arn}",
      "Effect": "Allow"
    }
  ]
}
EOF
}
resource "aws_iam_role_policy_attachment" "lambda_kms_key" {
  count = var.kms_key_arn == null? 0 : 1

  role       = aws_iam_role.iam_for_lambda.name
  policy_arn = aws_iam_policy.lambda_kms_key[0].arn
}



# cloud watch log group and logs

resource "aws_cloudwatch_log_group" "lf_cloudwatch_log_group" {
name              = "/aws/lambda/${var.function_name}"
retention_in_days = 14
}

resource "aws_iam_policy" "lambda_logging" {
name        = "lambda_logging-${var.function_name}"
path        = "/"
description = "IAM policy for logging from a lambda"

policy = <<EOF
{
"Version": "2012-10-17",
"Statement": [
  {
    "Action": [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ],
    "Resource": "arn:aws:logs:*:*:*",
    "Effect": "Allow"
  }
]
}
EOF
}
resource "aws_iam_role_policy_attachment" "lambda_log" {
  role       = aws_iam_role.iam_for_lambda.name
  policy_arn = aws_iam_policy.lambda_logging.arn
}

# dynamodb policy
resource "aws_iam_policy" "lambda_dynamodb" {
 count = var.lambda_dynamodb_policy ? 1 : 0

  name        = "lambda_dynamodb-${var.function_name}"
  path        = "/"
  description = "IAM policy for dynamodb execution"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "${var.dynamodb_arn}",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_dynamodb" {
  count = var.lambda_dynamodb_policy ? 1 : 0

  role       = aws_iam_role.iam_for_lambda.name
  policy_arn = aws_iam_policy.lambda_dynamodb[0].arn
}



   # role for the lambda function

resource "aws_iam_role" "iam_for_lambda" {
  name = "${var.function_name}-lambda-role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}


resource "aws_lambda_function" "lambda" {
  filename      = var.filename
  function_name = var.function_name
  role          = aws_iam_role.iam_for_lambda.arn
  handler       = var.handler
  runtime = "nodejs12.x"



  dynamic "environment" {
    for_each = local.env_var
    content {
      variables = environment.value
    }
  }



  depends_on=[
    aws_cloudwatch_log_group.lf_cloudwatch_log_group
 ]
  }


  output "lambda_arn"{
    value = aws_lambda_function.lambda.arn
  }

  output "lambda_name"{
    value=aws_lambda_function.lambda.function_name
  }

  output "lambda_invoke_arn" {
   value = aws_lambda_function.lambda.invoke_arn
  }

 output "lambda_role_arn" {
   value = aws_iam_role.iam_for_lambda.arn
 }
