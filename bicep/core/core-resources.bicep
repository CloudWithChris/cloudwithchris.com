// Set the parameters, along with defaults per recommended practices
param domain string
param environment string = 'core'
param location string = 'northeurope'
param resourcePrefix string = 'cwc'

// Create the CDN Profile in preparation for the various stamps.
resource cdn 'Microsoft.Cdn/profiles@2020-09-01' = {
  name: '${resourcePrefix}-${environment}-cdn'
  location: location
  sku: {
    name: 'Standard_Microsoft'
  }
}

resource dnsZone 'Microsoft.Network/dnsZones@2018-05-01' = {
  name: domain
  location: 'Global'
}