// Import the required dependencies
import fs from 'fs';
import matter from 'gray-matter';
import fetch from 'node-fetch';
import { test, expect } from '@playwright/test';

const {XMLParser} = require('fast-xml-parser');

// Configure the parser options to ignore attributes
const options = {
  ignoreAttributes : false
};

// Per https://github.com/microsoft/playwright/issues/13102
test.describe.configure({ mode: 'parallel' });

// Declare a function to get the results of the sitemap
// and return an array of strings, filtered to only include
// the URLs that are from a given archetype.
async function GetSitemapResults(): Promise<Array<string>>{

  // Return a promise that resolves to an array of strings
  return new Promise((resolve, reject) => {

    // Instantiate the parser
    const parser = new XMLParser(options);
    let sitemapResults = [];

    // Call the sitemap endpoint    
    fetch('http://localhost:1313/sitemap.xml')
    .then(function(response) {
      response.text().then(function(text) {
        // Parse the XML, and generate a list of
        // URLs that are from the given archetype.
        // Strip the base URL from the URL
        sitemapResults = parser.parse(text);
        resolve(sitemapResults.urlset.url.filter(obj => /\/episode\/[\w]+/g.test(obj.loc)).map(e => e.loc.replace('//localhost:1313/', '')));
      });
    })
    .catch(function(error) {
      reject(error);
    });
  });
}

// Generate the test data by reading the frontmatter from
// the markdown files, and generating an array of objects
// that can be used to execute the tests.
async function GenerateTestData(sitemap: Array<string>): Promise<Array<Object>>{

  // Instantiate the test data array
  let testData = [];

  // Return a promise that resolves to an array of objects
  return new Promise(async (resolve, reject) => {

    // Read all files from the sitemap object asynchronously
    await Promise.all(sitemap.map(async (record) => {
      // Create a new object to store the test data
      // This object is generated using the matter library,
      // which parses the frontmatter from the markdown file.
      const object = Object.fromEntries(
        Object.entries(
          matter(
            fs.readFileSync('content/'+ record+'index.md', 'utf8')
          ).data
        ).map(
          (
            [k, v]
          ) => [k.toLowerCase(), v]
        )
      );
    
      // Create a new object, and add it to the array of testData.
      testData.push(
        {
          filename: record,
          url: "http://localhost:1313/" + record,
          title: object.title,
          description: object.description,
          banner: object.banner,
          image: object.image,
          youtube: object.youtube
        }
      )
    }));

    // Resolve the promise with the array of testData
    resolve(testData);
  });
}

// Execute an episode test against a given record
function executeEpisodeTest(record: Object){
  test(`${record.filename} - Episode Metadata Check`, async ({ page }) => {
    // Arrange
    // N/A

    // Act
    await page.goto(record.url);
    const actual = page.locator('id=meta-episode');
    const actualObject = await actual.evaluate(node => JSON.parse(node.innerHTML));

    // Assert
    expect(actualObject["@context"]).toBe("http://schema.org");
    expect(actualObject["@type"]).toBe("PodcastEpisode");
    expect(actualObject["name"]).toBe(record.title);
    expect(actualObject["url"]).toBe(record.url);
    expect(actualObject["description"]).toBe(record.description);
  });
}

let executeTests = async () => {
  // Get the resulting list from the sitemap
  GetSitemapResults().then(async sitemap => {
    // With that information, generate the test data
    GenerateTestData(sitemap).then(testData => {
      fs.writeFile('tests/episode-tests.json', JSON.stringify(testData), err => {
        if (err) {
          console.error(err);
        }
      });
    });
  });
};

executeTests();

export { executeTests }