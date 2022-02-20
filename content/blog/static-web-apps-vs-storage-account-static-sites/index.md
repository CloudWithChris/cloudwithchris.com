---
Authors: 
- chrisreddington
Description: "If you've seen any of my community talks, then you'll be aware that Static sites and the Static Content Hosting Pattern is a passion area of mine. In Azure, there are a couple of great services that stand out when building towards this approach. These are Azure Static Web Apps and the Static sites functionality in Azure Blob Storage. But, which one is right for your scenario? Read on to find out more."
PublishDate: "2021-07-28T09:00:00Z"
image: img/cloudwithchrislogo.png
date: "2021-07-28T09:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Static sites
- Hugo
- Static Content
title: Choosing between Azure Static Web Apps and Static sites on Azure Storage
banner: "images/banner.jpg"
---
If you've seen any of my [community talks](/talk), then you'll be aware that Static sites and the Static Content Hosting Pattern is a passion area of mine. In Azure, there are a couple of great services that stand out when building towards this approach. These are Azure Static Web Apps and the Static sites functionality in Azure Blob Storage. But, which one is right for your scenario? Read on to find out more.

The [Static Content Hosting Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/static-content-hosting) is essentially a way to serve up static assets to your end users without using expensive compute (i.e. servers). Typically, this is achieved by using services like Azure Blob Storage, Amazon S3, Google Storage Buckets or similar. In general, this pattern doesn't have to be about serving websites, but that will be the focus throughout this post.

This pattern lends itself well to the modern web development paradigm of JAMStack. The JAM in JAMStack stands for Javascript, APIs and Markup (hence JAM). Ultimately, this relies on a number of modern development practices (such as version controlled source files; a build pipeline to ensure the raw Markdown files can be compiled into the final HTML, CSS, JavaScript and images that are ultimately served up to an end-user's web browser).

Now given that context, what are our options to deploy a Static Site onto Azure? There are of course more options than the initial two which we'll focus on, but these two are some great candidates to begin with.

## Azure Static Web Apps

Azure Static Web Apps was launched as a preview service in May 2020, and went Generally Available in May 2021. It is a Platform as a Service (PaaS) option which provides a number of great features out of the box, including -

* Ability to quickly create a GitHub Action Workflow or integration with Azure Pipelines
* Automatic provisioning of staging environments
* Free SSL Certificates
* Ability to associate custom domains
* Ability to deploy Azure Functions as part of your Static Web App deployment, for a true serverless site
* Ability to easily integrate Authentication and Authorization capabilities into your site

I put together [a longer writeup about Azure Static Web Apps when it went Generally Available](blog/static-webapps-general-availability/), so I'd encourage you to read that one as well.

## Static sites on Azure Storage

The [Static sites on Azure Storage feature went Public Preview in June 2018](https://azure.microsoft.com/en-gb/updates/azure-storage-static-web-hosting-public-preview/), and went [Generally Available in December of the same year](https://azure.microsoft.com/en-gb/updates/general-availability-static-websites-on-azure-storage/).

If you're familiar with Azure Blob Storage, then you'll be comfortable using the static sites feature of Azure Blob Storage. When you enable the static site functionality, it simply creates a ``$web`` blob container in your Azure Storage Account. You will also see that there is a new URL endpoint available to access the assets stored under this container.

Any files that are available in the ``$web`` container can be served up through a web browser, by using the new endpoint mentioned above. Unlike Static Web Apps, there is no additional functionality for Single Page Applications. It is a very simple offering, and does exactly what it intends to do - provide an option to host static web assets and expose them to the internet.

While the functionality in Azure Storage is basic (in comparison to Azure Static Web Apps), that doesn't mean that it's impossible to replicate the functionality available in Azure Static Web Apps. You could consider Azure Static Web Apps as a turnkey approach for Single Page Applications, whereas Static sites on Azure Storage requires some additional work.

For example, the site you're reading (Cloud With Chris) is - and has been - hosted using the Static sites on Azure Storage approach since March 2020. As an end-user, when you navigate to [www.cloudwithchris.com](https://www.cloudwithchris.com), you'll be routed to an Azure CDN instance that is fronting the Azure Storage Account which hosts the production Static Site. The CDN is how I'm able to have an SSL Certificate mapped against a Custom Domain, otherwise that wouldn't be possible directly on the storage account (as there's no way to map a custom SSL certificate in that way directly).

I also have a capability to render staging instances of my site. Just take a look over at [https://staging.cloudwithchris.com](https://staging.cloudwithchris.com) or [https://preview.cloudwithchris.com](https://preview.cloudwithchris.com). As you would expect, each of these instances are behind a CDN endpoint. Once again though, this is not a turn key solution. This has been a significant amount of work.

First, piecing together my own deployment pipeline. The first step of my process is triggered when a Pull Request is created to merge a preview branch into dev. This creates a new subdirectory in the ``$web`` container of my Cloud With Chris preview storage account. Once approved and merged to dev, then the next step is to upload the assets to the Cloud With Chris Staging Storage Account (aka my dev environment, ready for go-live). Once all checked and ready to go, these changes are merged to the main branch. This triggers a release to the Cloud With Chris production storage account, and purges the CDN endpoint for production.

Authentication and Authorization could be added to my Static Site hosted in Azure Storage, but this require upfront planning in terms of identity providers, a service to enable that and then adding the functionality into the application. With Azure Static Web Apps, there is a streamlined experience to set this experience up and enable it within your application.

## So, which one is right for me?

Ultimately, you need to make a judgement call. Do you want something which enables you to get moving quickly and deploy your Single Page Application (SPA) quickly? Or, would you rather have a little more control and granularity, and focus on the underlying building blocks?

Personally, if I were starting with a new site - it would be an easy decision in my opinion. I would choose Azure Static Web Apps, as it takes a large amount of overhead away from me. Not only that, but if my site is a community/hobby site, then there is even a free tier available! The standard tier does not have a significant cost associated with it though, and certainly won't break the bank.

I will likely migrate Cloud With Chris to Azure Static Web Apps over time, but the Static sites on Azure Storage approach works for me right now. As nothing is broken, I don't plan on making any fixes anytime soon :)

## Conclusion

Overall, this has been a very short blog post - pulling together some thoughts on a couple of options that I see in this space. Are you running any Static sites? How are you hosting them, whether on Azure, or other platforms? Let me know over on [Twitter, @reddobowen](https://twitter.com/reddobowen).

Thanks for reading, and until the next post - bye for now!
