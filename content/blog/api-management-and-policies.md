---
Author: chrisreddington
Description: "We recently introduced you to API Management, how it maps to architectural principals and why you may consider using it as a producer or consumer of APIs. In this post, we'll be continuing on the story - focusing mostly on the API Management policies functionality."
PublishDate: "2021-06-28T12:00:00Z"
image: img/cloudwithchrislogo.png
date: "2021-06-28T12:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- API Economy
- Integration
- APIs
title: 'Using API Management Policies to enforce access restriction policies'
series: 
- "A series on API Management"
---
We [recently introduced you to API Management, how it maps to architectural principals and why you may consider using it as a producer or consumer of APIs](/blog/introduction-to-api-management). In this post, we'll be continuing on the story - focusing mostly on the API Management policies functionality.

## An introduction to API Management Policies

Azure API Management Policies are a way to implement configuration which changes the behaviour of an API Operation or set of APIs. These policies are executed sequentially in either the request to or response from an API. Consider the API Management as a broker between the client and the API, acting a little like a gatekeeper. This means that policies have the potential to be used in a variety of scenarios, e.g. rate limiting, conversion from XML to JSON or validate a JavaScript Web Token (JWT), which is a common activity for Authentication/Authorization in modern web applications. In this blog post, I'm going to assume that you have a working understanding of these concepts (otherwise the blog post would become too large!)

Let's first navigate to the Azure Resource that we created in the previous blog post. You may notice from the below screenshot that it's in a different subscription. This is the same resource, though I have been doing a bit of tidying up of my Azure Subscriptions.

![Screenshot showing the API Management Service Resource in the Azure Portal](/img/blog/api-management-and-policies/apim-1.jpg)

Click on the **APIs** menu item on the left hand menu in the Azure Portal. You'll be directed to a familiar looking page, that we reviewed in the first blog post.

![Screenshot showing two API versions available, and several API Operations](/img/blog/api-management-and-policies/apim-2.jpg)

Let's draw our attention to the **Inbound Processing** and **Outbound Processing** areas of the page. This is where you define your API Management Policies. You can do that by either clicking the **Add policy** button (which will show you the user interface directly below the next tip), or you can edit the code directly using the **</>** button.

> **Tip:** This view is available at the **All operations** level, as well as each **individual operation**. You may also notice that there's an **All APIs** option in the left hand column as well, which presents you with the same view.
>
> Why is this important? You may want to set your API Management policies at different levels of scope -
>
> * **All APIs** - A global policy across your API Management Service instance
> * **All operations** - A policy which applies to **all** operations associated with a specific API.
> * **Individual operation** - A policy which applies to a specific API operation only.
>
> You can even apply policies to **Backends**, so that you can enforce certain requirements when communicating with your backend APIs (e.g. conversion from XML to JSON). You can also apply policies to the **Products** that you have configured within the API Management service. We won't be exploring this in the blog post, but do feel free to explore if you may have a valid use case (e.g. enforcing certain requirements based upon a product that a user has access to).

![Screenshot showing the options available in the Azure Portal to add inbound policy to an API Operation or API](/img/blog/api-management-and-policies/apim-3.jpg)

