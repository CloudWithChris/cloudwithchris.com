// Import the test framework, file system, path and 
// frontmatter processing modules.
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Configure the tests as parallel
// test.describe.configure({ mode: 'parallel' });

// Initialise the base URL and the array of content
// const baseURL = new URL('http://www.cloudwithchris.com');
let records = [];

// Read the content directory and parse the markdown files
function getFiles(dir, filelist) {

  // Read the directory
  let files = fs.readdirSync(dir);

  // Foreach file in the directory
  files.forEach(file => {

    // Check if the file is a directory
    if (fs.statSync(dir + file).isDirectory()) {
      // If it is a directory, recurse into it
      filelist = getFiles(dir + file + '/', filelist);
    // If it is a file, check if it is a markdown file
    } else if (path.extname(file) == '.md'){
      // If it is a markdown file, parse the frontmatter,
      // convert the property to lower for consistency
      // and add the resulting object to an array
      const object = Object.fromEntries(
        Object.entries(matter(fs.readFileSync(dir + file, 'utf8')).data).map(([k, v]) => [k.toLowerCase(), v])
      );

      var pathWithoutContent = dir.replace('content/','');
      var contentURL = new URL(pathWithoutContent, 'https://www.cloudwithchris.com').toString();

      filelist.push(
        {
          filename: pathWithoutContent,
          url: contentURL,
          title: object.title,
          description: object.description,
          banner: new URL(object.banner, contentURL).toString(),
          image: new URL(object.image, contentURL).toString(),
          youtube: object.youtube
        }
      );
    }
  });

  // Return the array of objects for testing
  return filelist;
}

