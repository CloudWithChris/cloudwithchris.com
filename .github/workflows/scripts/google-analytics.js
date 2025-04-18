module.exports = async ({github, context, core}) => {
  // Use the @google-analytics/data  SDK to get the top 10
  // most visited pages from the /blog/ or /episode/ directory over the
  // last 28 days.

  // Import the Analytics Data API client library.
  const fs = require('fs');
  const {BetaAnalyticsDataClient} = require('@google-analytics/data');

  // Using a default constructor instructs the client to use the credentials
  // specified in GOOGLE_APPLICATION_CREDENTIALS environment variable.
  const analyticsDataClient = new BetaAnalyticsDataClient();

  // Set the Google Analytics 4 property ID in a variable.
  const propertyId = process.env.GA_TRACKING_ID;

  try {
    const request = {
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '28daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        {
          name: 'pagePath',
        },
      ],
      metrics: [
        {
          name: 'activeUsers',
        },
      ],
      dimensionFilter: {
        orGroup: {
          expressions: [
            {
              filter: {
                fieldName: 'pagePath',
                stringFilter: {
                  matchType: 'CONTAINS',
                  value: '/blog/',
                },
              },
            },
            {
              filter: {
                fieldName: 'pagePath',
                stringFilter: {
                  matchType: 'CONTAINS',
                  value: '/episode/',
                },
              },
            },
          ],
        },
      },
      limit: 10,
    };

    let response = await analyticsDataClient.runReport(request);

    // Create a flat array of the dimension values
    let dimensionValues = response[0].rows.map(row => row.dimensionValues[0].value);
    
    // Output the top 10 most visited pages from the /blog/ or /episode/ directory over the
    // last 28 days.
    console.log(dimensionValues);

    // Check if the data folder exists.
    if (!fs.existsSync('./data')) {
      fs.mkdirSync('./data');
    }

    // Write the data to the data/popular.json file. If data already exists, then
    // replace it with the new data.
    fs.writeFileSync('./data/popular.json', JSON.stringify(dimensionValues, null, 2));

    // Read the contents of the file.
    let data = fs.readFileSync('./data/popular.json');
    console.log(`The file data is ${data}`);
  } catch (err) {
    core.setFailed(`Error fetching from Google Analytics API: ${err}`);
  }
};