variable "environment" {
  type = string
}

variable "resource_prefix" {
  type = string
}

variable "tags" {
    type = map
}

locals {
  resource_prefix_no_dashes = replace(var.resource_prefix, "-", "")
}

resource "aws_s3_bucket" "main_stg" {
  bucket = "${local.resource_prefix_no_dashes}"
  acl    = "public-read"

  website {
    index_document = "index.html"
    error_document = "error.html"
  }

  tags = var.tags
}

resource "aws_s3_bucket_policy" "main_stg_policy" {
  bucket = aws_s3_bucket.main_stg.id

  policy = jsonencode({
    Version = "2012-10-17"
    Id      = "${local.resource_prefix_no_dashes}-readall"
    Statement = [
      {
        Effect      = "Allow"
        Principal   = "*"
        Action      = "s3:GetObject",
        resource    = [
          "${aws_s3_bucket.main_stg.arn}"
        ]
      }
    ]
  })
}