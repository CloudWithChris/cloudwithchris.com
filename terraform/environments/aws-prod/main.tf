terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=2.46.0"
    }

    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

# Configure the Microsoft Azure Provider
provider "azurerm" {
  features {}
}

# Configure the AWS Provider
provider "aws" { }

module "core" {
  core_resource_group_name = "cloudwithchris"
  environment = "prod"
  main_domain = "cloudwithchris.com"
  resource_prefix = "cloudwithchris-prod"
  source = "../../modules/aws-stamp"
  tags = {
      environment = "Prod"
      tier = "Web"
      project = "Cloud With Chris"
  }
}