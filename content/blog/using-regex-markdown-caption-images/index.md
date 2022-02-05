---
# Default hugo properties
title: "Using RegEx and VSCode's Find/Replace capability to add captions to markdown images"                   # Name of the blog
description: "If there's an easy way to achieve something, then I'm all for it! You may have noticed that I've been putting a lot of effort into refactoring my site and open sourcing the original Cloud With Chris theme. I've now released that as the Hugo Creator theme for Hugo. As part of the refactoring process into a reusable theme, I had to make several breaking changes. This meant that I'd need to update the contents of my site. I want to share a quick tip that I discovered to add captions to my images in markdown."             # Used for SEO optimisation
publishDate: "2022-02-05T20:01:00Z"             # TODO: Differentiate between date
date: "2022-02-05T20:01:00Z"                            # TODO: Differentiate between PublishDate

# Site-wide [required properties]
image: "img/cloudwithchrislogo.png"                   # Displayed when referenced in listing pages
images:                     # An array of images used in Social Sharing
- "img/cloudwithchrislogo.png"
tags:                       # Used for SEO optimisation and browsing across the site.
- Visual Studio Code
- Regular Expressions
- Automate
- Markdown
- Accessibility
- Productivity
- Developer Tools

# Site-wide [optional properties]
externalLink: ""            # Full URL to override listing links to an external page

# Content-specific properties
authors:
-  "chrisreddington"                       # An array of authors of the post (filenames in person).
---
If there's an easy way to achieve something, then I'm all for it! You may have noticed that I've been putting a lot of effort into refactoring my site and open sourcing the original Cloud With Chris theme. I've now released that as the [Hugo Creator theme](https://github.com/cloudwithchris/hugo-creator) for [Hugo](https://gohugo.io/). As part of the refactoring process into a reusable theme, I had to make several breaking changes. This meant that I'd need to update the contents of my site. I want to share a quick tip that I discovered to add captions to my images in markdown.

Throughout my content, I had been very inconsistent at how I referenced images in markdown. In some cases I used the `![](image.png)` syntax, in others I used the `![](image.png "Caption")` syntax. I've [written posts previously about the importance of accessibility on Cloud With Chris](/blog/making-cloud-with-chris-more-accessible/). All of my images had descriptions associated, which meant they would be accessible for screen readers. However, what if the image was unclear? Or if the image was complex and could be misinterpreted by a user?

I wanted to quickly and easily replace all of the images referenced with the `![](image.png)` (description but no caption) syntax to also include a caption. Given that I had some images that already used captions, I couldn't just do a simple pattern match with wildcards or similar. 