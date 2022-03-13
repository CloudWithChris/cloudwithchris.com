---
# Default hugo properties
title: "Using GitHub Actions, Azure Functions, Azure API Management and Google Analytics to display top posts on a Hugo Static Site"                   # Name of the blog
description: "In this post, I show how I use GitHub Actions to call an Azure Function (through Azure API Management) that interacts with Google Analytics as part of the build process. The end result is that top posts are pulled into the Static Site Generation process, rather than calling an API through JavaScript at runtime."             # Used for SEO optimisation
PublishDate: "2022-03-13T19:00:00Z"
Date: "2022-03-13T19:00:00Z"

# Site-wide [required properties]
image: "img/cloudwithchrislogo.png"                   # Displayed when referenced in listing pages
images:                     # An array of images used in Social Sharing
- img/cloudwithchrislogo.png
tags:                       # Used for SEO optimisation and browsing across the site.
- Hugo
- Static Content
- GitHub
- GitHub Actions
- Azure
- Azure Functions
- Google Analytics
- SEO
- Python
- Azure API Management
- APIs
- DevOps
- Automation

# Site-wide [optional properties]
externalLink: ""            # Full URL to override listing links to an external page

# Content-specific properties
authors:
-  "chrisreddington"                       # An array of authors of the post (filenames in person).

banner: "images/banner.png"
---
In this post, I show how I use GitHub Actions to call an Azure Function (through Azure API Management) that interacts with Google Analytics as part of the build process. The end result is that top posts are pulled into the Static Site Generation process, rather than calling an API through JavaScript at runtime.

![Example of the Cloud With Chris Landing page showing the top posts populated through the Google Analytics API](images/example-website-ui.png "Example of the Cloud With Chris Landing page showing the top posts populated through the Google Analytics API")

You may be thinking - "That's a lot of technologies in one sentence. What's the point?". That's a great question, let's take a step back and look at the problem we're trying to solve.

## What's the problem?

I have been wanting to make the first view of my website actionable. That means, as a user you should be able to see featured posts, upcoming content and the posts which are most popular. The first two are trivial, but the third is a bit more tricky.

Why is that? Let's walk through each scenario.

* I have built a featured posts capability by using a ``featured`` property in the YAML front matter of each post. If the post should be featured in the carousel, then it should have the ``featured`` property set with a numeric value. The value defines the order in which the post should appear in the carousel.
* The upcoming content is known capability by use of an ``upcoming`` flag in the YAML front matter of each post.  This value is set to ``true`` if the post should be displayed in the upcoming content section, and false if it is in the past.
  * As a side note, you may be wondering why I don't simply use the Date and PublishDate properties to determine if a post is in the past or not. This is so that I can control the release of content to external sources (such as Apple Podcasts, Google Podcasts, Spotify, etc.), as the episodes RSS feed is watched by those providers. That means, as soon as the site is build with pages in the past, that content will be 'released' to external sources. In reality, I may not have uploaded the required media files as yet, hence the need for the manual control.
* And now the trickiest part. The posts which are most popular are determined by the number of views of each post. There isn't a built-in capability for this in Hugo. It's common to rely upon some form of external monitoring to determine the popularity of a post. For example, I use Google Analytics to understand the behaviour of my visitors, and ultimately which content is most popular - so that I can then prioritize the content which I create in the future.

Right, so we have established that the first two are trivial, but the third is a bit more tricky. We have also established that we can rely upon some form of external monitoring to determine the popularity of a post. Surely it's just as simple as calling an API via JavaScript at runtime, and using that to display the posts which are most popular?

Yes and no. There are drawbacks to this approach -

