// Set the parameters, for template flexibility
param coreLocation string
param domain string
param environment string
param originURL string
param resourcePrefix string

// Define variable, in case of future re-use
var stgname = '${resourcePrefix}${environment}'

// Deploy the CDN profile
resource cdnEndpoint 'Microsoft.Cdn/profiles/endpoints@2020-09-01' = {
  name: '${resourcePrefix}-core-cdn/${stgname}'
  location: coreLocation
  properties: {
    origins: [
      {
        name: stgname
        properties: {
          hostName: originURL
        }
      }
    ]
  }
}

// Deploy a CName record pointing to the CDNEndpoint
resource previewCNAME 'Microsoft.Network/dnsZones/CNAME@2018-05-01' = {
  name: '${domain}/preview'
  properties: {
    TTL: 300
    CNAMERecord: {
      cname: cdnEndpoint.properties.hostName
    }
  }
}