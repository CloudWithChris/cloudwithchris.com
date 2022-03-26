import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const baseURL = new URL('https://www.cloudwithchris.com');
let records = [];

function getFiles(dir, filelist) {
  let files = fs.readdirSync(dir);

  files.forEach(file => {
    if (fs.statSync(dir + file).isDirectory()) {
      filelist = getFiles(dir + file + '/', filelist);
    } else if (path.extname(file) == '.md'){
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

  return filelist;
}

records = getFiles('content/episode/', records);

for (const record of records) {
  test(`Check title is correct: ${record.filename}`, async ({ page }) => {
    let directURL = new URL(record.filename, baseURL);
    await page.goto(directURL.href);
    const title = page.locator('h1');
    await expect(title).toHaveText(record.title);
  });
}