---
Author: chrisreddington
Description: "TBC"
PublishDate: "2021-08-02T09:00:00Z"
image: img/cloudwithchrislogo.png
date: "2021-08-02T09:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Messaging
- Architecture
- Integration
- App Development
title: How I use Azure Integration Services on Cloud With Chris
---
## Why was a revamp needed of the Cloud With Chris integration platform?
I've written blog posts previously around [Azure Service Bus vs Azure Storage Queues](/blog/storage-queues-vs-service-bus/), as well [as introduction to Azure Logic Apps](/blog/introduction-to-logic-apps/) and how I used it at the time. Back then, my usecase was fairly rudimentary and focused on a specific scenario. In this blog post, I explain the changes that I have made and how I've used common integration patterns to implement a more robust solution.

So let's first establish the original problem statement and how it has evolved. I required a solution to crosspost content (e.g. Azure Blogs, Azure Updates, Cloud With Chris Blogs) with some kind of personal message across several social platforms. Initially, my scope was to post on these social networks immediately, or to queue messages using an external service called Buffer.

Longevity and robustness was not the primary objective. The objective was a quick and dirty initial proof of concept to unblock my immediate needs of crossposting content with custom comments, including the URLs to the original content. As I designed the initial solution to solve a targeted usecase, it quickly became apparent that a more robust solution was needed.

**Add an item around many different processes to try and achieve level of functionality.**

## The next iteration of the architecture

This time around, I opted to do some up front planning on the design. I've said it on the channel several times previously; failing to plan is planning to fail. This is where I went through several iterations of an initial design, the most recent version looks similar to the below.

![Architecture Diagram of Cloud With Chris Integration Platform](/img/blog/how-i-use-azure-integration-services/architecture-diagram.png)

Let me first describe the main phases of the integration process flow.

### Summarising the overall flow

* **Ingestion Phase** - Each source (e.g. Individual RSS Feed such as Azure Blogs, Azure Updates, Cloud With Chris Episodes, Cloud With Chris blogs, etc.) has a Logic App which is checking for new blog posts. Once a new blog post is detected, an object is created in Azure Table Storage (including item title, item type [e.g. blog, episode, azureblog, azureupdate, azuredevopsblog, etc.], summary, etc).
* **Approval Phase** - A Single Page Application is used to render the pending list of items to be approved. These content items can be processed individually (i.e. approved/rejected). An approval can contain many sets of actions.
  * The flexibility among approvals is the key difference and magic to extensibility in the new scenario. Each content item can have many *actions* associated with them. 
    * An action can have one or more  action types. At time of writing, these are immediate, scheduled and roundup. 
    * An action can post to one or more platforms. At time of writing, these are Facebook, LinkedIn, Twitter and Reddit.
  * If a message is approved, it is sent to an Azure Service Bus topic and deleted from the Azure Table Storage.
  * If a message is rejected, it is deleted from the Azure Table Storage.
  * I am considering making an adjustment to this functionality. instead of deleting from Azure Table Storage (in either approval or deleted), it should perform an update instead, so that I can keep a log of all content items previously processed. That allows me to see a history, but also allows me to re-post content in the future if I wish.
* **Processing Phase** - Messages are posted into a Service Bus Topic called **Actions**. In the future, this Topic will have several subscriptions (Which act as my extensibility point). At time of writing, there is a subscription called **Immediate** and another called **Schedule**.
  * Each subscription has a filter associated.
    * The Immediate subscription has a filter for a custom property actionType matching immediate.
    * The Schedule subscription has a filter for a custom property actionType matching schedule.
  * There is a specific Logic App deployed for each subscription. For example, there is a Logic App to process messages picked up by the Immediate Subscription. There is another Logic App to process the messages picked up by the Schedule subscription.

## Cloud Design Patterns adopted within this architecture

Let's run through a few of the key Cloud Design patterns used in this architecture.

This architecture heavily uses the [pipes and filters pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/pipes-and-filters).

* In a nutshell, this pattern is when we breakdown complex processing into a number of distinct tasks. That means that these individual processing tasks can be deployed and scaled independently.
* The previous iteration of the integration platform was effectively a distributed monolith. While there were separate services / components, they were all tightly coupled. The pipes and filters pattern aims to promote a modular architecture, enabling re-use and easy refactoring.
  * As an example, I had a separate process for Azure Blogs/Updates, to my Cloud With Chris blog, which would all effectively use the same process. This is in essence, the description under the *Context and Problem* section of the Azure Architecture Center doc.
* The current iteration relies upon a consistent messaging format being passed between the various stages of the processing pipeline. That way, the individual processing stages can be decoupled and work independently of each other, allowing flexibility and ease of extensibility.
* You can find out more about the [Pipes and Filters pattern in my Architecting for the Cloud, One Pattern at a time series with Will Eastbury](/episode/priority-queues-pipes-filters/).

This architecture also leans on the [Publisher Subscriber pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/publisher-subscriber). You may have also heard of this as the Pub/Sub pattern.

* The previous implementation was inspired by this pattern but didn't use a true messaging service to achieve this. Ironically, I used a Microsoft Teams channel to post JSON messages representing new content.
  * This was more of a workaround / 'art of the possible' implementation, as I didn't have access to the Azure connections in PowerApps. As PowerApps was being used for my ingestion of new blogs/episodes (due to the Approvals functionality in Power Apps, which was needed for custom comments in posts), Microsoft Teams was being used as a workaround as a messaging bus. In summary, it allowed for 'decoupling', but didn't give me a true Publish/Subscriber approach, with all the benefits that I'd want to leverage.
* I'm using asynchronous messaging to decouple the several processing components needed within this implementation. This is how we decouple our senders (e.g. The Approvals Function App approving items of content) and the receivers (the array of Logic Apps processors for each of the action types).
  * If you follow the Azure Docs Cloud Design Pattern definition, you'll see that it describes subscribers as the ability to have multiple output channels for a message broker. That's exactly what I've implemented for the latter phase of the architecture.
* It could be argued that a Publisher Subscriber pattern being used in the first phase of the architecture too. The array of Logic Apps per content source are the senders. The Approval Single Page Application is the receiver. The Azure Table Storage is being used as a pseudo message broker. While it's not a typical broker/bus (e.g. Azure Storage Queue / Azure Service Bus), I chose Azure Table Storage as it's able to persist the messages until they are approved. Ordering of the messages isn't a requirement, but longevity of the records is of higher importance.
* You can find out more about the [Publisher Subscriber pattern in my Architecting for the Cloud, One Pattern at a time series with Will Eastbury](/episode/priority-queues-pipes-filters/).

## Technologies adopted within this architecture

TBC

## Ingestion Phase

## Approval Phase

## Processing Phase

## Next steps on building out this architecture

* Component re-use, e.g. further optimisation of processors (e.g. isngle item for posting to a social media rather than replicationg functionality)