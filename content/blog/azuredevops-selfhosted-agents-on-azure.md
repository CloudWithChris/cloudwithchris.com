---
Author: chrisreddington
Description: ""
PublishDate: "2021-10-080T09:00:00Z"
image: img/cloudwithchrislogo.png
date: "2021-10-08T09:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Azure DevOps
- Azure Pipelines
- Azure
- DevOps
title: Using the Azure DevOps Self-Hosted agents to deploy to your private resources
---
I recently wrote a blog post on [Using the GitHub self-hosted runner and Azure Virtual Machines to login with a System Assigned Managed Identity](/blog/azuredevops-selfhosted-agents-on-azure), which seems to get some a good amount of views week on week. Reflecting on some questions I've had this week (and regularly received in my previous role), I thought that it may make sense to write a post about setting Azure DevOps self-hosted agents to deploy to private resources. So, that's what we'll be covering in this post!

## Context

Let's set the scene. Perhaps you've been working on a proof of concept, and it's time to start shaping that into a production-like workload. Maybe you were deploying to a resource such as a Virtual Machine or App Service instance which was publicly accessible. But, now you have requirements to deploy to that resource in a private network. For the purposes of this blog post - Let's consider that the resource (or, deployment target) is hosted in Azure.

I see that people will typically start off their Azure DevOps journey by using the [Microsoft-hosted agents](https://docs.microsoft.com/en-us/azure/devops/pipelines/agents/hosted?view=azure-devops&tabs=yaml). Microsoft-hosted agents are exactly as the name implies... Azure Devops Agents hosted by Microsoft.

Let's take a step back for a moment. What is an Azure DevOps agent? When your Azure Pipelines are triggered, a piece of software has to acknowledge execute that work (or job). That software is the Azure DevOps agent - it will run on some machine. The Microsoft-Hosted agents are machines that are hosted by Microsoft in a public pool, which is available for Azure DevOps customers to use. As this is a public pool, these machines have are able to access public resources (i.e. over the public internet), and do not have network access to your private environments. 

The Microsoft-hosted agents take away the requirement for any management overhead on you as a DevOps team. Instead, you can use the agent pool from Microsoft, using the latest and greatest agent images (again, all managed by Microsoft). This is the appeal of Microsoft-Hosted agents; they are easy to use, have low management requirements, have a wide variety of common dependencies already installed, and can deploy to public endpoints.

> If you have a need to deploy into a private environment, then you must use self-hosted agents (as you will need 'line of sight' to the target resources that you wish to deploy to). Self-hosted agents can also be beneficial when you need machine-level caching/configuration to persist between runs (as it doesn't with the Microsoft-hosted agents, but you can use caching for packages), or if you need to increase the specs of the machine that you're running on because of the usecase (e.g. GPUs for some kind fo machine learning activity).

## Hosting a self-hosted agent

## Azure Virtual Machine Scale Set agents

## Summary