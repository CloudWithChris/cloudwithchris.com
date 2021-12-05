---
Author: chrisreddington
Description: "I've talked in the past about my Open Source journey, and some of the contributions that I have made in the community. In my current role, I've been leading on the global strategy for my team's DevOps practice, defining the areas of focus and initiatives that may be beneficial for the team. In this post, I'm going to talk through one of these initiatives, and how you can contribute towards the Azure GitHub Actions experience!"
PublishDate: "2021-02-10T09:00:00Z"
image: img/cloudwithchrislogo.png
date: "2021-02-10T09:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- GitHub
- GitHub Actions
- Azure
- Manual Approvals
title: Contributing towards Azure GitHub Actions
---
I've talked in the past about my Open Source journey, and some of the contributions that I have made in the community. In my current role, I've been leading on the global strategy for my team's DevOps practice, defining the areas of focus and initiatives that may be beneficial for the team. In this post, I'm going to talk through one of these initiatives, and how you can contribute towards the Azure GitHub Actions experience!

Over the past few months, I have been working with a global virtual team on contributing additional workflow samples to the Azure GitHub Actions repository. First, let's level set.

- The [GitHub Actions for Azure repository](https://github.com/Azure/actions) is where you can find the latest and greatest information on the official GitHub actions available to deploy your workloads to Azure using GitHub. You can of course search for these in the GitHub marketplace as well!
- Aside from the GitHub repository, there is also a [landing page in the Azure Docs](https://docs.microsoft.com/en-us/azure/developer/github/github-actions) to help guide you to the content that is available across the Azure Docs (as some of it exists in service specific areas, e.g. examples for deploying to certain Azure services).
- There is an [Azure GitHub Actions Workflow Samples Repository](https://github.com/Azure/actions-workflow-samples) available, with several example workflows in place for you to easily use as a basis for your own workflows.

Why am I talking about this? Well, you may have noticed a common theme in the above 3 bullet points. All of the content across those 3 links lives within a public GitHub repository, meaning that anyone is free and able to contribute towards enhancements, suggestions and more.

If you're passionate about GitHub, DevOps processes, Automating builds/deployments and want to input into a growing community, then this could be a great opportunity to contribute towards! The team behind the repository and the content are brilliant, and very happy to support you in shaping your contributions.

As an example, I have created a [sample for pushing Nuget packages to Azure Artifacts or GitHub Package Registry](https://github.com/Azure/actions-workflow-samples/blob/master/PackageManagement/nuget.yml), and made several documentation changes to make it easier for an end user to consume. I also have a work-in-progress contribution focused on pushing npm packages to Azure Artifacts, npm Registry and GitHub Packages registry. One of my brilliant colleagues has submitted a Pull Request of a [sample for dockerized asp.net core web app with SQL DB](https://github.com/Azure/actions-workflow-samples/pull/58).

With the recent addition of environments and manual approvals to GitHub actions, I don't think there's a better time to bringing your skills and passion to help a growing community of Azure GitHub actions. Think about those services that you're using day-to-day in an Azure environment. Are there samples already in place? Have you already made something that you could contribute? And could this be the start, or continuation of your journey contributing into open source?

If you want to bounce any ideas, please do give me a shout over on Twitter - [@reddobowen](https://twitter.com/reddobowen)! Until the next blog post, bye for now!