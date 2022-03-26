// Import the test framework, file system, path and 
// frontmatter processing modules.
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Initialise the base URL and the array of content
const baseURL = new URL('https://www.cloudwithchris.com');
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
      filelist.push(
        {
          filename: dir.replace('content/',''),
          title: object.title
        }
      );
    }
  });

  // Return the array of objects for testing
  return filelist;
}

// Get the content directory and parse the markdown files
records = getFiles('content/episode/', records);

// Iterate through the records and run several tests per record
for (const record of records) {

  // Check that the appropriate title is displayed
  test(`Check title is correct: ${record.filename}`, async ({ page }) => {
    let directURL = new URL(record.filename, baseURL);
    await page.goto(directURL.href);
    const title = page.locator('h1');
    await expect(title).toHaveText(record.title);
  });
}