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
  source = "../../modules/core"
  resource_prefix = "cwc-core"
  location = "North Europe"
  tags = {
      environment = "Production"
      tier = "Core"
      project = "Cloud With Chris"
  }
}