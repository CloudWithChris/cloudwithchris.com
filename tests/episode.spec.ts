// Import the required dependencies
import fs from 'fs';
import { test, expect } from '@playwright/test';

let rawData = fs.readFileSync('tests/episode-tests.json');
let testData = JSON.parse(rawData);

for (const record of testData) {
  test(`${record.filename} - Episode Metadata Check`, async ({ page }) => {
    // Arrange
    // N/A
    const baseUrl = record.url.replace(record.filename, "")

    // Act
    /* Episode */
    await page.goto(record.url);
    const episodeMetadata = await page.locator('id=meta-episode');
    const episodeObject = await episodeMetadata.evaluate(node => JSON.parse(node.innerHTML));

    /* Organization */
    const organizationMetadata = await page.locator('id=meta-organisation');
    const organizationObject = await organizationMetadata.evaluate(node => JSON.parse(node.innerHTML));

    /* Website */
    const websiteMetadata = await page.locator('id=meta-website');
    const websiteObject = await websiteMetadata.evaluate(node => JSON.parse(node.innerHTML));

    /* Breadcrumbs */
    const breadcrumbsMetadata = await page.locator('id=meta-breadcrumbs');
    const breadcrumbsObject = await breadcrumbsMetadata.evaluate(node => JSON.parse(node.innerHTML));

    // Assert
    /* Episode */
    expect(episodeObject["@context"]).toBe("http://schema.org");
    expect(episodeObject["@type"]).toBe("PodcastEpisode");
    expect(episodeObject["name"]).toBe(record.title);
    expect(episodeObject["url"]).toBe(record.url);
    expect(episodeObject["description"]).toBe(record.description);

    /* Organization */
    expect(organizationObject["@context"]).toBe("https://schema.org");
    expect(organizationObject["@type"]).toBe("Organization");
    expect(organizationObject["url"]).toBe(baseUrl);
    
    // Add an assertion on the logo here

    /* Website */
    expect(websiteObject["@context"]).toBe("http://schema.org");
    expect(websiteObject["@type"]).toBe("WebSite");
    expect(websiteObject["name"]).toBe(record.title);
    expect(websiteObject["sameAs"][0]).toBe("https://twitter.com/reddobowen");
    expect(websiteObject["sameAs"][1]).toBe("https://github.com/CloudWithChris");

    /* Breadcrumbs */
    expect(breadcrumbsObject["@context"]).toBe("https://schema.org");
    expect(breadcrumbsObject["@type"]).toBe("BreadcrumbList");
    expect(breadcrumbsObject["itemListElement"][0]["item"]).toBe(baseUrl);
    expect(breadcrumbsObject["itemListElement"][0]["item"]).toBe(baseUrl);
    expect(breadcrumbsObject["itemListElement"][1]["name"]).toBe("Episodes");
    expect(breadcrumbsObject["itemListElement"][2]["name"]).toBe(record.title);
  });
}