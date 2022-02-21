---
Authors: 
- chrisreddington
Description: "Azure Front Door - It's an Azure Service that has been generally available for quite some time. It went Generally Available (GA) in April of 2019 after being in Public Preview since September 2018. It's had several updates since, including a slew of Web Application Firewall enhancements, Rules Engine support and much more. But did you know Microsoft released the Azure Front Door Standard and Premium SKUs in preview in Feburary of 2021? So, what are they? How do they compare to the aforementioned Azure Front Door offering? And when would you want to think about using Azure Front Door compared with Azure CDN? We'll be covering all of those points in this post."
PublishDate: "2021-08-26T07:00:00Z"
image: img/cloudwithchrislogo.png
date: "2021-08-26T07:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Architecture
- Azure
- Azure
- Resilience
title: Why you should care about Azure Front Door Standard and Premium
banner: "images/banner.jpg"
---
Azure Front Door - It's an Azure Service that has been generally available for quite some time. It went [Generally Available (GA) in April of 2019](https://azure.microsoft.com/en-us/updates/azure-front-door-service-is-now-available/) after being in [Public Preview since September 2018](https://azure.microsoft.com/en-us/updates/azure-front-door-service-in-public-preview/). It's had several updates since, including a slew of Web Application Firewall enhancements, Rules Engine support and much more. But did you know Microsoft released the Azure Front Door Standard and Premium SKUs in preview in Feburary of 2021? So, what are they? How do they compare to the aforementioned Azure Front Door offering? And when would you want to think about using Azure Front Door compared with Azure CDN? We'll be covering all of those points in this post.

## What is Azure Front Door?

Let's first set the scene, making sure we're all on the same page. What even is Azure Front Door? If you haven't deployed it for your own solution, it's quite likely that you've used it as a consumer. There is a great case study on how [LinkedIn uses Azure Front Door](https://customers.microsoft.com/en-gb/story/841393-linkedin-professional-services-azure-front-door-service) as part of their own infrastructure stack. Not a LinkedIn user? Well, the [original Azure Front Door general availability blog post](https://azure.microsoft.com/en-gb/blog/azure-front-door-service-is-now-generally-available/) notes that Office 365, Xbox Live, MSN and Azure DevOps had all adopted Azure Front Door. So, like I mentioned - if you haven't already deployed it - it's quite likely you've already used it!

Azure Front Door is a global service, which is typically used as an entry point for web applications. It's well-suited for this task, as it operates at Layer 7 (HTTP/HTTPS-based) of the networking stack. However, calling it a load balancer would be underselling it. Azure Front Door uses the Microsoft Global Edge network to accept traffic from end users. You can associate a Web Application Firewall (WAF) with it, to protect your applications from potential threats.

