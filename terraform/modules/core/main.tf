variable "resource_prefix" {
  type = string
}

variable "location" {
  type = string
}

variable "tags" {
    type = map
}

resource "azurerm_resource_group" "main_rg" {
  name     = var.resource_prefix
  location = var.location

  tags = var.tags
}

resource "azurerm_cdn_profile" "core_profile" {
  name                = "${var.resource_prefix}-cdn"
  location            = var.location
  resource_group_name = azurerm_resource_group.main_rg.name
  sku                 = "Standard_Microsoft"

  tags                = var.tags
}