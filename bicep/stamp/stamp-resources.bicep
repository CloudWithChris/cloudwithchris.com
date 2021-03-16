// Set the parameters, along with defaults where appropriate per recommended practices
param environment string
param resourcePrefix string
param location string = resourceGroup().location

// Define variable, in case of future re-use
var stgname = '${resourcePrefix}${environment}'

// Deploy Storage Account
resource storage 'Microsoft.Storage/storageAccounts@2020-08-01-preview' = {
  name: stgname
  location: resourceGroup().location
  kind:'StorageV2'
  sku:{
    name: 'Standard_LRS'
  }
}

// Retrieve the Web Endpoint for the Storage Account. This is needed for the CDN Endpoint update in the Core Resource Group.
output stgDomain string = replace(replace(storage.properties.primaryEndpoints.web, 'https://', ''), '.net/', '')