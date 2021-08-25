---
Author: chrisreddington
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
---
Azure Front Door - It's an Azure Service that has been generally available for quite some time. It went [Generally Available (GA) in April of 2019](https://azure.microsoft.com/en-us/updates/azure-front-door-service-is-now-available/) after being in [Public Preview since September 2018](https://azure.microsoft.com/en-us/updates/azure-front-door-service-in-public-preview/). It's had several updates since, including a slew of Web Application Firewall enhancements, Rules Engine support and much more. But did you know Microsoft released the Azure Front Door Standard and Premium SKUs in preview in Feburary of 2021? So, what are they? How do they compare to the aforementioned Azure Front Door offering? And when would you want to think about using Azure Front Door compared with Azure CDN? We'll be covering all of those points in this post.

## What is Azure Front Door?

Let's first set the scene, making sure we're all on the same page. What even is Azure Front Door? If you haven't deployed it for your own solution, it's quite likely that you've used it as a consumer. There is a great case study on how [LinkedIn uses Azure Front Door](https://customers.microsoft.com/en-gb/story/841393-linkedin-professional-services-azure-front-door-service) as part of their own infrastructure stack. Not a LinkedIn user? Well, the [original Azure Front Door general availability blog post](https://azure.microsoft.com/en-gb/blog/azure-front-door-service-is-now-generally-available/) notes that Office 365, Xbox Live, MSN and Azure DevOps had all adopted Azure Front Door. So, like I mentioned - if you haven't already deployed it - it's quite likely you've already used it!

Azure Front Door is a global service, which is typically used as an entry point for web applications. It's well-suited for this task, as it operates at Layer 7 (HTTP/HTTPS-based) of the networking stack. However, calling it a load balancer would be underselling it. Azure Front Door uses the Microsoft Global Edge network to accept traffic from end-users. You can associate a Web Application Firewall (WAF) with it, to protect your applications from potential threats. 

## How does Azure Front Door Classic, Standard and Premium compare?

Azure Front Door Standard and Premium [went into preview in Feburary 2021](https://azure.microsoft.com/en-us/updates/azure-front-door-standard-and-premium-now-in-public-preview/). The above explanation of Azure Front Door is true for Azure Front Door (Classic), as well as Azure Front Door Standard and Premium. 

However, Azure Front Door Standard and Premium has additional enhancements. Depending on the type of traffic - You can either accelerate traffic by using Dynamic Site Acceleration (DSA) to the appropriate source, or serve up cached contents through it's Content Delivery Network functionality. In the Standard and Premium SKUs, Azure Front Door combines the capabilities of Azure Front Door, Azure CDN and Azure Web Application Firewall (WAF).

It's worth mentioning that (at time of writing), Azure Front Door Standard and Premium are in a preview state. Azure Front Door (Classic) is Generally Available. However, the [docs call out many reasons](https://docs.microsoft.com/en-gb/azure/frontdoor/standard-premium/overview#why-use-azure-front-door-standardpremium-preview) to use Azure Front Door Standard or Premium. It's important to note that it's not recommended for production workloads until it exists a preview state.



https://docs.microsoft.com/en-gb/azure/frontdoor/standard-premium/tier-comparison