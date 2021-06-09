terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=2.46.0"
    }
  }
}

# Configure the Microsoft Azure Provider
provider "azurerm" {
  features {}
}

module "core" {
  source = "../../modules/azure-stamp"
  core_resource_group_name = "cwc-core"
  environment = "dev"
  resource_prefix = "cwc-dev"
  location = "North Europe"
  tags = {
      environment = "Dev"
      tier = "Web"
      project = "Cloud With Chris"
  }
}