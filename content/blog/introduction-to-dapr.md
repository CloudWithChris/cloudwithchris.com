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

This is where Dapr fits in. Dapr aims to solve several of the challenges that I noted above. The aim is to allow developers to focus on their core application / business logic, and not have to think about solving the challenges of a distributed system.

## How does Dapr work?

### The sidecar concept

Conceptually, Dapr works by using the [sidecar architectural pattern](https://www.cloudwithchris.com/episode/sidecar-and-ambassador/). In a nutshell, a sidecar is some software that is deployed alongside your application in a separate process. For example, in a Kubernetes environment - this would be achieved by deploying two containers (the main application, and the sidecar application) in a single pod. The idea is that the sidecar's software works transparently with the application, and provides supporting functionality. 

> If you prefer analogies, consider a motorbike with a sidecar (this is where the term comes from!). The sidecar does not exist on its own, but enhances the motorbike (e.g. increases the capacity of the motorbike).
>
> The [Azure Architecture Center](https://docs.microsoft.com/en-us/azure/architecture/patterns/sidecar) has a great writeup on the sidecar pattern.

### Getting started locally

To get started with Dapr in a local environment, you'll need to use the Dapr Command-Line Interface (CLI).

You can download the CLI in several ways, which are all well documented on the [Dapr Docs](https://docs.dapr.io/getting-started/install-dapr-cli/) for Linux, MacOS and Windows.

Dapr can be configured in a self-hosted mode, or deployed in Kubernetes. The self-hosted option commonly depends on Docker Containers, but *can* run without Docker.

> **Note:** The [recommended developer environment](https://docs.dapr.io/getting-started/install-dapr-selfhost/) is to use Docker

### Self-hosted Dapr with Docker

The first step to setting up your environment is running the command ``dapr init``. This [initializes your Dapr environment](https://docs.dapr.io/operations/hosting/self-hosted/self-hosted-with-docker/#initialize-dapr-environment).

This approach will create the Dapr control plane in your local environment, but also the following components - 

* A docker container running an instance of Redis. The purpose is to have a default component for state management and pub/sub.
  * We'll cover the concept of components a bit later.
* A docker container running an instance of Zipkin. Zipkin is a separate project, solving the problem on distributed tracing (more information available on [their site](https://zipkin.io/)). Dapr uses this this for diagnostics and tracing across the deployed apps.
* Several Dapr configurations and components are installed in a .dapr directory on the local machine. The exact location depends on the Operating System.
* An additional service ``dapr-placement`` is created only if your application uses the Actor framework. 
  * If there's interest, let me know and I can write up a separate blog post on the Actors framework, and how to implement in Dapr.

> A fuller explanation can be found on the [Dapr docs here](https://docs.dapr.io/operations/hosting/self-hosted/self-hosted-with-docker/).

### Self-hosted Dapr without Docker

In case you missed it above, the recommended Dapr developer environment uses Docker. However, there may be scenarios where this is not an option. If you want to initialise without docker, then ``dapr init --slim`` is the command that you're looking for.

There are some slight differences in what you get as a result of this command -

* Two binaries are installed; **daprd** (i.e. the Dapr sidecar executable), and **placement** (only required when using the actor framework, for placing actors across different partitions).
* The default components such as Redis and Zipkin are **not** installed in the slim mode. This means that if you want any Pub/Sub, State Store, Bindings or Secrets Components, then you would need to first establish a way of running the underlying service (e.g. install Redis locally, or use some hosted version), and configure the appropriate Component definition file (more on that later).
  * Note that service invocation will be available out of the box, with thanks to the Dapr sidecar executable.

### Running your application locally

Once you have the CLI setup and initialised Dapr on the machine, you can then begin to execute Dapr alongside your application! The deployment steps will differ in your target environment. As usual, it would be recommended to have a separate non-production environment to test your deployment processes ahead of a production rollout.

To run the Dapr sidecar and your application side-by-side, you'll need to use the ``dapr run`` command. The CLI has a full reference [available here](https://docs.dapr.io/reference/cli/dapr-run/). 

It boils down to a few key areas (``dapr run [flags] [command]``). The flags are clearly documented on the reference page mentioned earlier. The command is the one used to run your application. For example, dotnet run myapp or node app.js.

A couple of examples below -

* ``dapr run --app-id MyNodeApp --app-port 3000 --dapr-http-port 3500 node app.js``
* ``dapr run --app-id MyDotnetApp dotnet run``

Excellent. So at this point, we've been able to execute our application alongside the Dapr sidecar. However, a lot of the value with Dapr comes from the abstraction of the components that we'd interact with (e.g. State Stores, Secret Stores, Bindings, Configurations, Pub Sub providers, etc.)

## Dapr Components

### What are Dapr components?

The [Dapr docs](https://docs.dapr.io/concepts/terminology/) describe components as 	*Modular types of functionality that are used either individually or with a collection of other components, by a Dapr building block*.

There are several types of components, including -

* **Bindings** - Build event-driven applications based on the pluggable and modular Dapr component interface. Each binding's properties will be different, based upon the underlying service (e.g. AWS S3, Azure Storage Queues, Cron etc.)
* **Configuration Stores** - Used for persisting application state, to easily share application configuration changes or for startup.
* **Middleware** - Plug in custom middleware into the HTTP pipeline, such as authentication or message transformation.
* **Name resolution** - Used in combination with the service invocation capabilities of Dapr. This may vary depending on the underlying hosting option (e.g. self-hosted, Kubernetes or a cluster of machines).
* **Pub/sub brokers** - Ability to pass messages to/from pub/sub providers such as Apache Kafka, Azure Service Bus or GCP Pub/Sub.
* **Secret stores** - As you would expect, a secret store is used to offload secrets into a trusted environment, so that you don't need to reference them in plain text. Consider services such as Hashicorp Vault, Azure KeyVault, AWS Secrets Manager, etc.
* **State stores** - Applications these days typically hold and interact with some form of state (e.g. records applications, inventory, etc.). The state store gives us a pluggable way of interacting with data stores such as databases, files, memory caches, etc.

The components are created by the community. If you're interested in contributing, you can do so on the [dapr/components-contrib GitHub repository](https://github.com/dapr/components-contrib).

### Dapr Components Example

## Running Dapr in a remote environment

## Why care about Dapr?

## What is the state of Dapr now?

The Dapr team made a promise in [their announcement blog post](https://cloudblogs.microsoft.com/opensource/2019/10/16/announcing-dapr-open-source-project-build-microservice-applications/) that they planned  to *bring Dapr to a vendor-neutral foundation to enable open governance and collaboration*. In early 2021, the Dapr team began to follow-up on that promise and [proposed to donate Dapr to the Cloud Native Compute Foundation (CNCF)](https://github.com/cncf/toc/pull/617) as an incubation project. It was accepted as an incubation project in November 2021, and is still in that state at time of writing.

> If you're unfamiliar with the Cloud Native Compute Foundation (CNCF) or the lifecycle/stages of the project that they host, then take a look at my blog post [Introducing the Cloud Native Compute Foundation (CNCF)](/blog/intro-to-cncf) as well as the episode with [Annie Talvasto](/guest/annie-talvasto) on [Top new CNCF projects to look out for](/episode/top-new-cncf-projects).