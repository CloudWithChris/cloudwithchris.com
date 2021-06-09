# The main AWS provider is configured in an upstream module which calls
# this one. The provider listed below is used for certain dependencies
# (e.g. Cert Manager) which must be helped in us-east-1. This is needed
# to allow SSL certificates to work from Cloud Front.

provider "aws" {
  region = "us-east-1"
  alias = "us-east-1"
}

# Define the Variables to be used with this module. Depending on your background (e.g. a programmer), you may consider these a little more like a parameter, particularly if you have used ARM templates previously.

variable "core_resource_group_name" {
  # This is the resource group where your Azure Public
  # DNS Zone is stored. 
  type = string
  default = "cloudwithchris"
}

variable "environment" {
  type = string
  default = "dev"
}

variable "main_domain" {
  type = string
  default = "cloudwithchris.com"
}

variable "resource_prefix" {
  type = string
  default = "cloudwithchris-dev"
}

variable "tags" {
    type = map
}

# Define any local variables. These are similar to variables in software code, that you
#  would define once and re-use throughout your program. 
locals {
  resource_prefix_no_dashes   = replace(var.resource_prefix, "-", "")
}

# This module assumes that an Azure DNS zone has already been created.
# We'll create a data object, to reference the details of that DNS zone.
data "azurerm_dns_zone" "cloudwithchris" {
  name                        = var.main_domain
  resource_group_name         = var.core_resource_group_name
}

# Create an AWS S3 Bucket which is publicly accessible. Set the properties so
# that index and error documents are appropriately read.
resource "aws_s3_bucket" "main_stg" {
  bucket                      = local.resource_prefix_no_dashes
  acl                         = "public-read"

  website {
    index_document            = "index.html"
    error_document            = "error.html"
  }

  tags                        = var.tags
}

# Create a policy for the AWS S3 bucket so that any user can read any file in
# the bucket. This is required for the static website functionality.
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

# Public SSL/TLS certificates provisioned through AWS Certificate Manager are free.
# You pay only for the AWS resources you create to run your application.
# To ensure HTTPS traffic comes through CloudFront, we first need to create a certificate.
# There is a requirement that any custom certificates used in Cloud Front must be hosted in
# sepcific regions (us-east-1 being one of them). This is why we map to the specific
# alias of the provider in this resource.
resource "aws_acm_certificate" "cert" {
  domain_name                 = "${var.environment}.aws.${var.main_domain}" # e.g. dev.aws.cloudwithchris.com
  validation_method           = "DNS"
  provider                    = aws.us-east-1

  #tags              = tags

  lifecycle {
    create_before_destroy = true
  }
}

# Once we have a certificate created, we need to create a DNS record. This module assumes
# that Azure DNS is being used to manage the DNS records.
# Therefore, domain name associated with the certificate, create an appropriate CNAME
# record so that AWS can validate authenticity.
resource "azurerm_dns_cname_record" "ssl_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name                    = dvo.resource_record_name
      record                  = dvo.resource_record_value
      type                    = dvo.resource_record_type
    }
  }

  # An Azure DNS record doesn't require the main_hostname in its name, as it's already part
  # of the DNS zone. Therefore, using Terraform's trimsuffix method to remove that aspect
  # from the name, and setting the beginning as the resource.
  # e.g. dev.aws.cloudwithchris.com becomes dev.aws
  # If we didn't do that, we get duplication on the .cloudwithchris.com, which is not what AWS
  # is looking to verify against.
  name                        = trimsuffix(each.value.name, ".${var.main_domain}.") #
  zone_name                   = data.azurerm_dns_zone.cloudwithchris.name
  resource_group_name         = var.core_resource_group_name
  record                      = each.value.record
  ttl                         = 300
}

# As we now have the DNS record in place to prove the authenticity, let's go ahead and 
# request that AWS Certicate MAnager goes ahead and validates the DNS record.
resource "aws_acm_certificate_validation" "cert_validation" {
  depends_on = [
    azurerm_dns_cname_record.ssl_validation
  ]
  provider                    = aws.us-east-1 # <== Add this
  certificate_arn             = aws_acm_certificate.cert.arn
  validation_record_fqdns     = [for record in azurerm_dns_cname_record.ssl_validation : record.fqdn]
}

# We now have an AWS S3 Bucket, as well as an SSL certificate stored in AWS certificate manager.
# Now we need to create the CloudFront (CDN) resources.
resource "aws_cloudfront_origin_access_identity" "example" {
  comment                     = "Some comment"
}

# This is the 'main' CloudFront resource. You can have many origins behind a CloudFront resource.
# For this scenario, we'll be using a single AWS S3 bucket behind CloudFront.
resource "aws_cloudfront_distribution" "s3_distribution" {
  depends_on = [
    aws_acm_certificate_validation.cert_validation
  ]
  origin {
    domain_name               = aws_s3_bucket.main_stg.website_endpoint
    origin_id                 = local.resource_prefix_no_dashes

    custom_origin_config {
      origin_protocol_policy  = "http-only"
      # The protocol CloudFront uses when fetching objects from the origin server.
      # Amazon S3 doesn’t support HTTPS connections for static website hosting endpoints.
      http_port               = 80
      https_port              = 443
      origin_ssl_protocols    = ["TLSv1.2", "TLSv1.1", "TLSv1"]
    }
  }

  is_ipv6_enabled             = true
  enabled                     = true
  default_root_object         = "index.html"
  aliases                     = ["${var.environment}.aws.${var.main_domain}"] # Adding our custom hostname, e.g. dev.aws.cloudwithchris.com

  # Restrictions is a required property. Even though we specify no restrictions.
  restrictions {
    geo_restriction {
      restriction_type        = "none"
    }
  }

  # My website only uses GET requests, so no need to allow any other HTTP methods/ 
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

    # Automatically redirect users from an HTTP to an HTTPS endpoint.
    viewer_protocol_policy    = "redirect-to-https"
  }

  # Associate the CloudFront resource with the Certificate Manager resource.
  viewer_certificate {
    acm_certificate_arn       = aws_acm_certificate.cert.arn
    ssl_support_method        = "sni-only"
  }

  #tags = tags
}

# Finally, create an Azure DNS record with the custom domain we've been laying the
# foundations for. e.g. dev.aws.cloudwithchris.com. This will point to the CloudFront
# resource.
resource "azurerm_dns_cname_record" "cloudfront_dns_bind" {
  name                        = "${var.environment}.aws"
  zone_name                   = data.azurerm_dns_zone.cloudwithchris.name
  resource_group_name         = var.core_resource_group_name
  ttl                         = 300
  record                      = aws_cloudfront_distribution.s3_distribution.domain_name
}

# Create an AWS IAM User for the Unattended DevOps process
resource "aws_iam_user" "devops_user" {
  name = "${var.core_resource_group_name}-${var.environment}-devops"

  # tags = tags
}

# Create and associate a policy with that user.
# This policy allows the user the below permissions
# only on the S3 bucket in this module.
resource "aws_iam_user_policy" "devops_user_s3_write" {
  name = "${aws_s3_bucket.main_stg.id}-bucket-write"
  user = aws_iam_user.devops_user.name

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:PutObjectAcl"
            ],
            "Resource": [
                "${aws_s3_bucket.main_stg.arn}*",
                "${aws_s3_bucket.main_stg.arn}"
            ]
        }
    ]
}
EOF
}

# Ensure that there is an access key resource,
# so that this can be used in the DevOps process.
resource "aws_iam_access_key" "devops_user" {
  user = aws_iam_user.devops_user.name
}