---
Author: chrisreddington
Description: "Back in June, I wrote a blog post on API Management and how you can use API Management policies to enforce access restriction policies. I was going to write a follow up post on how to use API Management policies in additional scenarios, but it's one of those scenarios where great minds think alike!"
PublishDate: "2021-08-17T09:00:00Z"
image: img/cloudwithchrislogo.png
date: "2021-08-17T09:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- API Economy
- Integration
- APIs
title: How to use Managed Identity and APIM to call Azure Services from an APIM policy directly
series: 
- "A series on API Management"
---
Back in June, I wrote a blog post on [API Management and how you can use API Management policies to enforce access restriction policies](/blog/api-management-and-policies/). I was going to write a follow up post on how to use API Management policies in further scenarios, though it's one of those scenarios where great minds think alike!

My friend and colleague Matthew Fortunka recently authored a blog post on the same topic. Matt's post is [here](https://blog.memoryleek.co.uk/apim/azure/identity/2021/08/13/using-managed-identity-to-connect-to-azure-services-from-api-management.html).

Overall, Matt covers a lot of ground in his post. I think it's a great read, and an interesting set of experiments. To summarise, he covers -

* How to use Managed Identity to connect to Azure services from API Management.
* Using the ``authenticate-managed-identity`` policy to retrieve an access token, and then how you can use that token in downstream requests.
* Using the aforementioned token to call the Azure Resource Manager REST APIs
* Using the aforementioned token to send a message to an Azure Service Bus Queue (Yes, without having any specific producer code to send the message - handling this directly using APIM policies!)
* Using the token to write a file to Azure Blob Storage.

You can likely see where this is going. By cleverly using the Managed Identity associated with the Azure API Management Resource (therefore  using the resulting JSON Web token (JWT)) and using Azure Policies to make the HTTP Request directly, you could call any Azure REST API available (and where the managed identity has appropriate permissions, of course).

Matt covers this with some great examples in his post, so I highly encourage you to go and take a [look at it](https://blog.memoryleek.co.uk/apim/azure/identity/2021/08/13/using-managed-identity-to-connect-to-azure-services-from-api-management.html)! He hints at the potential of using the Graph API, as well as the Azure SQL APIs as well.

As always, it's important to understand the wider context of your implementation. I'd love to dig into the impact of implementing in this approach on the performance of an API Management resource, and how this copes under high load scenarios. Perhaps that's a future blog post, and maybe a collaboration! Nevertheless, if you need to call an Azure REST API directly, this is an interesting approach that I hadn't considered previously!

Have you tried this approach - Using API Management policies to call additional APIs directly? If you have, what have you found? How are you using it in your own scenarios? I'd love to hear more, so get in touch over on [Twitter, @reddobowen](https://twitter.com/reddobowen). I'm sure Matt would love to hear as well, over on [Twitter, @memleek](https://twitter.com/memleek).

Thanks again Matt for [the great blog post](https://blog.memoryleek.co.uk/apim/azure/identity/2021/08/13/using-managed-identity-to-connect-to-azure-services-from-api-management.html), which I thoroughly recommend taking a look through!
