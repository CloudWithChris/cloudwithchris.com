---
Authors: 
- chrisreddington
Description: "I've recently been involved in a few integration focused discussions, where there is a requirement to bring together multiple separate systems. If you've been following the Architecting for the Cloud, one pattern at a time series, then you'll have heard Peter Piper repeat a common phrase - 'High Cohesion, Low Coupling'."
PublishDate: "2021-07-13T12:00:00Z"
image: img/cloudwithchrislogo.png
date: "2021-07-13T12:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Messaging
- Architecture
- Integration
- App Development
title: Azure Storage Queues vs Azure Service Bus Queues - Which should I use when?
---
I've recently been involved in a few integration focused discussions, where there is a requirement to bring together multiple separate systems. If you've been following the Architecting for the Cloud, one pattern at a time series, then you'll have heard Peter Piper repeat a common phrase - "High Cohesion, Low Coupling".

High cohesion and low coupling effectively means that these separate systems should relate to each other (i.e. work well with each other), without tying any dependencies to each other (so they can exist well independently of each other). This is where introducing technologies such as API Management (to act as a Facade), or technologies such as Azure Service Bus and Azure Storage Queues (to act as a queue or buffer between the producer and consumer) comes into play.

Let's stick with the concept of decoupling for a moment. Consider a scenario where you have a significant amount of load arriving into an API which calls a database, and don't have any decoupling in place. What's going to happen? Hopefully you have autoscaling enabled on the underlying service that is hosting your API, in which case, that layer will scale. However, the calls to the backend database will potentially become a bottleneck. This is another classic scenario where queueing technologies such as Azure Storage Queues or Azure Service Bus can help, by introducing the [Queue-Based Load Leveling pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling) and a separate service (consumer of the queue) to process the requests asynchronously.

So to recap, we've established that queuing technologies can help us both from a performance and scalability perspective, as well as availability. We're now convinced that it's time to use one of these technologies within our solution. But which one?

As you may expect, the answer to this one depends! These services are two great options for your queueing needs. But that's just the point - **your** queueing needs. A non-critical business process that runs once a month is going to have significantly different requirements to a banking system.

Finance is a great analogy in these scenarios. Consider your own bank account, and that you have £100 in your bank account. If you are sent £50 and transfer £150, you would expect the operations to happen in that order. But, what happens if the systems that process transactions received the £150 debit first, and then the payment for £50 later? Well, you would be overdrawn, and your bank would want you to pay a fee for that service. In this scenario, there is a tangible consequence of not receiving messages in the order that they were sent.

The previous example is contrived, but illustrates the point. Each scenario is going to be different, so you first need to truly understand the business problem that you're looking to solve. What are the characteristics of the problem? What is being sent in the messages (i.e. how big are they)? Is it a simple queueing approach (i.e. the queue acts as a bus between instances of a producer and instances of a consumer)? Or is it a Topic/Subscription approach (i.e. more complex routing is needed of messages from instances of a producer, potentially to many consumers)?

In Cloud With Chris, I actually use Azure Service Bus Topics. It has nothing to do with the core site platform, as that's hosted using static sites in Azure Storage (currently, though I plan to move across to Azure Static Web Apps in the future). I have built a wider integration platform to schedule my social media posts across platforms, and route the messages to the appropriate consumer (i.e. what action to take based upon a message). Having the flexible routing was a core requirement as I built out my integration platform, which drove me towards Azure Service Bus immediately.

So, what are the differences between the two services? And what are the key decision points between them? Let's explore further.

