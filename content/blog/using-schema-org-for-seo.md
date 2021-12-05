---
Author: chrisreddington
Description: "One of my recent tasks for Cloud with Chris was to investigate some additional areas for SEO optimisation. If you're unaware, SEO stands for Search Engine Optimization; a set of practices to improve your ranking in search engines such as Google, Bing and others when they crawl and index your site. I was already in a good position, but there were some things that were frustrating me, we'll explore those in this blog post."
PublishDate: "2021-05-03T8:00:00Z"
image: img/cloudwithchrislogo.png
date: "2021-05-03T8:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- SEO
- Development
- Web Development
title: Using schema.org for SEO optimisation
---
One of my recent tasks for Cloud with Chris was to investigate some additional areas for SEO improvements. If you're unaware, SEO stands for Search Engine Optimization; a set of practices to improve your ranking in search engines such as Google, Bing and others when they crawl and index your site. I was already in a good position, but there were some things that were frustrating me, we'll explore those in this blog post.

From the screenshot below, you'll notice a few interesting details among the results -
* There are a series of **smart links** which appear directly the main cloudwithchris.com result. One for about, and one for a certain podcast episode.
* Some links contain additional 'metadata'. For example, the YouTube, Facebook and Dev.To links have a set of breadcrumbs above the link, showing an outline of the site's structure.
* Not shown in the screenshot, but you may have noticed that some sites have an integrated search input when you're searching on your favourite search engine.

![Search results for Cloud with Chris in Google](/img/blog/using-schema-org-for-seo/google-results.png)

Search Engine Optimisation is based on a number of factors, including -
* Description Metadata on your pages
* Keywords on your pages
* Unique titles for each of your pages
* Page load times
* Good security practices (e.g. HTTPS)
* and much more...

There are plenty of existing articles that talk about how to optimise these common SEO practices, so I recommend you search for these as I'm going to aim to not reinvent the wheel. If you're interested on how I achieve some of these in Cloud with Chris, you can take a look at the [metadata partial template](https://github.com/chrisreddington/cloudwithchris.com/blob/master/themes/cloud-with-chris/layouts/partials/seo/meta.html) that I use within my Hugo template.

Initially, some of the content in my metadata partial built upon existing examples from the Hugo Community without fully understanding the purpose (lower priority item on the backlog), including an example below;

```json
<script defer type="application/ld+json">
  { 
    "@context": "http://schema.org", 
    "@type": "WebSite", 
    "url": {{ .Permalink }}, 
    "sameAs": [
      {{ printf "%s%s" "https://twitter.com/" .Site.Params.social.twitter | htmlUnescape |  safeHTML }}, 
      {{ printf "%s%s" "https://github.com/" .Site.Params.social.github | htmlUnescape |  safeHTML }}
    ], 
    "name": "{{ .Title }}", 
    "logo": {{ "/favicon.ico" | absURL }}
  }
</script>
```

This is an interesting snippet of code. What is it doing? Well, this is the magic that tells search engines how to display our listings, combined with the metadata that we mentioned earlier (Title, Description, etc.).

So, what is schema.org? According to the schema.org site *Schema.org is a collaborative, community activity with a mission to create, maintain, and promote schemas for structured data on the Internet, on web pages, in email messages, and beyond... Founded by Google, Microsoft, Yahoo and Yandex, Schema.org vocabularies are developed by an open community process, using the public-schemaorg@w3.org mailing list and through GitHub.*

As you'll probably gauge from the above, schema.org is an open specification to provide structured data so that the search engines understand the desired listing for our search results. Once again, if you're interested you can find how I've implemented these standards in my [metadata partial template](https://github.com/chrisreddington/cloudwithchris.com/blob/master/themes/cloud-with-chris/layouts/partials/seo/meta.html).

There are a couple of resources that were invaluable in implementing this -
* [Using schema.org as a reference for the different schema types](https://schema.org/) - I use this to appropriately render different information (e.g. a Guest page should be a [person](https://schema.org/Person), A blog post should be an [article type](https://schema.org/BlogPosting), a podcast episode should be an [episode type](https://schema.org/PodcastEpisode), etc.)
* [Google Search's Rich Result Test](https://search.google.com/test/rich-results) - I used this page to copy/paste the generated/rendered (i.e. when I used hugo serve in my local environment's) schema.org script/metdata. This helped me confirm whether the metadata structure is valid, and *may* be used by the search engine.

![Example schema.org validation in Google Rich Results Test](/img/blog/using-schema-org-for-seo/google-richresults-test.png)

Navigating over to my Google Search Console admin center, I see a new area which focuses on enhancements. This targets the schema types that I have defined. At time of writing, this includes Breadcrumbs, Sitelinks searchbox and Videos. As an example, when we look at breadcrumbs, we can see that Google has been crawling the site and picking up the additional metadata over recent days.

![Google identifying breadcrumbs enhancements over recent days](/img/blog/using-schema-org-for-seo/google-searchconsole-breadcrumbs.png)

What does that look like from a Search Result perspective? Notice that the most recent result in the list was the event sourcing and materialised view episode? Searching for that in Google gives us the following result -

![Showing breadcrumbs in Google Search](/img/blog/using-schema-org-for-seo/google-breadcrumb-searchresult.png)

This can be incredibly powerful. For example, have you ever searched for 'How To' content and noticed that certain results automatically bubble up to the top of the page, with a card displaying step by step instructions? Guess how that's done... You guessed it, using a structured schema approach! Schema.org is one example of using structured data. There are others, including JSON-LD (which we've been using throughout this post, and Cloud with Chris), Microdata and RDFa. You can find further details on these, and how structured data works in general over at [Google's page - Understand how structured data works](https://developers.google.com/search/docs/guides/intro-structured-data).

I'm now in the process waiting for Google to discover the changes, re-crawling/re-indexing the site over time. The breadcrumb results seem to be working well so far, but I haven't seen any changes based upon Person/Blog/Podcast episode as yet, so will be monitoring the impact of these changes.

What do you think of using structured schema to influence the search engine results? Have you implemented this on your own site, and have some ideas or recommendations? Or have you read through this, and thought of some ideas that I may have overlooked? I'd love to hear further! Let me know over on [Twitter, @cloudwithchris](https://twitter.com/reddobowen).

Thanks for reading, and I hope this has encouraged you to investigate implementing structured schema for your own ite! Until the next blog post, bye for now!