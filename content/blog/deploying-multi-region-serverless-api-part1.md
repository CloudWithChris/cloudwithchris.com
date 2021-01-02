+++
Description = "In my spare time, I work on a pet project called Theatreers. The aim of this is a microservice based platform focused on Theatre / Musical Theatre (bringing a few of my passion areas together). I've recently re-architected the project to align to a multi-region serverless technology stack."
date = 2019-07-13T12:00:00-00:00
PublishDate = 2019-07-13T12:00:00-00:00 # this is the datetime for the when the epsiode was published. This will default to Date if it is not set. Example is "2016-04-25T04:09:45-05:00"
title = "Deploying a multi-region Serverless API Layer (Part 1)"
images = ["img/cloudwithchrislogo.png"]
Author = "chrisreddington"
# blog_banner = "img/episode/default-banner.jpg"
blog_image = "img/cloudwithchrislogo.png"
categories = ["Azure", "Cloud Architecture", "DevOps"]
tags = ["Azure", "Architecture", "Scalability", "Resilience", "DevOps"]
#series = ["The Nirvana of DevOps"]
#aliases = ["/##"]
+++

In my spare time, I work on a pet project called [Theatreers](https://www.github.com/theatreers). The aim of this is a microservice based platform focused on Theatre / Musical Theatre (bringing a few of my passion areas together).

I've recently re-architected the project to align to a serverless technology stack. This includes:

* A set of **core global services**, such as -
  * A Single Page App hosted on Azure Blob Storage
  * Azure Front Door that sits in front of the blob storage, as well as the back-end API servicess
* A number of **core regional resources** that exist in each region and are used across the suite of microservices -
  * An API Management instance deployed in the Consumption Tier
  * An App Insights resource used as a sink for all telemetry within a regional deployment
* A set of resources that are deployed as part of a **regional microservice stamp**. This includes  -
  * An Azure Key Vault
  * The resources required to deploy an Azure Function (App Service Plan, Storage Account and Azure Function App) in consumption mode.

This first blog post will focus on the ARM Template design for the **core regional resources**, particularly, the API Management tier.

The consumption mode of API Management is currently in preview, so do be aware of this before planning to adopt in production. Check the Azure Docs for the latest information on that.

The project uses the concept of **[Linked Templates](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-linked-templates)** to deploy the sets of resources. This is orchestrated using a [core regional resource group](https://github.com/Theatreers/Theatreers.DevOps/blob/master/arm-templates/coreResourceGroupRegional.json) template. You will notice that this template calls additional **capability templates** (Sometimes I refer to these as *building blocks*). One of these capability templates is called apim.json. Please see the gist below for an example, though this will not be maintained - Take a look at the link above for the latest and greatest.

<script src="https://gist.github.com/christianreddington/ab8758676f5e89ee8df3fa783f665cc5.js"></script>

The concept of Linked Templates is that Azure Resource Manager can deploy other Azure Resource Manager templates. Those other templates must be accessible on either HTTP or HTTPS over the internet. The templates can be held securely; a typical pattern is to use a private store (Such as Azure Blob Storage) and pass in a SAS token in the URL. Stores where some form of authentication is required are not supported.

This linked template approach gives us modularity for our infrastructure templates, meaning separation of concerns. As we know from software engineering, this gives us reusability and also the ability to unit test individual components.

The API Management template referenced in the previous gist can be found in the next gist;

<script src="https://gist.github.com/christianreddington/f0f13c1e25743a33fa0d0ea78177a606.js"></script>

Notice that the template is solely focused on the API Management Infrastructure, and not any of the APIs that would be presented through the API Management resource. The core piece to understand here is that the templates are being separated out from a lifecycle perspective.

The core infrastructure will be deployed in a separate lifecycle to the APIs. This is because the APIs will be deployed in a separate pipeline which aligns to the deployment cadence of each individual Microservice that it is representing.

Notice that the template takes two parameters, a location and a namePrefix. This is what provides the flexibility to deploly across multiple regions (i.e. the appropriate naming prefix for the region, and the region in which it should be deployed).

Also note that the parameters defined in the template are limited. This is a core recommended practice for Infrastructure as Code, ensuring that the template is deterministic (predictable). Imagine the scenario from a live operational perspective. If you have 20 different parameters that can be tweaked, the resulting deployment may be less predictable and prone to accidental misconfiguration due to human error. To gain the flexibility of different environment configurations, you could consider the "T-Shirt sizing" approach. This is where you would have a parameter that drives the resulting configuration (e.g. environmentName mapping to dev or prod), which then adjusts the variables used for the number of units to be deployed, SKUs, etc.

We mentioned above that the deployment lifecycle of the separate layers has influenced the ARM template design. There is a separate Linked Template that deploys the back-end resources that host the Microservice. It also deploys the APIs onto the API Management resource which was previously deployed, and maps those APIs to the back-end resources hosting the Microservice. Notice how some of those resources defined in the below template also specify a resource group name. This shows how we can trigger deployments across a number of resource groups.  

<script src="https://gist.github.com/christianreddington/3e777fdfb3deada8b03a4f1f215dc7b2.js"></script>

Overall, this provides you a very brief insight into the ARM template design for my API layer which can exist across multiple Azure regions. A separate blog post will follow which focuses on the Azure DevOps pipeline used to deploy these ARM templates.

If you have any questions, please get in touch with me on Twitter - [@reddobowen](https://www.twitter.com/reddobowen)