* **Azure Storage Queues** is a service built on top of Azure Storage (you probably guessed that one already, though!). Messages are sent to a queue using HTTP or HTTPS, and can store messages up until the capacity of the storage account (at tie of writing, that's 500TB I believe), with a limit of 64KB per message.
* **Azure Service Bus Queues** is capable of acting as queue, publish/subscriber, and other messaging/integration pattern formats. This is the type of technology that you would typically expect to see being used as an Enterprise Messaging bus, integrating multiple components. The maximum queue size is not as significant as Azure Storage, but a message size can range from 256KB (standard tier) through to ~~1MB~~ 100MB (premium tier). Service Bus can provide some guarantees around message ordering, which Azure Storage Queues cannot.

> **Note**: [An update](https://azure.microsoft.com/en-gb/updates/public-preview-azure-service-bus-support-for-large-messages/) was made to the Azure Service Bus platform after this blog post's original release. A premium tier namespace can now support sending and receiving message payloads up to 100MB in size. Previously it was 1MB.

Let's review some of the key decision points -

* **Delivery Guarantee** (i.e. will the consuming application be guaranteed to receive the message)?
  * **Azure Storage Queues** guarantees at least once delivery.
  * **Azure Service Bus Queues** can provide at least once delivery using a PeekLock receive mode (more on that in a moment), or **At-most-once** by using ReceiveandDelete mode.
* **Ordering Guarantee** (i.e. are messages received in the order in which they were sent)
  * **Azure Storage Queues** does not provide this guarantee.
  * **Azure Service Bus Queues** provides First-In-First-Out guarantees when using message sessions
* **Receive Mode** (i.e. the way in which messages can be retrieved from a queuing technology by a consumer)
  * **Azure Storage Queues** uses the peek & lease access approach. Once a message is picked up by a consumer, it is not removed from the queue. Instead, a lease (i.e. time-based limit) is placed on the message, before it is avaialble for another consumer to process.
  * **Azure Service Bus Queues** has two options.
    * **Peek & Lock** - The message is held on the queue, but a lock is put on the message which is held exclusively by the consumer.
    * **Receive & Delete** - The message is considered consumed as soon as the Service Bus has transferred the message (i.e. the consuming application won't be able to guarantee that the message has been fully processed. So if there's an issue mid-processing, then the message could be lost). This scenario makes sense if the messages are low-value, but makes little sense in the banking scenario that we outlined earlier.
* **Lease/lock precision** (i.e. at what level of scope is the lease/lock duration specified?)
  * **Azure Storage Queues** - The lease duration is associated to the message, so is something that you specify when you send the message to the queue. This is set to 30 seconds by default, but can be increased to 7 days, which is the maximum.
  * **Azure Service Bus Queues** - Each queue (or subscription) has a message lock duration property. The lock can be renewed if needed. By default, this is set at 30 seconds but can be changed.
* **Batched receive** is possible in both **Azure Storage Queues** and **Azure Service Bus**, but the way to achieve this is slightly different in each scenario.

There are many other considerations, but these are some of the typical factors that I see come up. For a fuller, and more complete picture (e.g. advanced capabilities of each queueing technology, as well as the limits in place for each), I encourage you to take a look through the [Azure Docs](https://docs.microsoft.com/en-us/azure/service-bus-messaging/service-bus-azure-and-service-bus-queues-compared-contrasted).

With anything, this all works well in theory. However, I'd strongly encourage you to trial your preferred option in a Proof of Concept. Not just the basic "does this work as expected", but then working through some of the operational considerations around poisoned messages, dead lettering, and ultimately being able to handle messages that do not get processed correctly. You'll want to test whether this has any adverse impact upon the application that you're building, and whether this works as expected. You don't want to start seeing strangeness, i.e. messages going missing, when you expected guaranteed delivery, or duplicate records being created, when you expected at most once delivery.

In my opinion, queueing is unavoidable in the cloud (similar to caching). We're now operating in a world where content is being sent across an unreliable internet connection, rather than a reliable local network. We need to design for failure within our solutions, so holding messages in a queue until a consumer has guaranteed processing of the contents is table stakes.

Of course, using queueing technologies will depend on the scenario. For example if you have strict SLAs on the time it takes to process an incoming request, is the time taken to queue the message, perform the needed process, and return the response too long? But again, what is too much? This is where quantifiable requirements are crucial, so that prioritise can then be evaluated.

When building applications, we always need to keep our requirements in mind. For a brand new Cloud Native Application, we'll likely have a requirement that of high cohesion and low coupling, so that services can operate independently (not necessarily microservices, but the concept fits) of each other and not cause a cascading failure ([bulkhead pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/bulkhead), anyone?).

So, with that - please go ahead and review the [Storage queues and Service Bus queues - compared and contrasted documentation](https://docs.microsoft.com/en-us/azure/service-bus-messaging/service-bus-azure-and-service-bus-queues-compared-contrasted), as it will help you evaluate which option will be the best fit in your scenario. Make sure you've done your homework first, and have a good idea of the requirements that you're working towards.

Thanks for reading this blog post! I'll be writing up another one in the near future about my Cloud With Chris integration platform and how I've adopted Azure Service Bus Topics/Subscriptions in the architecture. So, stay tuned for that one!