Each of these API Management policies are clearly documented, with a [reference available in the Azure Docs](https://docs.microsoft.com/en-us/azure/api-management/api-management-policies). The UI gives you a way to set policies without having to use the XML Code representation of the policies if preferred. However, the docs provide example snippets for a variety of scenarios to get you going very quickly.

![Screenshot showing an example API Management Policy configuration page for JWT Validation](/img/blog/api-management-and-policies/apim-4.jpg)

As an example, you'll see that the above screenshot is the user interface to configure a JWT Validation Policy. The Azure Docs have a wealth of information on the [JWT Validation Policy](https://docs.microsoft.com/en-gb/azure/api-management/api-management-access-restriction-policies#ValidateJWT), including Simple token validation, Token validation with RSA certificate, Azure Active Directory (AAD) token validation, AAD B2C token validation and Authorize access to operations based on token claims.

I'm sure you'll agree - plenty to get you started with your scenario! So much so, that I used a slight variation of the Azure Active Directory (AAD) token validation snippet. My final snippet looked like this -

```xml
<validate-jwt header-name="Authorization" failed-validation-httpcode="401" failed-validation-error-message="Unauthorized. Access token is missing or invalid.">
  <openid-config url="https://login.microsoftonline.com/cloudwithchris.com/.well-known/openid-configuration" />
  <audiences>
      <audience>d3414b61-53f8-4ad5-aa1d-1e2a15579f60</audience>
  </audiences>
</validate-jwt>
```

What is the above policy doing? Effectively, we're looking for a JavaScript Web Token that has been provided by the cloudwithchris.com tenant in Azure Active Directory. That token must have an audience with the id ``d3414b61-53f8-4ad5-aa1d-1e2a15579f60``. This means that I have an App Registration in Azure Active Directory with the Client ID ``d3414b61-53f8-4ad5-aa1d-1e2a15579f60``. Of course, if you're working through this blog post from beginning to end - you may not have an App Registration.

Let's go ahead and do that now.

> **Tip:** If you're following this post in your own subscription with your own Azure Active Directory Tenant, you'll likely have the appropriate access to create an app registration within your subscription.
>
> However, if you're working on this within a corporate environment - It's possible and even likely that the creation/management of app registrations in Azure Active Directory is restricted to a subset of users. This is because App Registrations can be used... as the name implies... to register your applications to Azure Active Directory. What does that mean? It means you can pass in an identifier/representation to your application, so that you can call APIs that are available (e.g. Microsoft Graph, other Application APIs, etc.)
>
> This blog post is by no means a recommended or best practice way of setting up your App Registrations, but merely a demonstration of API Management Policies being used for JWT validation within your API Management service as a Façade, before reaching your backend APIs. If you're looking for something more rigorous, I would encourage you to review the Azure Docs relating to Azure Active Directory / Azure Active Directory B2C.

## Creating an App Registration in Azure Active Directory

Navigate to ``App Registrations`` in the Azure Portal. You can find this by either going to ``Azure Active Directory > App Registrations`` or by searching for ``App Registrations`` in the search bar at the top. Assuming that you have the appropriate access, create a new App Registration.

From the screenshot below, you can see that I gave my application a name of **cwc-apim-demo-api**. That relates to my own naming convention and works well for me, but name it soemthing that makes sense for yourself.

You'll notice that there are four supported account types options -

* **Accounts in this organizational directory only** - Only allow users that are part of your tenant (e.g. cloudwithchris.com) to use the application
* **Accounts in any organizational directory** - Allow users that are part of any tenant Azure Active Directory (AAD) tenant
* **Accounts in any organizational directory and personal Microsoft Accounts** - Allow users that are part of any tenant Azure Active Directory (AAD) tenant or Microsoft Accounts (e.g. Skype, Xbox, non-corporate accounts)
* **Personal Microsoft Accounts Only** - Only allow accounts not associated with Azure Active Directory (AAD), but personal accounts (e.g. Skype, Xbox, non-corporate accounts)

For my purposes, I'll be using the first option. What if you need to allow users to access your applications through social identities (e.g. Facebook, Twitter, GitHub, etc.)? Then you may need to look through the differences of Azure Active Directory B2B and Azure Active Directory B2C. There's a [great Azure Doc available here](https://docs.microsoft.com/en-us/azure/active-directory/external-identities/compare-with-b2c#compare-external-identities-solutions) for you to review.

For the time being, we're assuming in this scenario that only users from the same Azure Active Directory (AAD) tenant are able to access the application.

> **Tip:** I'll only be creating a single app registration. However, if you had a user interface (e.g. Single Page Application), that interacted with multiple backend APIs, then it's likely you would have multiple app registrations. You would have a registration for the Single Page App (SPA) frontend, and separate app registrations for the custom-built APIs that you will be accessing. (I say custom-built, as there are built-in APIs available for access to Microsoft Services, such as the Microsoft Graph API).
>
> Then it's a case of exposing an API from the app registration that is associated to your backend API, and granting API permissions to the app registration that is aligned to your Single Page App. When you expose the API, you provide it a name (e.g. myapi.read). That is then the scope that you would pass in when you acquire the access token for the call. [This example](https://docs.microsoft.com/en-us/azure/active-directory/develop/scenario-spa-overview) shows how to do this for a Single Page Application calling the Microsoft Graph (so, not a custom API - which is the slight difference in what we described here).
>
> If there is interest, I can write a blog post up on this topic. However, the purpose of this blog post is really to introduce the concept and power of API Management policies. This scenario could be a blog post in its own right.

Depending on the application, you may need to specify the redirect URI, so that the application knows where to redirect the user (and that this is matched up correctly in the application code, and not hijacked/spoofed along the way).

![Screenshot showing the AAD Application Registration page](/img/blog/api-management-and-policies/apim-5.jpg)

After creating your app registration, you should have a resource that looks similar to the below.

![Screenshot showing the AAD Application Registration that was just created](/img/blog/api-management-and-policies/apim-51.jpg)

Purely to prove the purpose of API Management policies, I'm going to generate a Client Secret that we can use in postman to generate a Bearer token to authenticate against API Management. In a real-world scenario, you may not need to create a client secret against this resource. At least, not for the calls from a client app (e.g. Single Page Application), as that access would be granted through API Permissions in the Client's App Registration. You may need to go ahead and use Client Secrets for authorization on the backend APIs though (more on that in the next blog post though!)

Navigate to the **Certificates & Secrets** menu item in your App Registration. Give the secret a meaningful name, and an appropriate duration according to your security policy.

> **Tip:** Speaking of security policy, you may notice that there's an option to upload certificates against this App Registration. Client Secrets are useful in proof of concept scenarios. Though ask yourself, how well do we typically store those passwords? How often do we rotate them? Could a certificate be more secure in this instance? For ease, I'll be obtaining my access token in postman by using a Client Secret, though you may want to consider this point in a production implementation. There's a great [stack exchange discussion](https://security.stackexchange.com/questions/3605/certificate-based-authentication-vs-username-and-password-authentication/3627#3627) on the same pros/cons of each.

![Screenshot showing the Certificates & Secrets Page of the AAD Application Registration that was just created](/img/blog/api-management-and-policies/apim-52.jpg)

Once created, the Client Secret is now available that can be used in postman for the call to Azure Active Directory to obtain the access token.

![Screenshot showing the page which will display the Client Secret for our app registration](/img/blog/api-management-and-policies/apim-53.jpg)


## Obtaining an Access Token

![Screenshot showing Postman sending a request to Azure Active Directory for an authentication token](/img/blog/api-management-and-policies/apim-6.jpg)

## Calling the Secured API Operation in API Management

![Screenshot showing the API Operation returning a 401 unauthorized without authorization](/img/blog/api-management-and-policies/apim-7.jpg)

![Screenshot showing API operation returning a 200 with correct authorization](/img/blog/api-management-and-policies/apim-8.jpg)