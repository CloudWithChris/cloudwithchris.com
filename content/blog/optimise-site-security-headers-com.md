---
Author: chrisreddington
Description: "In my blog post earlier this week, I mentioned that I recently spoke at the Northern Azure User Group. The other speaker for the evening was Scott Hanselman, who talked about his journey moving a 17 year old .NET App into Azure. This was his blog. Along the way, he called out some of the tools that he used along the way. One was a tool called securityheaders.com. As any engaged listener does, I took note of the tools that he used, and added them to my cloudwithchris.com backlog during the talk. When I later investigated the initial rating of the website, I received a score of an F - which appears to be the lowest possible score that you can receive! Given that I only allow HTTPS traffic to my website, I was surprised by this - so I begun looking into the recommendations further."
PublishDate: "2021-04-14T08:00:00Z"
image: img/cloudwithchrislogo.png
date: "2021-04-14T08:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Web Development
- Security
- Blogging
- How To
- Azure Storage
- Static Content
title: Optimise your site - Addressing recommendations from securityheaders.com
---
## Introduction

In my blog post earlier this week, I mentioned that I recently spoke at the Northern Azure User Group. The other speaker for the evening was Scott Hanselman, who talked about his journey moving a 17 year old .NET App into Azure. This was his blog. Along the way, he called out some of the tools that he used along the way. One was a tool called [securityheaders.com](https://securityheaders.com/).

As any engaged listener does, I took note of the tools that he used, and added them to my cloudwithchris.com backlog during the talk. When I later investigated the initial rating of the website, I received a score of an F - which appears to be the lowest possible score that you can receive! Given that I only allow HTTPS traffic to my website, I was surprised by this - so I begun looking into the recommendations further.

![Output from Missing Security Headers on securityheaders.com](/img/blog/optimise-site-security-headers-com/missing-headers.png)

The grades that you can achieve range from an A+ to an F. You can also receive an R grade if the site provides a redirect. From what I can tell, the grading system gives you an F by default if you do not pass any of the headers. Then for each header that you turn green, you improve by a grade.

In case you're unable to read the image, the headers and descriptions are as follows -

* **Content-Security-Policy** - Content-Security-Policy is an effective measure to protect your site from XSS attacks. By whitelisting sources of approved content, you can prevent the browser from loading malicious assets.
* **X-Frame-Options** - X-Frame-Options tells the browser whether you want to allow your site to be framed or not. By preventing a browser from framing your site you can defend against attacks like clickjacking. Recommended value "X-Frame-Options: SAMEORIGIN".
* **X-Content-Type-Options** - X-Content-Type-Options stops a browser from trying to MIME-sniff the content type and forces it to stick with the declared content-type. The only valid value for this header is "X-Content-Type-Options: nosniff".
* **Referrer-Policy** - Referrer-Policy is a new header that allows a site to control how much information the browser includes with navigations away from a document and should be set by all sites.
* **Permissions-Policy** - Permissions-Policy is a new header that allows a site to control which features and APIs can be used in the browser.

So, we can now understand the problem. From a risk perspective, I perceived the impact as medium/low and the likelihood of abuse to be low. particularly due to the early phase of my platform, and volume of users that I currently have visiting. However, with that said though, I want to ensure that I'm providing an accessible, secure and easy to use platform for my end-users to use. So within a few days, I made sure that each of these items were resolved.

## How to resolve these items?

Given that I'm deploying static content to an Azure Storage Account, my first thought was around how to ensure that the website is responding to the end-user with the appropriate headers (evaluating the options). I was aware that Azure Front Door and Azure Application Gateway may be able to help in this scenario, but both would add significant cost quickly (in comparison to the current cost of my entire pltform being less than £5/month). Though, there was one other trick up my sleeve.

I'm using the Microsoft CDN flavour of the Azure CDN to act as a caching layer in front of the backing storage. This comes with a [Rules Engine](https://docs.microsoft.com/en-us/azure/cdn/cdn-standard-rules-engine-reference) capability, that allows you to add either global or conditional rules that can be processed as part of the response to the end-user. These could include redirection, forcing a given protocol, or appending / setting headers! I was already using this functionality to force any HTTP traffic to use the HTTPS version of the website, so this was a natural option to progress with.

Below, you can find an image which shows the configuration of modifying the response headers by using the Azure CDN rules engine global rules:

![Rules Engine configuration for www.cloudwithchris.com](/img/blog/optimise-site-security-headers-com/rules-engine-config.png)

Again, for readability -

* **Always Modify response header Append Strict-Transport-Security** max-age=31536000; includeSubDomains
  * This was the recommended value from securityheaders.com
* **Always Modify response header Append X-Frame-Options** SAMEORIGIN
  * This was the recommended value from securityheaders.com
* **Always Modify response header Append X-Content-Type-Options** nosniff
  * This was the recommended value from securityheaders.com
* **Always Modify response header Append Referrer-Policy** strict-origin
  * This was the recommended value from securityheaders.com
* **Always Modify response header Append Permissions-Policy** geolocation=(), camera=(), fullscreen=("https://youtube.com"), microphone=(), accelerometer=()
  * This took a fair bit of investigation. I'm not convinced  that it's the most well-documented header, in terms of the properties that you can set. Effectively, this is a list of values that determine which permissions are allowed for this website. Given I don't need access to location, camera, microphone or accelerometer. I did have issues finding consistent documentation on this one, so ended up having to combine [the Feature-Policy documentation from MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy) as well as [the permissions policy examples from w3c](https://github.com/w3c/webappsec-permissions-policy/blob/main/permissions-policy-explainer.md).
    * I found this line particularly useful from w3c's documentation - *In this example, “self” will resolve to the origin that specifies the policy; “*” will resolve to the set of all origins; and the empty list of origins indicates that the feature should be disabled for all frames.*

Okay, great - that's some progress. After saving the configuration and waiting for the CDN rules engine to update across the Points of Presence, I revisited securityheaders.com to determine the impact of the changes.

![Cloud With Chris rating after the CDN adjustments](/img/blog/optimise-site-security-headers-com/cloudwithchris-review.png)

Great! The site has gone from an F to an A, but it looks like there's still a change needed for the Content-Security-Policy header. We have a problem though, there is a limit of 5 global rules per CDN endpoint, which I've already used as you'll see from the above.

  > If this is a limitaiton for you, I'd encourage you to upvote [this user voice request](https://feedback.azure.com/forums/34192--general-feedback/suggestions/39954631-standard-rules-engine-for-azure-cdn-remove-limita).

This then got me thinking, what are the alternatives? I had an idea. I already have a conditional rule to force HTTP traffic to HTTPS, so surely I could have a conditional rule that if the traffic is HTTPS then also append the Strict-Transport-Security? Genius! Effectively, we've got two sides of the coin from a condition, replicating a global rule for those two protocols.

After making the adjustments, I begun the process of investigating the Content-Security-Policy header, and how to set it. This is quite a lengthy one! You can find this well documented over at [the Content Security Policy (CSP) documentation from MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) and securityheaders.com links to [Scott Helme's blog on the topic](https://scotthelme.co.uk/content-security-policy-an-introduction/), which was also super helpful in putting together a list.

So by the end of it, I had compiled a header value similar to the below -
```bash
script-src 'self' https://www.google-analytics.com https://www.youtube.com 'sha256-oWm/NzHRzhKAQfKde1fqIBg3QUdhBSrbrIUH8Dy9YKI=' 'sha256-nPQLCTXBCD97YQ1ZzpMyCUGdUVokvRe8Zmpc70g2diY='; img-src 'self' https://www.google-analytics.com https://stats.g.doubleclick.net https://s.ytimg.com https://app.podscribe.ai https://is5-ssl.mzstatic.com; connect-src 'self' https://backend.podscribe.ai https://podcasts.cloudwithchris.com https://www.google-analytics.com https://stats.g.doubleclick.net; child-src https://www.youtube.com; object-src none
```

In a nutshell, this allows scripts to be run from the same origin, google-analytics.com, youtube.com, as well as inline scripts that have a given SHA that I already know. Images can be the same origin, google-analytics.com, YouTube images, etc. Finally, [connect-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/connect-src) restricts the URLs which can be loaded using script interfaces (including websockets, External HTTP Requests and more).

Now, the next step was to paste this value into the CDN rules engine header value for Content-Security-Policy and we're done!.. Or so I thought. It turns out that there is a max length of 128 characters for these values in the CDN rules engine.

  > If this is a blocker for you, I'd encourage you to take a look at [this UserVoice post](https://feedback.azure.com/forums/217313-networking/suggestions/41077912-header-value-character-limit-in-azure-front-door-r) which explains the exact same scenario for Azure Front Door.

So, back to the drawing board.. let's leave the Azure CDN configuration as-is and think of alternative options. Fortunately, there is an alternative. Content-Security policies can be set as a meta tag within the HTML body itself. I would have preferred to have everything managed through Azure CDN, but unfortunately that's not an option.

So, I added the below snippet to my header -

```html
<meta http-equiv="Content-Security-Policy" content="script-src 'self' https://www.google-analytics.com https://www.youtube.com 'sha256-oWm/NzHRzhKAQfKde1fqIBg3QUdhBSrbrIUH8Dy9YKI=' 'sha256-nPQLCTXBCD97YQ1ZzpMyCUGdUVokvRe8Zmpc70g2diY='; img-src 'self' https://www.google-analytics.com https://stats.g.doubleclick.net https://s.ytimg.com https://app.podscribe.ai https://is5-ssl.mzstatic.com; connect-src 'self' https://backend.podscribe.ai https://podcasts.cloudwithchris.com https://www.google-analytics.com https://stats.g.doubleclick.net; child-src https://www.youtube.com; object-src none">
```

Unfortunately, this won't be recognised by securityheaders.com as a fix. However, I know that I have addressed the underlying concern and this has now been implemented on the website. Additionally, [Mozilla Observatory](https://observatory.mozilla.org/) gives the site an A+ rating.

Great, so with that - We've gone ahead and strengthened the security posture of the website against potential areas of abuse, such as cross-site scripting, forcing browsers to realise they must only use an encrypted medium of transfer, and more. In fairness, the risks are very low for my website. There is no user interaction to any backend system, and is primarily a 'brochureware' type of website. However, I want to make sure that if there is the potential for any risk, that it is mitigated and addressed.

In a scenario where a website takes end-user input (e.g. Static Website, calling several backend API functions), then this is something I would certainly look to implement without a doubt.

With that, I hope that this blog post has helped you learn something! And a big thank you to Scott Hanselman for pointing out securityheaders.com as one of the tools that he has used to optimise his own site. Hopefully this gives you some insight into how I took those recommendations and addressed them using the Azure CDN rules engine.

Is this something that you'll be looking to implement on your own site? How else have you been using Azure CDN for your own projects? I'd love to know! Please get in touch over on [Twitter, @reddobowen](https://twitter.com/reddobowen) and let's continue the conversation.

Until next time, thanks for reading - and bye for now!
