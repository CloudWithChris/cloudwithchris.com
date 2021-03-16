// Set the parameters, along with defaults per recommended practices
param environment string = 'core'
param location string = 'northeurope'
param resourcePrefix string = 'cwc'

// Create the CDN Profile in preparation for the various stamps.
resource cdn 'Microsoft.Cdn/profiles@2020-04-15' = {
  name: '${resourcePrefix}-${environment}-cdn'
  location: location
  sku: {
    name: 'Standard_Microsoft'
  }
}