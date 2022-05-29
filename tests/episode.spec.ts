// Import the required dependencies
import fs from 'fs';
import { test, expect } from '@playwright/test';

let rawData = fs.readFileSync('tests/episode-tests.json');
let testData = JSON.parse(rawData);

for (const record of testData) {
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