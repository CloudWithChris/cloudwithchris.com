---
Author: chrisreddington
Description: ""
PublishDate: "2022-01-12T09:00:00Z"
image: img/cloudwithchrislogo.png
date: "2022-01-12T09:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Containers
- Kubernetes
- Microservices
- Open Source
series: 
- "CNCF Projects"
title: Introduction to The Distributed Application Runtime (Dapr)
---
In this post, we're going to be exploring the Open Source project known as Dapr (The Distributed Application Runtime). This post is primarily aimed at those who have an understanding of Containers, Kubernetes and Microservices. However, if you're not familiar with these topics - I'll do my best to set the right context and background without making the blog too lengthy!

Are you building a Microservice based system? Are you looking help to solve frequent challenges that come with this architectural? Challenges such as pattern such as encryption, message broker integration, observability, service discovery and secret management. This is exactly where Dapr shines, and may be of value. If this sounds like you, then carry on reading to find out more!

## Why Dapr?

Back in 2019, [Microsoft announced Dapr](https://cloudblogs.microsoft.com/opensource/2019/10/16/announcing-Dapr-open-source-project-build-microservice-applications/) to the world. With the continued growth of cloud and increase in cloud native applications being built, the adoption of microservices grew alongside.

This is unsurprising. Microservices offer some great benefits, including -

* Separation of concerns can lead to easier maintenance compared to a monolith
* Reduced deployment times, and more efficient operations (i.e. DevOps improvements)
* Due to independent services, a lower 'blast radius' if there is a problem during the deployment of a given service
* Empowerment to use different languages, frameworks and technologies per microservice
* Empowerment for separate teams to own their individual services in a distributed manner
* Ability to scale each microservice independently
* Loosely coupled microservices, which if designed with appropriate patterns, could lead to a more resilient architecture.
  * If you want to find out about some of the Cloud Design Patterns, definitely check out my series on [Architecting for the Cloud, One Pattern at a Time](https://www.cloudwithchris.com/series/architecting-for-the-cloud-one-pattern-at-a-time/)

Awesome! Those sound like some great benefits. Let's get using Microservices right away!.. is what quite a lot of engineering teams, developers and others have exclaimed in the past. While these benefits are all completely true, microservices come with their own challenges.

* If you decide to use different languages, frameworks and technologies per microservice, you may be creating the same logic (e.g. retry, circuit breaker, etc.) in different implementations
* Challenging to build a true microservices system, compared to a 'distributed monolith'
* The level of automation and operational excellence that is needed to manage a microservice environment increases proportionally to the number of microservices that you have deployed
  * Alongside that, consider the architectural complexity of managing any dependencies and relationships between all of those services
* Building up an end-to-end view of a user journey through your system. e.g. If I purchase something from your store, I may interact with 5 different microservices as part of that transaction. If there is a failure, how do you know where the failure is, why it happened and what action needs to be taken? Especially if different teams own the different services?
* From a testing perspective, each microservice will have its own lifecycle, and potentially a separate team owning it. How do you easily and consistently test cross-service calls, for example?
* What **is** a microservice? When is a microservice too small, or too big?
  * Domain Driven Design could be a blog post in its own right, so we'll be avoiding that rabbit hole here!

Like any technical problem, we need to way the strengths against the weaknesses, the pros against the cons, the opportunities against the risks. Given the common theme of agility and independent scalability that is seen with Microservices, it's an attractive proposition.

Let's jump back to the question - *What is a microservice*? There is a common misconception that to build microservices, then you're building with containers. That is absolutely untrue. I can build a set of microservices using Azure App Services, Virtual Machine Scalesets, Azure Container Apps or Containers on an Azure Kubernetes Service (AKS) cluster. Likewise, I could build a monolith on any of those technologies as well. Some of those underpinning technologies may be a better alignment to the microservice architectural pattern, but one does not mean the other.

This is where Dapr fits in. Dapr aims to solve several of the challenges that I noted above.

## How does Dapr work?

## What are Dapr components?

## How does Dapr relate to Kubernetes and containers?

## What is the state of Dapr now?

The Dapr team made a promise in [their announcement blog post](https://cloudblogs.microsoft.com/opensource/2019/10/16/announcing-dapr-open-source-project-build-microservice-applications/) that they planned  to *bring Dapr to a vendor-neutral foundation to enable open governance and collaboration*. In early 2021, the Dapr team began to follow-up on that promise and [proposed to donate Dapr to the Cloud Native Compute Foundation (CNCF)](https://github.com/cncf/toc/pull/617) as an incubation project. It was accepted as an incubation project in November 2021, and is still in that state at time of writing.

> If you're unfamiliar with the Cloud Native Compute Foundation (CNCF) or the lifecycle/stages of the project that they host, then take a look at my blog post [Introducing the Cloud Native Compute Foundation (CNCF)](/blog/intro-to-cncf) as well as the episode with [Annie Talvasto](/guest/annie-talvasto) on [Top new CNCF projects to look out for](/episode/top-new-cncf-projects).