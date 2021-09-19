---
Author: chrisreddington
Description: "Migrating to the Cloud is more than just deciding which technology you want to adopt, or building out the appropriate architectures for your implementation. There is a significant amount of planning needed before you take your initial steps. For example, the initial migration process, establishing a foundation for your ongoing governance, and the wider management of expectations from your business, as well as establishing team structure and responsibilities. This is where the Azure Cloud Adoption Framework comes in."
PublishDate: "2021-09-20T07:00:00Z"
image: img/cloudwithchrislogo.png
date: "2021-09-20T07:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Azure
- Cloud
- Cloud Migration
- Cloud Adoption
title: What is the Azure Cloud Adoption Framework?
---
Migrating to the Cloud is more than just deciding which technology you want to adopt, or building out the appropriate architectures for your implementation. There is a significant amount of planning needed before you take your initial steps. For example, the initial migration process, establishing a foundation for your ongoing governance, and the wider management of expectations from your business, as well as establishing team structure and responsibilities. This is where the Azure Cloud Adoption Framework comes in.

The Azure Cloud Adoption Framework was initially released in July of 2019, as highlighted in [this initial blog post](https://azure.microsoft.com/en-us/updates/introducing-the-microsoft-cloud-adoption-framework-for-azure/). It has received several updates since it's initial release, and is based upon Microsoft's engagements across several customers.

## How to use the Azure Cloud Adoption Framework?

The Azure Cloud Adoption Framework may look a little overwhelming and intimidating upon first glance. But, don't worry! This is not something where you have to complete everything all at once. The purpose of the Cloud Adoption Framework is to help with your Cloud Adoption journey. Take that point in. It's a journey. Having said that though, there will be controls that are easier to implement ahead of users adopting your system.

> **Tip:** Consider aspects like cost management (i.e. resource tagging) or policies which restrict what users can do. It's better to implement these ahead of time, so that you have a clear understanding of what is in your environment ahead of users spinning resources up.

### Getting started

To start, take a look through the [Get Started with the Cloud Adoption Framework](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/get-started/#cloud-adoption-scenarios) documentation. This will give you an idea on the appropriate starting point for your adoption journey. 

If you've already taken your first steps, then you may want to consider:

* [Cloud adoption scenarios](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/get-started/#cloud-adoption-scenarios)
* [Cloud adoption antipatterns](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/get-started/#cloud-adoption-antipatterns)
* [Align foundations](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/get-started/#align-foundation)
* [Accelerate adoption](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/get-started/#accelerate-adoption)
* [Improve controls](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/get-started/#improve-controls)
* [Establish teams](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/get-started/#establish-teams)

### Using the framework over time

The Cloud Adoption Framework is split into several categories, which makes it simpler for you to digest as an end-user.

Organizations will be at different stages of their adoption journey, which is why the Cloud Adoption Framework is built in this modular approach. Different areas of the framework may be a priority for you at different times of your own journey. These categories are -

* [Strategy](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/strategy/) - Making sure that your business strategy on the drivers/purpose of moving to the cloud is clearly documented and understood.
* [Plan](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/plan/) - Convert the strategic goals into an actionable plan that can be understood by implementation teams.
* [Ready](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/ready/) - Ensure that your environment is ready for that migration/innovation stage, by ensuring you have the appropriate foundations in place. This includes the Landing Zone. More details on that available in [this post](/episode/migrating-to-the-cloud/), or [this post](/episode/intro-to-landing-zones/).
* Adopt
  * [Migrate](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/migrate/) - Guidance for those workloads that don't require significant re-work. Typically referred to as a lift and shift.
  * [Innovate](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/innovate/) - Guidance for those workloads that can deliver business value by creating new applications, or refactoring/implementing new features in existing applications. This is typically done iteratively, starting with a Minimum Viable Product (MVP) to demonstrate the initial business value.
* [Govern](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/govern/) - As we're working in a different environment, we may need to rethink or build upon our existing governance strategy. Our users are typically empowered to create resources (commonly through Infrastructure as Code), so it's important to put appropriate guard rails and foundations in place to protect our users (e.g. tagging, policies, locks, etc.)
* [Manage](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/manage/) - The technical aspects require significant planning up-front. But, so do the operational concerns to ensure that the solution is delivered with operational excellence.
* [Secure](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/secure/) - Cloud Adoption is a journey. Cloud Security is another journey. This section provides guidance on processes, best practices, models, and experiences which should be considered.
* [Organization](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/organize/) - To successfully adopt the cloud, it's not just about the technology - it's about the people and teams you're empowering. Ensuring an appropriate operational model is in place ahead of a go-live is critical.

I hinted that the Cloud Adoption Framework is updated regularly. If you've already started using it, then you may want to check out the [what's new section](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/get-started/whats-new), to keep up to date on the evolving framework.

## Other tips

I'm not going to recommend that you check out one section over another, as it really all depends upon your starting point and what the priorities are for you.

However, I'd suggest having a quick scan throughout each of the sections - even if you feel that you have 'completed' oen of those sections. That way, you'll be able to identify if there are any areas that are overlooked.

For example, some great resources that stand out to me include -

* [Govern - Standard Enterprise Governance Guide](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/govern/guides/standard/) (Note: There is an alternative/complimenting set of guidance for enterprises)
* [Manage - Establish operational management practices in the cloud](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/manage/best-practices)
* [Security - Securing DevOps (and other best practices)](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/secure/best-practices/secure-devops)
* [Organize - Align the RACI matrix](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/organize/raci-alignment)

Finally, there are assessments available to help you baseline your current status, and use this as a basis for iteration and improvement.

Just like the [Azure Well-Architected Framework and Assessment](/blog/azure-well-architected-framework/), there are similar assessments for the Cloud Adoption Framework.

The following assessments may be useful in the context of the Azure Cloud Adoption Framework -

* [Cloud Journey Tracker](https://docs.microsoft.com/en-us/assessments/?mode=pre-assessment&id=cloud-journey-tracker)
* [Governance Benchmark](https://www.cafbaseline.com/)
* [Strategic Migration Assessment and Readiness Tool](https://docs.microsoft.com/en-us/assessments/?mode=pre-assessment&id=Strategic-Migration-Assessment)

## Wrap-up

Have you already been using the Cloud Adoption Framework for your own project? Or, perhaps this blog post has given you the inspiration to start using it? Let us know either in the discussion below, or in the [GitHub Discussions section of the cloudwithchris.com repository](https://github.com/CloudWithChris/cloudwithchris.com/discussions). The intent of this blog post was not to be an in-depth write-up of the Azure Cloud Adoption Framework, but to draw attention to it, and the ongoing investment that it is receiving.

If you'd like to see more content on this, then please let me know any specifics that you'd like to see - I can be sure to add it to the backlog! Thanks for reading this post, and bye for now!