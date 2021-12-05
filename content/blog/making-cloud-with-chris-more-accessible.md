---
Author: chrisreddington
Description: "I've recently been on a journey. I've recently come across a number of accessibility issues on cloudwithchris.com. I've been working on making the site more accessible, and I've also been working on making it more inclusive. In this blog post, I'm going to outline some of my findings, the tools that I used to identify those, and how I've worked to fix them. This is an ongoing project, so I'll provide further posts as it makes sense."
PublishDate: "2021-07-16T09:00:00Z"
image: img/cloudwithchrislogo.png
date: "2021-07-16T09:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Accessibility
- Diversity and Inclusion
- Development
- Web Development
title: Making cloudwithchris.com more accessible
---
I've recently been on a journey. I've recently come across a number of accessibility issues on [cloudwithchris.com](https://cloudwithchris.com). I've been working on making the site more accessible, and I've also been working on making it more inclusive. In this blog post, I'm going to outline some of my findings, the tools that I used to identify those, and how I've worked to fix them. This is an ongoing project, so I'll provide further posts as it makes sense.

## How we got here

Diversity and Inclusion is an important topic to me. You'll have seen it recently feature on the show, with [an excellent session from Melissa Jurkoic](/episode/diverse-team-crucial-to-startup-success/). I've also recently read the book Measure What Matters by John Doerr, which talks about using OKRs (Objectives Key results) to drive vision and focus towards a common goal. My focus on Cloud With Chris has been grass-roots and organic so far, and has done well. Though, I'm now at a stage where I want to be more intentional and targeted with what I do.

With that, I have several objectives - but I'll be focusing on one in particular in this post. The objective is **Objective: Cloud With Chris is recognised as a platform for all.**. Yes, it's bold. Yes, it's ambitious. I won't go into detail on all of the Key Results that I'm working towards (as this could become a very lengthy post - so I can potentially break that out into a separate one), but we will focus on one of those Key Results. **Key Result: Cloud With Chris theme should 100% conform to accessibility standards by end of September 2021.**

So we have a vision, and we have a quantified goal. Let's get started.

## How do we find out the current state?

Firstly, we need to understand the current state of accessibility on the site. This isn't an area that I had typically explored in the past, so started with research. I had recently heard of Microsoft's [Accessibility Insights](https://accessibilityinsights.io/) project. The product comes in a few flavours (For Web, For Windows, For Android). As we're talking about a Web site, I decided to use the Web version (which is available as an extension for Chrome and the new Microsoft Edge).

Once installed, you'll see a new icon in the top right of the address bar. Clicking on this will show you a number of different ways to search for issues. As I mentioned, I'm still going on my journey here. However, I've used the [FastPass functionality](https://accessibilityinsights.io/docs/en/web/getstarted/fastpass/) to find some of the most common accessibility issues.

This FastPass feature scans your site, and in less than 5 minutes will identify some of the common accessibility issues which exist on your site. Fortunately for me, I built the Cloud With Chris theme, so I can actually take action on the issues that I'm seeing. If you're using a theme made by someone else, you may have less control (but could be a great contribution, if they'll allow it!)

Not only does the FastPass feature list the issues with the web page, it also visualizes them on your site, by putting boxes around the offending site elements. Some of my findings included -

* Colour contrast issues
* Links not accessible for screen readers
* External content such as YouTube videos not having accessible names
* Code blocks not accessible for screen readers

These issues are available with examples on the [accessibility insights page](https://accessibilityinsights.io/info-examples/web/). Let's break down what each of these mean in separate sections.

## Colour contrast issues

Why should we care? The web is a visual medium, and colour is important. We often think about it from a branding perspective. But it's even more important to make sure that the text on the page is readable. Have you ever thought about how people with visual disabilities, low vision, limited colour perception, or presbyopia might be able to read the text on a web page?

There are contrast ratings available between a foreground colour and a background colour. For small text, you're looking for a contrast ratio of 4.5:1, whereas for large text you need a contrast ratio of 3:1. I'm sure there's a lot more to it, and I'm simplifying things here - but this has been my interpretation of the information provided on contrast ratio. I aimed for a ratio of 4.5:1 for all text on the page.

This information is fully documented over on the [Accessibility Insights](https://accessibilityinsights.io/info-examples/web/color-contrast/) web page.

Now that raises the question, how do you evaluate the contrast ratio? And more importantly, how can you find colours that will work for your site, while still maintaining the contrast ratio? This I found a little tricky, but after some digging I found [this tool](https://contrast-finder.tanaguru.com), which allows you to test the contrast ratio of any foreground and background colour based either on RGB or Hexadecimal. You can then specify whether you want the Foreground Colour to change, or the Background Colour to change.

![Contrast Suggestions from the Tanaguru Contrast-Finder tool showing that the initial contrast had a ratio of 2.7 compared with a minimum of 4.5](/img/blog/making-cloud-with-chris-more-accessible/contrast-suggestions.jpg)

I navigated through various pages, hunting down any colour combinations that were lower than the minimum contrast ratio of 4.5:1. This included individual code snippets (not code blocks); the pink colour on the background didn't have a high enough contrast to the background. I believe I have caught all of these now, so this should now be fixed.

## Links not accessible for screen readers

Some of my navigation links include dropdown functionality. For example, the "Episode" page has a dropdown menu, which allows you to navigate between Past or Upcoming episodes. These links were not as accessibl as they could be.

Why is that? Well, assistive technologies rely upon object names and other metadata to identify the specific objective on the page. All of my dropdown links had the same value for the ``aria-labelledby`` property, which meant assistive technologies would have not been able to correctly identify the dropdown menu.

This was a very small code change, with a big impact. Below is an example;

From using an ID on the anchor tag, and aria-labelledby on the unordered list with a value of ``navbarDropdownMenuLink`` (which was used across all dropdown lists on the site).

```html
<li class="nav-item dropdown">
  <a class="nav-link dropdown-toggle" href="#" ID="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
    Series
  </a>
  <ul class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">                      
    {{ range $name, $taxonomy := .Site.Taxonomies.series }}
      {{ with site.GetPage (printf "/%s" ($name | urlize )) -}} 
        <li><a class="dropdown-item" href="{{ .Permalink | absURL }}">{{ .Title }}</a></li>
      {{ end }}
    {{ end }}
  </ul>
</li>
```

To using an ID on the anchor tag, and aria-labelledby on the unordered list with a value specific to that menu. For my series dropdown, this became ``seriesNavbarDropdownMenuLink``. Other dropdowns have a different name, e.g. ``episodeNavbarDropdownMenuLink``.

```html
<li class="nav-item dropdown">
  <a class="nav-link dropdown-toggle" href="#" ID="seriesNavbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
    Series
  </a>             
  <ul class="dropdown-menu" aria-labelledby="seriesNavbarDropdownMenuLink">                
    {{ range $name, $taxonomy := .Site.Taxonomies.series }}
      {{ with site.GetPage (printf "/%s" ($name | urlize )) -}} 
        <li><a class="dropdown-item" href="{{ .Permalink | absURL }}">{{ .Title }}</a></li>
      {{ end }}
    {{ end }}
  </ul>
</li>
```

## External content such as YouTube videos not having accessible names

Similar to the link issues, I had some videos on my site that were using the ``<iframe>`` tag to embed YouTube videos. These videos were not accessible for assistive technologies. There is [another example](https://accessibilityinsights.io/info-examples/web/frame-title/) for frames or iFrames, and shows that a property of either title, aria-label or aria-labelledby needs to be added.

YouTube videos are embedded on the site using iFrames. For each episode, I store the YouTube video ID in episode's YAML frontmatter (e.g. metadata). This is used in the theme's episode layout pages to render the YouTube video if the YouTube property exists and the episode is published.

This means, I could make a single fix in one place, and it would affect all episodes on the site.  It was once again a simple tweak. After adding a variable for the title of the episode, I had to change a single line of code in the episode layout.

```html
<iframe class="embed-responsive-item" src="https://www.youtube.com/embed/{{ . }}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
```

Notice that there is no ``title`` attribute on the iframe? I have that information in the episode's YAML frontmatter, so just needed to inject it in to the iFrame as below.

```html
<iframe class="embed-responsive-item" src="https://www.youtube.com/embed/{{ . }}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="{{ $title }}"></iframe>
```

This was once again a simple fix, with a big impact. I'm happy with it.

## Code blocks not accessible for screen readers

This was an interesting one to solve. I begun thinking through this problem by looking at the code blocks on my site. I was not aware that assistive technologies would not be able to read the code blocks. I quickly realised that this may be a little out of my control. When using a code block, I need to add three backticks (```) before and after the code block. I also need to add a language attribute to the code block. This informs Hugo to render the code block as code.

So, the problem isn't with my site design at this point, but is in fact how Hugo generates codeblocks. From looking into the [accessibility insights explanation](https://accessibilityinsights.io/info-examples/web/scrollable-region-focusable/), it looked like a fairly simple fix (adding tabindex="0" to any generated codeblocks). While it's a simple fix, there is a problem. I don't know the Hugo codebase, so I'm not sure where the fix would be best applied.

As a good open source citizen, I felt it was my responsibility to at least raise this as a [GitHub issue](https://github.com/gohugoio/hugo/issues/8758) in the Hugo project. I'm pleased that within hours of it being raised, I was told that there is already an issue being tracked (my bad for not finding that one!). Not only an issue being tracked, but a Pull Request had been created by another community contributor to fix the problem. Going one step further, the maintainer of the project merged the request soon after the discussion on my issue took palce.

So, while I didn't directly write any code - I have helped contribute an accessibility fix to the Hugo project. Something I'm incredibly pleased of! I haven't seen a new version of Hugo since the PR was merged, but I've no doubt it will come very soon. I've said it many times before, and I'll say it again - Hugo has a brilliant community which supports it, and I'm very happy to be a part of it.

> Are you involved in Open Source? How often do you show your appreciation to others? You should! Even if you're not the one writing the code or part of the project maintenance team/leadership, [it's still important to show your support](https://github.com/gohugoio/hugo/pull/8568#issuecomment-880804128).

So, this fix is not yet live on the site. But, as soon as the new hugo version is available, I will be upgrading so that the code blocks are accessible.

## Conclusion

By no means am I the only one who has come across accessibility issues on the web. And I'm by no means finished with my accessibility journey. But I'm happy to say that I have addressed all of the issues I have come across, and I'm happy with the progress I have made. There is more to be done, and it's on all of us to make the web a better place.

Have you any suggestions for accessibility issues you have encountered on your site? Or have you come across any accessibility issues on the web? I'd love to know which part of this post you found most helpful. Please let me know over on [Twitter, @reddobowen](https://twitter.com/reddobowen).

Until the next time, thanks for reading and good luck with your accessibility journey!
