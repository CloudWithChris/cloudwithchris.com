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
  source = "../../modules/aws-stamp"
  environment = "dev"
  resource_prefix = "cwc-dev"
  tags = {
      environment = "Dev"
      tier = "Web"
      project = "Cloud With Chris"
  }
}