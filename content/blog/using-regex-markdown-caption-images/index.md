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

Fortunately, Visual Studio Code [Find/Replace](https://code.visualstudio.com/docs/editor/codebasics#_advanced-find-and-replace-options) has some advanced functionality that allows you to use Regular Expressions when using the Find/Replace feature. This means that you can not only use RegEx to find certain patterns, but can use capture groups to extract specific parts of the pattern. You can then use those capture groups to replace the pattern with the desired outcome.

That's exactly what I did with my images. I used a regex to identify all images using the `![](image.png)` syntax, and used a capture group to extract the descriptions already in place for those images. I then referenced the variable of that capture group, to output the text as a caption.

It took me less than five minutes or so to do this. Don't worry, I'm not a RegEx expert! But there are some great tools out there to help you with RegEx. One of my personal favourites is [Regex101](https://regex101.com/). It has personally been helpful for me when I'm trying to figure out a pattern.

So, what were the patterns?

To find the image, I used the pattern ``!\[(.*?)\]\(([\w\/\-\._]+?)\)``.

* This pattern will match any image using the `![](image.png)` syntax.
* The first capture group will match the description of the image.
* The second capture group will match the filename of the image.

For the replace segment, I used the pattern ``![$1]($2 "$1")``.

* This pattern will place the description (first capture group) back into the description segment.
* This pattern then places the filename (second capture group) back into the filename segment. However, it also adds a caption to the image, by once again using the description from the first capture group.

![On the right hand side, you can see that the Find section contains the Regular Expression referenced above. The replace section, then outputs the desired pattern (which will then display the caption of the image). In the editor pain, it shows that the Image markdown references without captions are selected, whereas one a caption is not selected. The right hand pane shows that there are 325 image references identified across 41 files.](images/vscode-regex-example.jpg "On the right hand side, you can see that the Find section contains the Regular Expression referenced above. The replace section, then outputs the desired pattern (which will then display the caption of the image). In the editor pain, it shows that the Image markdown references without captions are selected, whereas one a caption is not selected. The right hand pane shows that there are 325 image references identified across 41 files.")

As you can imagine, this was a quick and easy way to add captions to my images. I did not particularly fancy updating 325 images manually across all of my blog posts. I was worried that this task would take a long time. But thankfully, RegEx is very powerful and helped me to quickly and easily enhance the quality and accessibility of my content.

I hope that this post has helped you to improve your workflow and make your markdown content more accessible. Are there any other regular expressions that have helped you? Or perhaps you'd like to see a post on other RegEx time-savers? Let me know in the comments below! And of course, please share this post if you have found it useful!
