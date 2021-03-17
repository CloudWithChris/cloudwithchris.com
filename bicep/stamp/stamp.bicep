// As we're deploying a Resource Group, the scope needs to be subscription
targetScope = 'subscription'

// Set the parameters, along with defaults per recommended practices
param coreLocation string = 'northeurope'
param environment string
param stampLocation string = 'northeurope'
param resourcePrefix string = 'cwc'

// Set variables to be re-used easily
var domain = 'cwc.com'

// Create the Resource Group
resource resourcegroup 'Microsoft.Resources/resourceGroups@2020-06-01' = {
  name: '${resourcePrefix}-${environment}-rg'
  location: stampLocation
}

module stampResources './stamp-resources.bicep' = {
  name: 'stampResources'
  // Deploy this module in the context of the new resource group
  scope: resourceGroup(resourcegroup.name)
  params: {
    resourcePrefix: resourcePrefix
    environment: environment
  }
}

module coreDependencies './stamp-core-deps.bicep' = {
  name: 'stampCoreDependencies'
  // Deploy this module in the context of the CORE resource group
  scope: resourceGroup('${resourcePrefix}-core-rg')
  params: {
    coreLocation: coreLocation
    environment: environment
    domain: domain
    resourcePrefix: resourcePrefix
    originURL: stampResources.outputs.stgDomain
  }
}