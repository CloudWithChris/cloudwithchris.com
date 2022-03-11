---
# Default hugo properties
title: "Using GitHub Actions, Azure Functions and Google Analytics to display top posts on a Hugo Static Site"                   # Name of the blog
description: "In this post, I show how I use GitHub Actions to call an Azure Function that interacts with Google Analytics as part of the build process. The end result is that top posts are pulled into the Static Site Generation process, rather than calling an API through JavaScript at runtime."             # Used for SEO optimisation
PublishDate: "2022-03-11T19:00:00Z"
Date: "2022-03-11T19:00:00Z"

# Site-wide [required properties]
image: "img/cloudwithchrislogo.png"                   # Displayed when referenced in listing pages
images:                     # An array of images used in Social Sharing
- img/cloudwithchrislogo.png
tags:                       # Used for SEO optimisation and browsing across the site.
- Hugo
- Static Content
- GitHub
- GitHub Actions
- Azure
- Azure Functions
- Google Analytics
- SEO

# Site-wide [optional properties]
externalLink: ""            # Full URL to override listing links to an external page

# Content-specific properties
authors:
-  "chrisreddington"                       # An array of authors of the post (filenames in person).
---
In this post, I show how I use GitHub Actions to call an Azure Function that interacts with Google Analytics as part of the build process. The end result is that top posts are pulled into the Static Site Generation process, rather than calling an API through JavaScript at runtime.

You may be thinking - "That's a lot of technologies in one sentence. What's the point?". That's a great question, let's take a step back and look at the problem we're trying to solve.

I have been wanting to make the first view of my website actionable. That means, as a user you should be able to see featured posts, upcoming content and the posts which are most popular. The first two are trivial, but the third is a bit more tricky.

Why is that? Let's walk through each scenario.

* I have built a featured posts capability by using a ``featured`` property in the YAML front matter of each post. If the post should be featured in the carousel, then it should have the ``featured`` property set with a numeric value. The value defines the order in which the post should appear in the carousel.
* The upcoming content is known capability by use of an ``upcoming`` flag in the YAML front matter of each post.  This value is set to ``true`` if the post should be displayed in the upcoming content section, and false if it is in the past.
  * As a side note, you may be wondering why I don't simply use the Date and PublishDate properties to determine if a post is in the past or not. This is so that I can control the release of content to external sources (such as Apple Podcasts, Google Podcasts, Spotify, etc.), as the episodes RSS feed is watched by those providers. That means, as soon as the site is build with pages in the past, that content will be 'released' to external sources. In reality, I may not have uploaded the required media files as yet, hence the need for the manual control.
* And now the trickiest part. The posts which are most popular are determined by the number of views of each post. There isn't a built-in capability for this in Hugo. It's common to rely upon some form of external monitoring to determine the popularity of a post. For example, I use Google Analytics to understand the behaviour of my visitors, and ultimately which content is most popular - so that I can then prioritize the content which I create in the future.

Right, so we have established that the first two are trivial, but the third is a bit more tricky. We have also established that we can rely upon some form of external monitoring to determine the popularity of a post. Surely it's just as simple as calling an API via JavaScript at runtime, and using that to display the posts which are most popular?

Yes and no. There are drawbacks to this approach -

* The Google Analytics API has a limit of 50,000 requests per day. If you're calling the API more than 50,000 times per day, you'll be throttled.
  * This isn't a problem for me at the moment, but hopefully it will be in the future!
* Calling an external API is not an instant operation. It can take up to a few seconds to return the results. There are ways to handle this, for example using a cache or loading icons. However, given that this is the first content that a user sees, it's important that the content is available as quickly as possible.
* Hugo cannot be used directly within JavaScript. This means that you wouldn't have the ability to reference pages in the site, and there associated properties. Instead, you' have to maintain a list of pages, the required content and then use JavaScript to parse that (e.g. an external JSON file).

All of these problems are not insurmountable, but there is an alternative approach that could be used. A big thank you and shout out to Janne of [Pakstech.com](https://pakstech.com/blog/hugo-popular-content/), who has written an excellent blog post and acted as the inspiration for this post.