function testTitle(record){
  // Check that the appropriate title is displayed
  // test(`Check heading is correct: ${record.filename}`, async ({ page }) => {
  //   //let directURL = new URL(record.filename, baseURL);
  //   await page.goto(record.filename);
  //   const title = page.locator('h1');
  //   await expect(title).toHaveText(record.title);
  // })

  // test(`Check page title is correct: ${record.filename}`, async ({ page }) => {
  //   //let directURL = new URL(record.filename, baseURL);
  //   let expectedTitle = record.title.concat(' | Cloud With Chris');
  //   await page.goto(record.filename);
  //   const title = page.locator('title');
  //   await expect(title).toHaveText(expectedTitle);
  //   const twittertitle = page.locator('meta[name="twitter:title"]');
  //   await expect(twittertitle).toHaveAttribute("content", expectedTitle);
  //   const ogtitle = page.locator('meta[property="og:title"]');
  //   await expect(ogtitle).toHaveAttribute("content", expectedTitle);
  // })


  // test(`Check organization metadata is correct: ${record.filename}`, async ({ page }) => {

  //   // Arrange
  //   const expectedObject = {
  //     "@context":"https://schema.org",
  //     "@type":"Organization",
  //     "url":"https://www.cloudwithchris.com/",
  //     "logo":"https://www.cloudwithchris.com/img/cloudwithchrislogo.png"
  //   }

  //   // Act
  //   await page.goto(record.filename);
  //   const actual = page.locator('id=meta-organisation');

  //   // Assertq
  //   expect(await actual.evaluate(node => JSON.parse(node.innerHTML))).toBe(expectedObject);
  // })

  // test(`Check website metadata is correct: ${record.filename}`, async ({ page }) => {

  //   // Arrange
  //   const expectedObject = {
  //     "@context":"http://schema.org",
  //     "@type":"WebSite",
  //     "url":"https://www.cloudwithchris.com/",
  //     "sameAs": [
  //       "https://twitter.com/CloudWithChris",
  //       "https://github.com/CloudWithChris"
  //     ],
  //     "name":"Cloud With Chris",
  //     "logo":"https://www.cloudwithchris.com/favicon.ico",
  //     "potentialAction": {
  //       "@type":"SearchAction",
  //       "target": {
  //         "@type":"EntryPoint",
  //         "urlTemplate":"https://www.cloudwithchris.com/search/?s={search_term_string}"
  //       },
  //       "query-input":"required name=search_term_string"
  //     }
  //   }    

  //   // Act
  //   await page.goto(record.filename);
  //   const actual = page.locator('id=meta-website');

  //   // Assert
  //   expect(await actual.evaluate(node => JSON.parse(node.innerHTML))).toBe(expectedObject);
  // })


  // test(`Check Breadcrumbs metadata is correct: ${record.filename}`, async ({ page }) => {

  //   // Arrange - N/A

  //   // Act
  //   await page.goto(record.filename);
  //   const actual = page.locator('id=meta-breadcrumbs');
  //   const actualObject = await actual.evaluate(node => JSON.parse(node.innerHTML));


  //   // Assert
  //   expect(actualObject.itemListElement.length).toBeGreaterThanOrEqual(2);
  //   expect(actualObject.itemListElement[actualObject.itemListElement.length - 1].name).toBe(record.title);
  // })

  // test(`Check page has description metadata: ${record.filename}`, async ({ page }) => {
  //   //let directURL = new URL(record.filename, baseURL);
  //   await page.goto(record.filename);
  //   const description = page.locator('meta[name="description"]');
  //   await expect(description).toHaveAttribute("content", record.description);
  //   const twitterdescription = page.locator('meta[name="twitter:description"]');
  //   await expect(twitterdescription).toHaveAttribute("content", record.description);
  //   const ogdescription = page.locator('meta[property="og:description"]');
  //   await expect(ogdescription).toHaveAttribute("content", record.description);
  // })

  if (record.filename.substr(0, record.filename.indexOf('/')) == 'episode'){
    test(`Check episode metadata is correct: ${record.filename}`, async ({ page }) => {

      const expectedObject = {
        "@context":"http://schema.org",
        "@type":"PodcastEpisode",
        "name":"Things to Consider Before Migrating Old .NET Applications to Cloud",
        "image":"https://www.cloudwithchris.com/episode/things-to-consider-before-migrating-old-dotnet/images/banner.png",
        "author":[
          {"@type":"Person","name":"Chris Reddington","image":"https://www.cloudwithchris.com/person/chrisreddington/images/chrisreddington.jpg","url":"https://www.cloudwithchris.com/person/chrisreddington/"},{"@type":"Person","name":"Jonah Andersson","image":"https://www.cloudwithchris.com/person/jonahandersson/images/jonahandersson.png","url":"https://www.cloudwithchris.com/person/jonahandersson/"}],"url":"https://www.cloudwithchris.com/episode/things-to-consider-before-migrating-old-dotnet/","description":"Jonah Andersson shares her past experience and important lessons learned about migrating and developing old .NET applications to the Azure cloud. Find out how that project turn into a fiasco not because of Azure but of other factors. Never make the same mistakes.","associatedMedia":[{"@type":"VideoObject","contentUrl":"https://youtu.be/fYavIVA7QxM","name":"Things to Consider Before Migrating Old .NET Applications to Cloud","thumbnailUrl":"https://www.cloudwithchris.com/images/thumbnail.jpg","description":"Jonah Andersson shares her past experience and important lessons learned about migrating and developing old .NET applications to the Azure cloud. Find out how that project turn into a fiasco not because of Azure but of other factors. Never make the same mistakes.","uploadDate":"2022-03-17"}]}


      // Arrange - N/A

      // Act
      await page.goto(record.filename);
      const actual = page.locator('id=meta-episode');
      const actualObject = await actual.evaluate(node => JSON.parse(node.innerHTML));


      // Assert
      expect(actualObject["@context"]).toBe("http://schema.org");
      expect(actualObject["@type"]).toBe("PodcastEpisode");
      expect(actualObject["name"]).toBe(record.title);
      expect(actualObject["url"]).toBe(record.url);
      expect(actualObject["description"]).toBe(record.description);

      if (record.banner)
      {
        if (record.banner == "images/cloud-with-chris-banner.png"){
          expect(actualObject.image).toBe("https://www.cloudwithchris.com/images/cloud-with-chris-banner.png");
        } else {
          expect(actualObject.image).toBe(record.banner);
        }
      } else {
        expect(actualObject.image).toBe(record.image);
      }

      var videoObject = actualObject.associatedMedia.filter(obj => {
        return obj["@type"] === "VideoObject";
      })

      if (videoObject)
      {
        expect(videoObject.contentUrl).toBe(new URL(record.youtube, "https://youtu.be").toString());
      }
    })
  }

}

// Iterate through the records and run several tests per record
for (const record of getFiles('content/episode/', records)) {
  testTitle(record);
}