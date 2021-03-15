variable "core_resource_group_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "resource_prefix" {
  type = string
}

variable "location" {
  type = string
}

variable "tags" {
    type = map
}

locals {
  resource_prefix_no_dashes = replace(var.resource_prefix, "-", "")
}

resource "azurerm_resource_group" "main_rg" {
  name     = var.resource_prefix
  location = var.location

  tags = var.tags
}

data "azurerm_cdn_profile" "core" {
  name                = "${var.resource_prefix}-cdn"
  resource_group_name = var.core_resource_group_name
}

resource "azurerm_storage_account" "main_stg" {
  name                     = "${local.resource_prefix_no_dashes}${var.environment}"
  resource_group_name      = azurerm_resource_group.main_rg.name
  location                 = azurerm_resource_group.main_rg.location
  account_kind             = "StorageV2"
  account_tier             = "Standard"
  account_replication_type = "LRS"
  static_website          {
    index_document         = "index.html"
    error_404_document     = "404.html"
  }

  tags                = var.tags
}

resource "azurerm_cdn_endpoint" "main_endpoint" {
  name                = azurerm_storage_account.main_stg.name
  profile_name        = data.azurerm_cdn_profile.core.name
  location            = data.azurerm_cdn_profile.core.location
  resource_group_name = data.azurerm_cdn_profile.core.resource_group_name

  origin {
    name      = azurerm_storage_account.main_stg.name
    host_name = azurerm_storage_account.main_stg.primary_web_endpoint
  }
}