provider "azurerm" {}

#
# This script will not work until Terraform fix their resource provider!
#
# ****** NOT COMPLETE *******
#

variable "resourceGroup" {
  default = "Temp.ServerlessDemo"
}

variable "location" {
  default = "northeurope"
}

resource "random_string" "rand_id" {
  length  = 6
  upper   = false
  special = false
}

resource "azurerm_resource_group" "demoapp" {
  name     = "${var.resourceGroup}"
  location = "${var.location}"
}

resource "azurerm_storage_account" "demoapp" {
  name                     = "visiondemostore${random_string.rand_id.result}"
  resource_group_name      = "${azurerm_resource_group.demoapp.name}"
  location                 = "westus"
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_storage_container" "demoapp" {
  name                  = "photos-in"
  resource_group_name   = "${azurerm_resource_group.demoapp.name}"
  storage_account_name  = "${azurerm_storage_account.demoapp.name}"
  container_access_type = "blob"
}

resource "azurerm_app_service_plan" "demoapp" {
  name                = "app-service-plan"
  location            = "${azurerm_resource_group.demoapp.location}"
  resource_group_name = "${azurerm_resource_group.demoapp.name}"
  kind                = "FunctionApp"
  sku {
    tier = "Dynamic"
    size = "Y1"
  }
}

resource "azurerm_function_app" "demoapp" {
  name                      = "visiondemofunc-${random_string.rand_id.result}"
  location                  = "${azurerm_resource_group.demoapp.location}"
  resource_group_name       = "${azurerm_resource_group.demoapp.name}"
  app_service_plan_id       = "${azurerm_app_service_plan.demoapp.id}"
  storage_connection_string = "${azurerm_storage_account.demoapp.primary_connection_string}"
  app_settings {
    VISION_API_KEY = "changemechangemechangeme"
  }  
  source_control {
    repo_url = "https://github.com/benc-uk/serverless-cognitive.git"
    branch = "master"
  }
}
