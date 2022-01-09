---
Author: chrisreddington
Description: "I love learning. Especially when it's about brand new things that I wasn't aware of! For this post, I need to give a big shout out to my friend and colleague Sam Rowe for the tip. We were on a call for a separate project, and Sam brought up Microsoft Clarity as part of the discussion. It wasn't a product/service that I was aware of, but felt like something that could be useful for me on Cloud With Chris. In this post, I'll dig into what it is, how it may be able to help you, and some of the early insights (e.g. website heatmaps, session recordings to understand user engagement) I'm seeing from Cloud With Chris."
PublishDate: "2022-01-09T09:00:00Z"
image: img/cloudwithchrislogo.png
date: "2022-01-09T09:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Web Development
- Observability
- Monitoring
title: Gaining insight into user behaviour with Microsoft Clarity
---
I love learning. Especially when it's about brand new things that I wasn't aware of! For this post, I need to give a big shout out to my friend and colleague [Sam Rowe](https://twitter.com/Sam_Rowe) for the tip. We were on a call for a separate project, and Sam brought up Microsoft Clarity as part of the discussion. It wasn't a product/service that I was aware of, but felt like something that could be useful for me on Cloud With Chris. In this post, I'll dig into what it is, how it may be able to help you, and some of the early insights (e.g. website heatmaps, session recordings to understand user engagement) I'm seeing from Cloud With Chris.

## What is Microsoft Clarity?

Microsoft Clarity is a simple tool that allows you to determine how people use your website. 

At this point, you're probably sat there thinking - "Okay, Chris - how is this different to Google Analytics or Application Insights? They gives me all of the insight that I need!". Sure, that gives you statistics around user engagement, but does it allow you to *see* how users interact with it?

That's right, imagine that you could **see** how your users interact with your site. Do you lose them at a certain point? Do they scroll for 50% on the majority of your pages, but 90% on a new post that you had written? This is exactly the level of insight that Microsoft Clarity provides.

We can break down the functionality into a few key areas -

* **Google Analytics Integration** - You may have exclaimed earlier, Chris - I'm already using Google Analytics! Well, that's great news - Microsoft Clarity integrates with Google Analytics. 
  * *Google Analytics Segments* - Suppose that you have set up your own [Google Analytics Segments](https://support.google.com/analytics/answer/3123951?hl=en#zippy=%2Cin-this-article), e.g. users from a given city, or in a certain demographic. These segments are automatically imported into Microsoft Clarity, so that you can filter down on them in the generated heatmaps and session recordings.
  * *Enhance Google Analytics* - We mentioned that session recordings are a built-in feature of Microsoft Clarity. If you use Google Analytics as your daily insights driver, then that's no problem - You can view session recordings directly within Google Analytics.
  * *Or, bring Google Analytics to Microsoft Clarity* - Likewise, there is a dashboard in Microsoft Clarity for you to analyse, visualize and explore your Google Analytics metrics.
* **Heatmaps** - Heatmaps allow you to understand user engagement based on Clicks, Area and Scroll depth of your website. These are visual diagrams, exactly what you think of when you think of the term 'heatmap'.
  * Where do your users frequently click? 
  * What percentage of your users scroll down to a certain part of your site?
  * Even, down to specific HTML elements. You can filter these heatmaps based upon the captured segment information, compare those across user segments and then share that with other members of your team
* **Insights** - Not only do we get some great visual cues showing how the users are interacting with our site, we can also get some additional metrics.
  * *Dead clicks* - Discover when users click but nothing happens
  * *Quickbacks* - Examine moments users move to a new page but immediately return to the previous one
  * *Rage clicks* - Find out where users rapidly click again and again
  * Filter recordings based on sessions where JavaScript errors had been encountered. This allows you to see what the user was doing, before any issues were seen! (Again, getting that balance between stats and understanding of user behaviour).
  * Filter data based on many different filters (e.g. user location, browser session, etc.). You can then utilise this for ongoing tracking by saving this as a segment.
* **Session Recordings** - Statistics are great, but wouldn't it be even better if you could see how users are interacting with your site? That's exactly what this enables you to do!
  * The recordings are anonymized, and all data captured is GDPR compliant (more on that later, as there are some considerations that you must make!). You can watch those recordings back in different speeds (just like a YouTube recording).
  * This allows you to understand any points of frustration. Does the user keep clicking on a certain area of your page, so they're expecting a response? Could that be a bug that you had missed?
  * Once again, filter data based on many different filters (e.g. user location, browser session, etc.).

## How does it work?

## This feels a bit minority report. How does this relate to user privacy, GDPR, etc.?

## How is this working on Cloud With Chris?