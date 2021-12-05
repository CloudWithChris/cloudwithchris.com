---
Author: chrisreddington
Description: When I mention the term JAMStack, I'm not pretending that I'm Paddington bear with a stack of Jam sandwiches! If you hadn't heard, JAMStack is a term that describes applications based on JavaScript, APIs and Markup. That means, we're referring to files that are content in nature. Think about files like HTML, CSS, Images, etc.  Ok, now with that context - why has it risen in popularity? Surely this is something that could have been done for many years, so why now? My hypothesis... Cloud.
PublishDate: "2021-01-20T12:00:00Z"
image: img/cloudwithchrislogo.png
date: "2021-01-20T12:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Development
- Static Content
- Hugo
- Cloud Design Patterns
- Web Development
- Azure CosmosDB
- Azure Storage
- Serverless
title: JAMStack and the Cloud - A winning combination
---
When I mention the term JAMStack, I'm not pretending that I'm Paddington bear with a stack of Jam sandwiches! If you hadn't heard, JAMStack is a term that describes applications based on JavaScript, APIs and Markup. That means, we're referring to files that are content in nature. Think about files like HTML, CSS, Images, etc.

Ok, now with that context - why has it risen in popularity? Surely this is something that could have been done for many years, so why now? My hypothesis... Cloud. When you think about Cloud Workloads, typically the more costly aspects of the solution will be the underlying compute hosting the application, or the compute/services which are hosting the data layer.

Is that something that we need for our frontend? It ain't necessarily so. The JAMStack approach is a very modern web development paradigm that can be used to save money. Consider those static HTML, CSS, JavaScript and image files that typically come together to be rendered into a site.

Why do they need to served by some web server like IIS, Kestrel, Tomcat or similar? If we went down that route, then we would need to head down the route of some underlying compute to host those, e.g. Virtual Machines, Platform as a Service options, Kubernetes clusters, etc. Remember what I said earlier, typically the more costly aspects of the solution will be the underlying compute hosting the application, or the compute/services which are hosting the data layer.

What if, instead of deploying those files to a web server, we could serve them directly from Cloud Storage? That is exactly the idea behind the [Static Content Hosting Pattern](/episode/static-content-hosting-pattern), which is one of the patterns listed in the Azure Architecture Centre, and I recently covered it in my show.

Consider languages like .NET, Ruby, Java, etc. The reason that they require the underlying server to be running is that they will render some form of dynamic content, and need to understand some context based upon the user's request and respond accordingly. Does that mean in a JAMStack world you would be stuck with content that is quite literally "static", i.e. it will never change until you push out another deployment of the site? Again, it ain't necessarily so.

What did the "J" and the "A" parts of JAMStack stand for? JavaScript and APIs - That is the magic in this particular setup. Especially when you combine those backend APIs with serverless technologies. You could use the JavaScript in the frontend site to call APIs that are hosted in some serverless infrastructure. This gives the benefit of cost efficiencies (i.e. paying for what you use), and clear understanding of scalability limits (i.e. based upon the number of requests that you'll get coming into the site, so can handle that accordingly).

That's precisely the way that I architected [Yu-Gi-Oh Cards](https://github.com/Yugioh-Cards/YugiohCards), a pet project that I had started working on a while ago (please don't judge my software development skills!). This project actually implements a JAMStack approach by using VueJS as the frontend framework, and then calling the backend APIs through a serverless API Management deployment which in turn calls serverless Azure Functions. There are aspects of the solution which aren't serverless, such as the CosmosDB and the Azure Search instance, but you can understand how designing the frontend site and backend APIs in this way makes for great cost savings.

Similarly, [Cloud With Chris](https://github.com/chrisreddington/cloudwithchris.com) is an example of a JAMStack site, driven by [Hugo](https://gohugo.io), a static site generator. Rather than calling any backend APIs, the content is all entirely driven by Markdown which is hosted in the GitHub repository mentioned a moment ago. This means I'm not calling any external APIs. Instead, the content is finalised at deployment time. I run a command in my GitHub Actions (Hugo build) which goes ahead and takes my site's configuration, necessary theme information and content, and renders the needed files to generate the set of web pages to render to my clients. The content is then uploaded to an Azure Blob Storage account which is publicly accessible and configured using the Static Site functionality.

I could technically stop there, but I take this one step further and also front the Storage Account with an Azure CDN. Azure CDN provides a couple of benefits -

1. If users are located very far away from the Storage Account, then they will have a poor experience. A CDN allows the content to be cached at a Point of Presence (POP) closer to the user. This means that the user's latency for the site will be lower, providing an overall better experience for them.

2. If we didn't have the Content Delivery Network caching content in front of the Azure Storage Account, then each request for an individual asset (e.g. CSS file, image, HTML page, etc.) would all hit the Storage Account. Bare in mind that Storage Accounts have a limit of 20,000 IOPs per second, which would mean I have an artificial bottleneck of 20,000 requests per second on my page... Or would it? If I was serving up 10 static assets per page, then it would mean 20,000/10 = 2,000 requests per second. This is why a. CDN can also be valuable - Caching the assets in front of the Storage Account to prevent it from getting overwhelmed.

So as you can see, there are a number of options here, and certainly worth exploring both from a cost reduction exercise, as well as a potential scalability/performance gain perspective. I'm not saying that there is no value in approaches such as Ruby, .NET, Java, etc and using the more traditional web server hosting options at all. Far from it, there is a time and a place for each of these approaches. That is exactly the point in this post - There is a time, and there is a place.

Is there a requirement for dynamic content in your site, and if so, how does that need to be handled? Could you potentially use a static web frontend, calling a series of backend APIs via JavaScript? Or, do you need to rely upon the traditional web server hosting approach and rendering based upon the client requests coming into the server?

Like anything, if you already have a large investment in an existing technology, then you need to evaluate the reward of making any changes, vs the cost of actually making those changes. These patterns always sound promising, but you need to weigh up the benefits against the cost of making any changes to your application and your solution.

If you want to see a little bit more hands-on around how this works, then I'd again recommend taking a look at my recent episode on the [Static Content Hosting Pattern](/episode/static-content-hosting-pattern), where I showcase a little bit around my approach for Cloud With Chris. If you like the content, please do give it a like/subscribe while you're there - as that would be greatly appreciated!

So that's it for this post. Until the next blog post, bye for now!