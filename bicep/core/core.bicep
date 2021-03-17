// As we're deploying a Resource Group, the scope needs to be subscription
targetScope = 'subscription'

// Set the parameters, along with defaults per recommended practices
param environment string = 'core'
param location string = 'northeurope'
param resourcePrefix string = 'cwc'

// Set variables to be re-used easily
var domain = 'cwc.com'

// Create the Resource Group
resource resourcegroup 'Microsoft.Resources/resourceGroups@2020-06-01' = {
  name: '${resourcePrefix}-${environment}-rg'
  location: location
}

// Create the Core set of resources, passing the parameters to the module
module coreResources './core-resources.bicep' = {
  name: 'core-stamp'
  // Deploy this module in the context of the new resource group
  scope: resourceGroup(resourcegroup.name)
  params: {
    domain: domain
    environment: environment
    location: location
    resourcePrefix: resourcePrefix
  }
}