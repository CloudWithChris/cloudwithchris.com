// Import the required dependencies
import fs from 'fs';
import { test, expect } from '@playwright/test';

let rawData = fs.readFileSync('tests/talk-tests.json');
let testData = JSON.parse(rawData);

for (const record of testData) {
  test(`${record.filename} - Talk Metadata Check`, async ({ page }) => {
    // Arrange
    // N/A
    const baseUrl = record.url.replace(record.filename, "")

    // Act
    /* Tak */
    await page.goto(record.url);
    const talkMetadata = await page.locator('id=meta-talk');
    const talkObject = await talkMetadata.evaluate(node => JSON.parse(node.innerHTML));

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
    /* Talk */
    expect(talkObject["@context"]).toBe("http://schema.org");
    expect(talkObject["@type"]).toBe("Event");
    expect(talkObject["name"]).toBe(record.title);
    expect(talkObject["url"]).toBe(record.url);
    expect(talkObject["description"]).toBe(record.description);

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
    expect(breadcrumbsObject["itemListElement"][1]["name"]).toBe("Talks");
    expect(breadcrumbsObject["itemListElement"][2]["name"]).toBe(record.title);
  });
}