* The [Google Analytics API has a limit](https://developers.google.com/analytics/devguides/reporting/core/v4/limits-quotas#general_quota_limits) of 50,000 requests per day. If you're calling the API more than 50,000 times per day, you'll be throttled.
  * This isn't a problem for me at the moment, but hopefully it will be in the future!
* Calling an external API is not an instant operation. It can take up to a few seconds to return the results. There are ways to handle this, for example using a cache or loading icons. However, given that this is the first content that a user sees, it's important that the content is available as quickly as possible.
* Hugo cannot be used directly within JavaScript. This means that you wouldn't have the ability to reference pages in the site, and there associated properties. Instead, you' have to maintain a list of pages, the required content and then use JavaScript to parse that (e.g. an external JSON file).

## Piecing together a solution with Python-based Azure Functions

All of these problems are not insurmountable, but there is an alternative approach that could be used. A big thank you and shout out to Janne of [Pakstech.com](https://pakstech.com/blog/hugo-popular-content/), who has written an excellent blog post and acted as the inspiration for this post.

Being the lazy developer that I am, I begun to think about the easiest route that I could replicate something like in Janne's post. There were a couple of aspects that I wanted to change -

* I didn't want to trigger a call to the Google Analytics API as part of the build process. I wanted it to be its own independent API.
* I didn't want to commit the updated JSON file to the git repository. Instead, just bring it in and use it at deployment time as part of a build process.

Those requirements led me to the initial iteration of the concept. I re-used Janne's example code snippets (thank you again for the excellent blog post), but re-factored it into a [Python-based Azure Function](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-python). The latest copy of the code [can be found on GitHub](https://github.com/CloudWithChris/AzureFunctionGoogleAnalyticsAPI). I'll walk through the key points to note next.

1. I don't have a particularly strong Python background, so this was a great learning exercise for me as well. After generating a new Python Azure Function through Visual Studio Code, I populated the ``requirements.txt`` file. It took a few times to realise that the name of the package and the name of the reference are slightly different:

  ```txt
  # DO NOT include azure-functions-worker in this file
  # The Python Worker is managed by Azure Functions platform
  # Manually managing azure-functions-worker may cause unexpected issues

  azure-functions
  google-api-python-client
  google-auth
  ```

2. Next up, adjusting the default HTTP trigger which is generated for a Python-based Azure Function. This was once again relatively painless. The main piece that I had to do here was remap Janne's implementation (which wrote the results to a JSON file), to instead output the results as part of an HTTP response from the Azure Function. I also tweaked the parameters of get_report to search for 28 days rather than 7 days (as my data isn't particularly changable, plus I'd rather the average over a longer period of time). There are a couple of other tweaks which I'll note below the code snippet.

```python
import logging
import azure.functions as func
import os

import googleapiclient.discovery
import json
import re
from google.oauth2 import service_account

VIEW_ID = "CHANGEME"
MAX_PAGES = 10
SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"]
BLOG_REGEX = re.compile(r"^\/blog\/[\w\-]*\/$")
SCRIPT_DIR = os.path.dirname(__file__)
SERVICE_ACCOUNT_FILE = "service_account.json"
JSON_FILE = os.path.join(SCRIPT_DIR, SERVICE_ACCOUNT_FILE)

credentials = service_account.Credentials.from_service_account_file(
    JSON_FILE, scopes=SCOPES
)

analytics = googleapiclient.discovery.build(
    serviceName="analyticsreporting", version="v4", credentials=credentials,
)

def get_report():
    body = {
        "reportRequests": [
            {
                "viewId": VIEW_ID,
                "dateRanges": [{"startDate": "28daysAgo", "endDate": "today"}],
                "metrics": [{"expression": "ga:users"}],
                "dimensions": [{"name": "ga:pagePath"}],
                "orderBys": [{"fieldName": "ga:users", "sortOrder": "DESCENDING"}],
            }
        ]
    }
    return analytics.reports().batchGet(body=body).execute()


def get_popular_pages(response):
    popular_pages = []
    reports = response.get("reports", [])
    if reports:
        report = reports[0]
        for row in report.get("data", {}).get("rows", []):
            popular_pages.append(row["dimensions"][0])
    filtered = [page for page in popular_pages if BLOG_REGEX.match(page)]
    if len(filtered) > MAX_PAGES:
        filtered = filtered[:MAX_PAGES]
    return filtered

def main(req: func.HttpRequest) -> func.HttpResponse:
    
    logging.info('Python HTTP trigger function processed a request.')

    response = get_report()
    pages = get_popular_pages(response)
    
    return func.HttpResponse(json.dumps(pages), mimetype="application/json")


if __name__ == "__main__":
    main()
```

3. There is another slight tweak, and that is how I reference the service_account.json file (aka, the credentials to the Google Analytics API).

> **Note:** If you plan to replicate this, make sure to add service_account.json to your .gitignore file. This is **not** something that you want committed to your Git repository. I've spent some time looking into alternatives that do not use the file, but from my initial research - it looks like the google.oauth2.service_account module only has authentication options from files. I'm new to this SDK and module, so if I'm wrong - please do correct me! I'll do a more thorough review on this later, as I'd like to use something like Open ID Connect (just like how I [authenticate my GitHub Actions to Azure](/blog/using-oidc-github-actions-azure-swa/)) to authenticate.

As we're using Azure Functions, we need to reconsider how the original implementation handled the file path of the ``service_account.json`` file, as the context that the script is executed will be different due to the Azure Functions runtime. Another thank you, this time to Anthony Chu for [answering this question](https://docs.microsoft.com/en-us/answers/questions/516509/azure-function-not-able-to-read-my-json-file-from.html) which helped solve this one. 

This is where you'll notice the implementation in the script to be -

```python
SCRIPT_DIR = os.path.dirname(__file__)
SERVICE_ACCOUNT_FILE = "service_account.json"
JSON_FILE = os.path.join(SCRIPT_DIR, SERVICE_ACCOUNT_FILE)

credentials = service_account.Credentials.from_service_account_file(
    JSON_FILE, scopes=SCOPES
)
```

This means that the script will look for the ``service_account.json`` file in the same directory as the ``__init.py__`` for our HTTP-Trigger based Azure Function.

> **Note:** The ``__file__`` variable referenced in the script is a special variable that has meaning in Python. Effectively, it is the pathname of the file from which the module was loaded. You can find out about this and other special varaibles [on the Python docs](https://docs.python.org/3/reference/datamodel.html).

The rest of the script remains the same as Janne's original implementation. I'd encourage you to read that blog post to understand any additional tweaks that you may need/want to make.

## Bringing Azure API Management into the picture

At this point, you should be able to deploy your Azure Function to Azure. For the purposes of my example, I used the Azure Functions extension in Visual Studio Code to deploy to an existing Python Azure Function resource that I had available. 

![Screenshot showing the Azure Function deployed in the Azure Portal](images/azure-function.png "Screenshot showing the Azure Function deployed in the Azure Portal")

I plan to add a GitHub action that pulls in a GitHub repository secret to achieve the same (until I can use something like an OIDC flow as noted earlier), but I'll leave that as a separate exercise for you to work on!

I wasn't happy though. In the back of my mind, I had the nagging feeling of the limit on API Calls to Google Analytics. What if someone had come along (enthusiastically or maliciously), and called the API over 50,000 times in a day? If I needed to build the site once again, it would fail as the JSON file would not be available when the site is built (more on that build step later though).

If you have followed the [Architecting for the cloud, one pattern at a time](/series/architecting-for-the-cloud-one-pattern-at-a-time/) series, then you'll have heard [Peter Piper](/person/peterpiper/) and I talk about the [concept of a Façade](/episode/backends-for-frontends-and-strangler/). It felt like I needed this Façade layer to protect my backend Azure Function (and the calls it makes to the Google Analytics API) using a [Gatekeeper Design Pattern](/episode/gatekeeper-and-valet-key/).

This is where Azure API Management comes in. As this is all for personal/community work, I aim to keep the costs of any supporting infrastructure as low as possible. That made my choice easy; I opted for the [consumption SKU of Azure API Management](https://docs.microsoft.com/en-us/azure/api-management/api-management-features).

> **Note:** While creating the API Management resource, I enabled the System Assigned managed identity feature. It is possible to enable this once the resource has been deployed as well.

I then [imported my Azure Function into API Management](https://docs.microsoft.com/en-us/azure/api-management/import-function-app-as-api), so that I could begin building out this Façade concept and apply additional security policies on that set of APIs.

![Screenshot showing the Azure Function being imported into the API Management instance](images/apim-import-function.png "Screenshot showing the Azure Function being imported into the API Management instance")

Once complete, I then begun thinking about how to protect the backend API from any external calls. There were two considerations here -

* Identity-based protection (i.e. making sure that the caller has some form of JSON Web Token) to verify they have the appropriate claims to perform the desired action.
* Network-based protection (i.e. making sure that the call is coming from a trusted environment)

First, I configured the [built-in authentication and authorization capabilities of Azure Function (Easy Auth)](https://docs.microsoft.com/en-us/azure/app-service/overview-authentication-authorization).

![Screenshot showing the Azure Function with an identity provider configured](images/azure-function-easyauth.png "Screenshot showing the Azure Function with an identity provider configured")

With that complete, once trying to call the Azure Function directly - I receive an error. This is because we haven't associated the appropriate credentials (e.g. Authorization Header and Bearer token) to the request, so the request is considered invalid.

Next up, I updated the inbound policy of All Operations under my Google Analytics API.

![Screenshot showing the policy editor for the Google Analytics API (applies to all operations under that). It has the authentication-managed-identity policy configured against a Client ID that represents the Client ID of the backend application (in this case, an App Registration for the backend Azure Function)](images/apim-auth-policy.png "Screenshot showing the policy editor for the Google Analytics API (applies to all operations under that). It has the authentication-managed-identity policy configured against a Client ID that represents the Client ID of the backend application (in this case, an App Registration for the backend Azure Function)")

I added the ``authentication-managed-identity`` policy to send a JSON Web Token (based upon the API Management resource's System Assigned Managed Identity) to the backend Azure Function (i.e. add an Authorization header and bearer token when sending a request to the Azure Function).

```xml
<authentication-managed-identity resource="ClientIDOfServicePrincipalForBackendApp" />
```
Now you should be able to use the ``Test`` capability of API Management, and obtain a successful call from your backend Azure Function. 

![Screenshot showing the Test Tab in Azure API Management successfully called the backend API, with a 200 HTTP Status code and a JSON object returned in the result.](images/apim-test-response.png "Screenshot showing the Test Tab in Azure API Management successfully called the backend API, with a 200 HTTP Status code and a JSON object returned in the result.")

Doing the same through your browser directly to the Azure Function without any Bearer token should either result in an error or an HTTP redirect to login, depending on how Easy Auth was configured.

![Screenshot showing a direct call to the Azure Function without any Authorization headers resulting in an HTTP 401 status code.](images/azure-function-401.png "Screenshot showing a direct call to the Azure Function without any Authorization headers resulting in an HTTP 401 status code.")

Arguably, the identity protection is 'enough' for my requirements. However, given that I'm on a consumption-based plan, I want to restrict the endpoints that can call the backend function, to protect against DDOS attacks and consider this as a cost control measure (more than a direct security measure in my scenario).

![Screenshot showing the networking tab of Azure Functions with the Access Restriction option enabled.](images/azure-function-networking.png "Screenshot showing the networking tab of Azure Functions with the Access Restriction option enabled.")

On the Azure Function App, I navigated to the 'Access Restriction' item in the Inbound Traffic area of the blade. From there, I set a rule on the ``azurewebsites.net`` tab (rather than ``scm.azurewebsites.net`` which is used for the kudu management portal) to restrict traffic.

![Screenshot showing an Access Restriction configured with an allow rule for the AzureCloud.westeurope Service Tag](images/azure-function-networking-2.png "Screenshot showing an Access Restriction configured with an allow rule for the AzureCloud.westeurope Service Tag.")

> **Note:** I have used Service Tags to restrict the allowed traffic into the Azure Function. I have used the AzureCloud.westeurope service tag, which will allow all traffic from West Europe (not just my subscription). There is a tag for ApiManagement.WestEurope, but that will unfortunately not work. This is because the tag is only used in outbound scenarios, [as documented here](https://docs.microsoft.com/en-us/azure/virtual-network/service-tags-overview#available-service-tags). As the API Management Consumption SKU cannot be VNet injected / deployed into a VNet, this is as granular as possible for the time being.

Once you apply the above rule and attempt to call the Azure Function (at the root address, rather than the Function URL - so that you can distinguish the difference between the identity error vs the networking error), you should see an **Error 403 Forbidden** message - ``The web app you have attempted to reach has blocked your access.``

![Screenshot showing the resulting Error 403 - Forbidden screen that is seen once the access restriction rules have been configured.](images/azure-function-forbidden.png "Screenshot showing the resulting Error 403 - Forbidden screen that is seen once the access restriction rules have been configured.")

A little earlier on, I mentioned that I wanted to restrict traffic to flow only from the API Management instance. Additionally, I wanted to protect against scenarios like DDOS / high requests, so that I can protect the backend Azure Function (from a cost-control perspective), but also the limit of calls that I have to the Google Analytics API (50,000 requests/day as highlighted towards the beginning of this post).

To add a final layer of protection, I also [added rate limiting](https://docs.microsoft.com/en-us/azure/api-management/api-management-access-restriction-policies#LimitCallRate) to the inbound policy of my Google Analytics API in the API Management instance.

![Screenshot showing the policy editor for the Google Analytics API (applies to all operations under that). It has the authentication-managed-identity policy configured against a Client ID that represents the Client ID of the backend application, as well as a rate-limit policy configured to allow 5 calls across 90 seconds.](images/apim-auth-rate-policy.png "Screenshot showing the policy editor for the Google Analytics API (applies to all operations under that). It has the authentication-managed-identity policy configured against a Client ID that represents the Client ID of the backend application, as well as a rate-limit policy configured to allow 5 calls across 90 seconds.")

This is achieved by using the ``rate-limit`` policy, as demonstrated in the below snippet:

```xml
<rate-limit calls="5" renewal-period="90" remaining-calls-variable-name="remainingCallsPerSubscription" />
```

With all of that in place, we now have an API available which can be called in several scenarios. Not just within the build process of [cloudwithchris.com](https://www.cloudwithchris.com), but also from other sites as needed. For example, I'm creating a CV theme for hugo, which you can find on my personal site [christianreddington.co.uk](https://www.christianreddington.co.uk). I'm already displaying the latest blog posts there, but would also like to display the top posts as well.

## Calling the API in our GitHub Action to use the JSON data in Hugo's build process

Now to bring this all together. I already had an extensive GitHub Action Workflow to build [cloudwithchris.com](https://www.cloudwithchris.com). It contains steps to lint the markdown files, compress images for optimisation and minify the hugo build contents, for deployment to Azure Static Web Apps.

As I'm displaying the top posts in a slightly different way to Janne, I have implemented this a little differently. The data is being used on the homepage of [cloudwithchris.com](https://www.cloudwithchris.com), so I don't need to worry about the logic of whether the current page being viewed is in the list, etc, as we're only focusing on blog posts. Even better, I don't need to convert the original JSON output from the API into Markdown as Hugo has a [built-in concept of a Data Template](https://gohugo.io/templates/data-templates/) (i.e. we can reference data from the data subdirectory of our site, by using the ``$.Site.Data.<filename>`` syntax).

This simplifies the logic used in Hugo to display the most popular 3 posts as the following:

```go
{{ $popular := $.Site.Data.popular | first 3 }}
{{ range where $.Site.RegularPages "RelPermalink" "in" $popular }}
  ...  Your UI to display top pages here ...
{{ end }}
```

Arguably, I could commit the JSON file to the Git repository - but my personal opininon is that it'd feel like noise in my version control history. I may change my mind in the future, but for now - I just download the file to the local agent's working directory ahead of the hugo build step.

```yaml
- name: 'Pull popular posts from Google Analytics'
  run: |
    mkdir -p data
    curl --header "Ocp-Apim-Subscription-Key: ${{ secrets.CWC_API_KEY}}" -o data/popular.json https://api.cloudwithchris.com/cwc-ga/GetGoogleAnalyticsData
```

I simply add that line ahead of the hugo build step, to ensure that the popular.json file is in place ahead of the site being built. If it's not in place, then the build will fail (assuming that there are no conditions in the site's logic to prevent that section from being built).

The end-to-end YAML file for the GitHub Action Workflow resembles the below, though you can find the latest on the [cloudwithchris.com GitHub repository](https://github.com/CloudWithChris/cloudwithchris.com/blob/main/.github/workflows/site-deployment.yaml).

```yaml
name: Azure Static Web Apps CI/CD

# This GitHub Action workflow triggers in two scenarios - 
# 1. When a push is made to the main branch
# 2. When a pull request is either opened, synchronized, reopened,
#    or closed, and the target is the main branch. If the change
#    is just to the podcast_audio file, then it is ignored.

on:
  push:
    branches:
      - main
    paths-ignore:
      - 'podcast_audio/**'
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main
    paths-ignore:
      - 'podcast_audio/**'
  schedule:
    - cron: '0 0 * * 0'

# The workflow has several phases. Phases 1, 2 and 3 run on a push, or if the pull request activity
# type is not 'closed'.
#
# 1.  A validation phase, which is split into two separate jobs that run in parallel.
# 1.1 A set of steps that compress images
# 1.2 A set of steps that lint the markdown contents of the website
#
# 2.  Build the Static Website by using the Hugo CLI.
#
# 3.  Deploy the website to Azure Static Web Apps
# 3.1 If the workflow was triggered by a pull request (not a closed activity), then publish the static assets
#     to the static web app. This is associated with the GitHub Actions staging.azure environment.
# 3.2 If the workflow was triggered by a push to main, then publish the static assets to the static
#     web app. This is associated with the GitHub Actions production.azure environment, so requires manual approval.
#
# 4   If the workflow was triggered by a Pull Request close event, then close the staging sites which are open.

# Environment variables used for consistency across the workflow.
env:
  HUGO_VERSION: '0.94.0'
  SWA_NAME: 'cwc-static'
  AZURE_CLI_VERSION: '2.34.1'

jobs:
  # A set of steps used to compress the images, making sure that images are compressed ahead of publishing to the site.
  # This is done to make sure that the browsing experience remains speedy.
  compressor:
    if: github.event_name == 'pull_request' && github.event.action != 'closed'
    name: Compress Images
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v2
      - name: Compress Images
        id: calibre
        uses: calibreapp/image-actions@main
        with:
          githubToken: ${{ secrets.GITHUB_TOKEN }}
  # A set of steps used to lint the markdown files used to generate the content.
  # This is done to make sure there are consistent standards being adopted when writing the material.
  # These standards are configured in the /.github/linters folder of the repository.
  lint:
    if: github.event_name == 'push' || (github.event.pull_request.head.repo.full_name == github.repository && github.event.action != 'closed')
    name: Lint Code Base
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v2
      - name: Lint Code Base
        uses: github/super-linter/slim@v4
        env:
          VALIDATE_ALL_CODEBASE: false
          FILTER_REGEX_INCLUDE: .*content/.*
          DEFAULT_BRANCH: main
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          VALIDATE_JSCPD: false
  # A set of steps used to render the website from the markdown, theme and assets into the HTML, CSS, JS and images that are delivered to a user.
  build:
    runs-on: ubuntu-latest
    steps:            
    - uses: actions/checkout@v2
      with:
        submodules: 'true'
    - name: 'Install Node Dependencies'
      run: npm ci    
    - name: 'Setup Hugo on Runner'
      uses: peaceiris/actions-hugo@v2
      with:
        hugo-version: ${{ env.HUGO_VERSION }}
        extended: true
    - name: 'Pull popular posts from Google Analytics'
      run: |
        mkdir -p data
        curl --header "Ocp-Apim-Subscription-Key: ${{ secrets.CWC_API_KEY}}" -o data/popular.json https://api.cloudwithchris.com/cwc-ga/GetGoogleAnalyticsData
    - name: 'Build and Minify Hugo Contents'
      run: hugo --minify --baseURL 'https://www.cloudwithchris.com'
      if: github.ref == 'refs/heads/main' || github.event_name == 'schedule'
    - name: 'Build and Minify Hugo Contents'
      run: hugo --minify 
      if: github.ref != 'refs/heads/main'
    - name: 'Upload Generated Static Content as Website Artifact'
      uses: actions/upload-artifact@v1
      with:
        name: website
        path: ${{ github.workspace }}/public
  deploy_preview:  
    if: (github.event.pull_request.head.repo.full_name == github.repository && github.event.action != 'closed')
    runs-on: ubuntu-latest
    needs: [compressor, lint, build]
    name: Deploy (Preview)
    environment:
      name: staging.azure
    permissions:
          id-token: write
          contents: read
    steps:
      - name: 'Download Website Artifact'
        uses: actions/download-artifact@v1
        with:
          name: website
      - name: 'Az CLI Login via OIDC'
        uses: azure/login@v1
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
      - name: "Add a mask to the SWA Token"
        uses: azure/CLI@v1
        with:
          azcliversion: ${{ env.AZURE_CLI_VERSION }}
          inlineScript: |
            echo "::add-mask::$(az staticwebapp secrets list -n ${{ env.SWA_NAME }} | jq -r '.properties.apiKey')"
      - name: "Get SWA Token"
        uses: azure/CLI@v1
        with:
          azcliversion: ${{ env.AZURE_CLI_VERSION }}
          inlineScript: |
            echo "SWA_TOKEN=$(az staticwebapp secrets list -n ${{ env.SWA_NAME }} | jq -r '.properties.apiKey')" >> $GITHUB_ENV
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ env.SWA_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: 'upload'
          app_location: 'website'
          skip_app_build: true
  deploy_prod:  
    if: github.event_name == 'push' || github.event_name == 'schedule'
    runs-on: ubuntu-latest
    needs: [lint, build]
    name: Deploy (Prod)
    environment:
      name: production.azure
      url: https://www.cloudwithchris.com  
    permissions:
          id-token: write
          contents: read
    steps:
      - name: 'Download Website Artifact'
        uses: actions/download-artifact@v1
        with:
          name: website
      - name: 'Az CLI Login via OIDC'
        uses: azure/login@v1
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
      - name: "Get SWA Token"
        uses: azure/CLI@v1
        with:
          azcliversion: ${{ env.AZURE_CLI_VERSION }}
          inlineScript: |
            echo "::add-mask::$(az staticwebapp secrets list -n ${{ env.SWA_NAME }} | jq -r '.properties.apiKey')"
      - name: "Get SWA Token"
        uses: azure/CLI@v1
        with:
          azcliversion: ${{ env.AZURE_CLI_VERSION }}
          inlineScript: |
            echo "SWA_TOKEN=$(az staticwebapp secrets list -n ${{ env.SWA_NAME }} | jq -r '.properties.apiKey')" >> $GITHUB_ENV
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ env.SWA_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: 'upload'
          app_location: 'website'
          skip_app_build: true
  # A set of steps used to close old staging sites that are no longer needed, as the PR has now been merged.
  close_pull_request_job:
    if: github.event.pull_request.head.repo.full_name == github.repository && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.STATIC_WEB_APP_TOKEN }}
          action: 'close'
```

## Conclusion

That, in a nutshell is how I have used GitHub Actions, Azure Functions, Azure API Management and Google Analytics to display top posts on my Hugo Static Site. This approach means that there are no 'dynamic' API calls happening when a user loads a page. Likewise, I can rest easy knowing that my backend Google Analytics request limit has been protected (as well as my consumption-based API Management and Azure Function resources).

This also gives me the scope to expand the APIs that I use for [cloudwithchris.com](https://www.cloudwithchris.com) over time, setting up a platform for future endeavours.

So, what do you think? Are you building Static Websites and handling a similar pattern? Or, are you perhaps handling API calls through JavaScript to obtain your dynamic data? I'd love to hear more, so let's continue the discussion in the comments below!