> **Note:** There are different types of Load Balancing options. For example, Azure Load Balancer operates at Layer 4. Azure Traffic Manager is a DNS based load balancer. The difference between these is where they operate in the networking stack. Layer 4 is the transport layer, whereas Layer 7 is the application layer.
>
> Therefore, the decisions that can be made at Layer 4 are typically based around the TCP and UDP protocols. There is no context or option to make decisions based upon information at the application level (e.g. Path based filtering, etc.). Layer 7 load balancing allows you to make load balancing decisions based upon some information/context from the application. Think about aspects like Request Headers, Request Paths, etc. A good comparison would be Azure Load Balancer (Layer 4) vs Azure Application Gateway (Layer 7).
>
> You can find some additional information on Layer 4 vs Layer 7 load balancing on the [NGINX Website](https://www.nginx.com/resources/glossary/layer-7-load-balancing/).

## How do Azure Front Door Classic, Standard and Premium compare?

Azure Front Door Standard and Premium [went into preview in February 2021](https://azure.microsoft.com/en-us/updates/azure-front-door-standard-and-premium-now-in-public-preview/). The explanation of Azure Front Door in the previous section is true for Azure Front Door (Classic), as well as Azure Front Door Standard and Premium.

However, Azure Front Door Standard and Premium has additional enhancements. Depending on the type of traffic - You can either accelerate traffic by using Dynamic Site Acceleration (DSA) to the appropriate source, or serve up cached contents through it's Content Delivery Network functionality. In the Standard and Premium SKUs, Azure Front Door combines the capabilities of Azure Front Door, Azure CDN and Azure Web Application Firewall (WAF).

Both Azure Front Door Standard and Premium contain several common features, including -

* Custom Domains
* SSL Offload
* Caching
* Compression
* Global load balancing
* Layer 7 routing
* URL rewrite
* Enhanced Metrics and diagnostics
* Traffic report

Azure Front Door premium contains the following features, in addition to the previous list -

* Private Origin (Private Link)
* Web Application Firewall (WAF) support
* Bot Protection
* Security Report

> **Note:** Private Origin (Private Link) support is a big deal in my opinion. Before Azure Front Door Standard/Premium, I've seen a few scenarios where an organisation wants to build an Architecture of Azure Front Door in front of Azure API Management. The only way to achieve this at the time was by restricting traffic inbound, based upon Request Headers sent from Azure Front Door.
>
> With Azure Private Origin (Private link), you can still route traffic to your backend origins, even if they are only accessible privately.
>
> Why would you care about this pattern? So that you can guarantee traffic is not being bypassed to your backend services, and is being routed through Azure Front Door. Perhaps you have adopted some rules in your WAF that you wish to process before traffic reaches your application. Having a private backend, while having a public entry point at the edge allows you to achieve this.

It's worth mentioning that (at time of writing), Azure Front Door Standard and Premium are in a preview state. Azure Front Door (Classic) is Generally Available. However, the [docs call out many reasons](https://docs.microsoft.com/en-gb/azure/frontdoor/standard-premium/overview#why-use-azure-front-door-standardpremium-preview) to use Azure Front Door Standard or Premium. It's important to note that it's not recommended for production workloads until it exists a preview state.

There is a difference in the pricing models between Azure Front Door (Classic) and Azure Front Door Standard / Premium. Azure Front Door classic had a more involved pricing structure, based upon outbound data transfers, routing rules, inbound data transfers and frontend hosts. The WAF capability was an additional cost if enabled, with custom rules / managed rulesets also having an additional price per unit.

In contrast, Azure Front Door Standard / Premium's pricing model is simplified. There is a base fee for either the Standard or Premium SKU. On top of that, there are charges based upon outbound data transfers (i.e. data going out of Front Door POPs to the client), inbound data transfers from POPs to origin and requests incoming from client to Front Door POPs.

> **Note:** It's important to note that Azure Front Door Premium includes Web Application Firewall (WAF) at no additional cost. This is an additional cost in Azure Front Door (Classic). Of course, the finer details of the pricing model can change over time. For the latest and greatest, please review the [Azure Pricing Page](https://azure.microsoft.com/en-gb/pricing/details/frontdoor/).

## Azure Front Door vs Azure CDN

Based on the previous section, you've likely noticed that Azure Front Door (Standard/Premium) and Azure CDN now share some common functionality around caching, and the rules engine.

If you've previously used Azure Front Door (Classic), then you may have previously had an architecture that used both Azure Front Door as well as Azure CDN. However, even Azure Front Door (Classic) had [caching capabilities built-in as per the Azure Docs](https://docs.microsoft.com/en-us/azure/frontdoor/front-door-caching).

You'll notice that the adjustments for Azure Front Door Standard and Premium, make this feel like a much more integrated experience, as it is part of the setup process of your new Azure Front Door Resource (as explained in the [blog post announcing Azure Front Door Standard and Premium](https://azure.microsoft.com/en-gb/blog/azure-front-door-enhances-secure-cloud-cdn-with-intelligent-threat-protection/)). The idea behind this new Azure Front Door experience is a single unified platform to accelerate static and dynamic content acceleration. All that, with the combined functionality of Web Application Firewall (as explained in the opening of this post).

> **Note:** What is the difference between Static Content/Site Acceleration and Dynamic Content/Site Acceleration?
>
> Think of Static Content/Site Acceleration as caching the files closer to your end-users. So, a typical CDN scenario. This is how the Cloud With Chris website, as well as Cloud With Chris Podcast MP3 files are delivered to you. They are hosted in a central location (e.g. Azure Static Web App or Azure Storage Account), and are cached at Points of Presence on the Microsoft Edge closer to you.
>
> But what about Dynamic Site Acceleration? The fact that it's dynamic means that we can't cache the content, as it's likely going to change over time. That strategy may not work here. Fundamentally, the internet is an unreliable place. Routes become unavailable, transient issues can impact our path. Dynamic Site Acceleration uses route optimization techniques to choose the most optimal path to the origin, so that users can be sent  via the fastest and most reliable route possible.
>
> Dynamic Site Acceleration can often use additional TCP optimizations to ensure the traffic is routed efficiently and effectively. For example, eliminating TCP slow start, leveraging persistent connections and tuning TCP packet parameters are just some typical examples (these are general examples to illustrate the point, and not specific to Azure Front Door).

**Update 5th December 2021:** It is also worth noting that whilst both custom and managed rules are supported on Azure Front Door, only custom rules are supported on Azure Front Door Standard. Azure Front Door Premium supports both custom and managed rules, where custom rules are evaluated first. Many thanks to my colleague Ben G for the recommendation to add this!

## How does Azure Front Door work?

As a service, your usage of Azure Front Door is primarily around configuration (i.e. setting up your endpoint name, your origin details and additional configuration around caching, compression and WAF options).

From a scalability perspective, the service deals with this transparently.You won't see any sliders to specify the minimum, maximum or desired number of instances. You don't need to specify autoscale rules or similar. The service will scale automatically for you.

Now, I've hinted a few times that Azure Front Door is a global service. This means that Azure Front Door's edge nodes (sometimes known as points of presence) are global in nature. This point is worth thinking about in some further detail.

One of the configuration options that you have in Azure Front Door is adjust the health probes used from the edge nodes to your origin.

Why is this important? As Azure Front Door is global, it's going to have many of these edge environments all across the globe. That means that each of those edge environments will be sending a health probe at some point. If you're particularly aggressive with your probe timeout settings (e.g. every few seconds), then this will cause a significant increase in the requests to your backend origin.

> **Note:** This is particularly important to consider if your origin wasn't designed for scale, and you may need to consider the additional load from these probes.
>
> Alternatively, if you are using a serverless tier (based on pay-per-execution), then your health probe configuration will have a tangible impact on your costs.

## Summary

In summary, Azure Front Door Standard / Premium are some welcome evolutions on the Azure Front Door (Classic) offering. It has a new pricing model which is simpler to understand, and contains some notable feature updates (e.g. Private Origin Support (Private Link)). Azure Front Door Standard is content-delivery optimised as opposed to premium which is security optimised.

Azure Front Door can bring value if you have a distributed set of users that you want to serve content to. The content can either be dynamic (and leverage the Dynamic Site Acceleration capabilities of Azure Front Door) or static (and leveraging the caching capabilities of Azure Front Door). Don't forget, the premium SKU is security optimized and has Web Application Firewall (WAF) capabilities built-in. A great addition to the entry point for your Web Application!

If you want to learn more about Azure Front Door, I recommend that you take a look at the [Introduction to Azure Front Door](https://docs.microsoft.com/en-us/learn/modules/intro-to-azure-front-door/) Microsoft Learn Module, as well as the Azure Documentation. Be aware that there is a separate documentation hub for [Azure Front Door (Classic)](https://docs.microsoft.com/en-us/azure/frontdoor/front-door-overview) and [Azure Front Door (Standard/Premium)](https://docs.microsoft.com/en-us/azure/frontdoor/standard-premium/overview).

Are you already using Azure Front Door? Are you using Classic, Standard or Premium? Perhaps you're considering using Azure Front Door after scanning through this post? I'd love to hear more over on [Twitter, @reddobowen](https://twitter.com/reddobowen). If there's anything that you'd like me to explore in a hands-on blog post, please let me know! I'm already considering a blog post which compares Azure Front Door (Classic) with Azure API Management to Azure Front Door (Premium) with Azure API Management, and the private link capabilities (which I hinted a little further up in the article). Thanks for reading, and bye for now!
