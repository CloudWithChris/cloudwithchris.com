provider "aws" {
  region = "us-east-1"
  alias = "us-east-1"
}

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
  resource_prefix_no_dashes   = replace(var.resource_prefix, "-", "")
}


data "azurerm_dns_zone" "cloudwithchris" {
  name                        = "cloudwithchris.com"
  resource_group_name         = var.core_resource_group_name
}

resource "aws_s3_bucket" "main_stg" {
  bucket                      = local.resource_prefix_no_dashes
  acl                         = "public-read"

  website {
    index_document            = "index.html"
    error_document            = "error.html"
  }

  tags                        = var.tags
}

resource "aws_s3_bucket_policy" "main_stg_policy" {
  bucket                      = aws_s3_bucket.main_stg.id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": [
        "${aws_s3_bucket.main_stg.arn}",
        "${aws_s3_bucket.main_stg.arn}/*"
      ]
    }
  ]
}
EOF
}

resource "aws_cloudfront_origin_access_identity" "example" {
  comment                     = "Some comment"
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  depends_on = [
    aws_acm_certificate_validation.cert_validation
  ]
  origin {
    domain_name               = aws_s3_bucket.main_stg.website_endpoint
    origin_id                 = local.resource_prefix_no_dashes

    custom_origin_config {
      origin_protocol_policy  = "http-only"
      # The protocol policy that you want CloudFront to use when fetching objects from the origin server (a.k.a S3 in our situation). HTTP Only is the default setting when the origin is an Amazon S3 static website hosting endpoint, because Amazon S3 doesn’t support HTTPS connections for static website hosting endpoints.
      http_port               = 80
      https_port              = 443
      origin_ssl_protocols    = ["TLSv1.2", "TLSv1.1", "TLSv1"]
    }
  }

  is_ipv6_enabled             = true
  enabled                     = true
  default_root_object         = "index.html"

  aliases                     = ["${var.environment}.aws.cloudwithchris.com"]

  restrictions {
    geo_restriction {
      restriction_type        = "none"
    }
  }

  default_cache_behavior {
    allowed_methods           = ["GET", "HEAD"]
    cached_methods            = ["GET", "HEAD"]
    target_origin_id          = local.resource_prefix_no_dashes

    forwarded_values {
      query_string            = false

      cookies {
        forward               = "none"
      }
    }

    viewer_protocol_policy    = "redirect-to-https"
  }

  viewer_certificate {
    acm_certificate_arn       = aws_acm_certificate.cert.arn
    ssl_support_method        = "sni-only"
  }

  #tags = tags
}

resource "aws_acm_certificate" "cert" {
  domain_name                 = "${var.environment}.aws.cloudwithchris.com"
  validation_method           = "DNS"
  provider                    = aws.us-east-1 # <== Add this

  #tags              = tags

  lifecycle {
    create_before_destroy = true
  }
}

resource "azurerm_dns_cname_record" "cloudfront_dns_bind" {
  name                        = "${var.environment}.aws"
  zone_name                   = data.azurerm_dns_zone.cloudwithchris.name
  resource_group_name         = var.core_resource_group_name
  ttl                         = 300
  record                      = aws_cloudfront_distribution.s3_distribution.domain_name
}

resource "azurerm_dns_cname_record" "ssl_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name                    = dvo.resource_record_name
      record                  = dvo.resource_record_value
      type                    = dvo.resource_record_type
    }
  }

  name                        = trimsuffix(each.value.name, ".")
  zone_name                   = trimsuffix(data.azurerm_dns_zone.cloudwithchris.name, ".cloudwithchris.com")
  resource_group_name         = var.core_resource_group_name
  record                      = each.value.record
  ttl                         = 300
}

resource "aws_acm_certificate_validation" "cert_validation" {
  depends_on = [
    azurerm_dns_cname_record.ssl_validation
  ]
  provider                    = aws.us-east-1 # <== Add this
  certificate_arn             = aws_acm_certificate.cert.arn
  validation_record_fqdns     = [for record in azurerm_dns_cname_record.ssl_validation : record.fqdn]
}