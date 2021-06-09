variable "environment" {
  type = string
}

variable "resource_prefix" {
  type = string
}

variable "core_resource_group_name" {
  type = string
}

variable "tags" {
    type = map
}

locals {
  resource_prefix_no_dashes = replace(var.resource_prefix, "-", "")
}


data "azurerm_dns_zone" "cloudwithchris" {
  name                = "cloudwithchris.com"
  resource_group_name = var.core_resource_group_name
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
    Id      = "${local.resource_prefix_no_dashes}readall"
    Statement = [
      {
        Sid         = "AllowAllToRead"
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

resource "azurerm_dns_cname_record" "aws_record" {
  name                = "${var.environment}.aws"
  zone_name           = data.azurerm_dns_zone.cloudwithchris.name
  resource_group_name = var.core_resource_group_name
  ttl                 = 300
  record              = aws_s3_bucket.main_stg.website_domain
}