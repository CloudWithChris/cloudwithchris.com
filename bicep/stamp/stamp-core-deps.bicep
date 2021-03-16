// Set the parameters, for template flexibility
param coreLocation string
param environment string
param originURL string
param resourcePrefix string

// Define variable, in case of future re-use
var stgname = '${resourcePrefix}${environment}'

// Deploy the CDN profile
resource cdnEndpoint 'Microsoft.Cdn/profiles/endpoints@2020-04-15' = {
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