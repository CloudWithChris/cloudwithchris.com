---
Author: chrisreddington
Description: During the 2020 Festive Break, I had a lot of time on my hands. I took
  4 weeks of my Annual Leave, which meant I had the majority of December to personal
  time. Personal time / time off is great, but I also wanted to push myself and catch
  up on some pieces that were on my personal learning or achievement list for some
  time. I started refreshing my knowledge around Rails (having developed in it some
  years ago, it's progressed quite a bit!), NodeJS, GoLang and Rust. All interesting
  to learn, and I'm sure I'll be continuing on my journey with these throughout 2021.  But
  that's not the point in this blog post. One of the activities that I kicked off
  was contributing into the Hugo Community. Read on to find out more.
PublishDate: "2021-01-06T12:00:00Z"
image: img/cloudwithchrislogo.png
categories:
- Announcement
date: "2021-01-06T12:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Hugo
- Open Source
title: Contributing to a Hugo Theme - The Castanet and  Hugo Community Themes
---
During the 2020 Festive Break, I had a lot of time on my hands. I took 4 weeks of my Annual Leave, which meant I had the majority of December to personal time

Personal time / time off is great, but I also wanted to push myself and catch up on some pieces that were on my personal learning or achievement list for some time. I started refreshing my knowledge around Rails (having developed in it some years ago, it's progressed quite a bit!), NodeJS, GoLang and Rust. All interesting to learn, and I'm sure I'll be continuing on my journey with these throughout 2021.

But that's not the point in this blog post. One of the activities that I kicked off was contributing into the [Hugo](https://gohugo.io) Community. There are two main areas where I contributed -

1. [The Hugo Castanet Theme](https://github.com/mattstratton/castanet) - This is the theme that is used by my website CloudWithChris.com. There were some additional features that I helped contribute, such as Gender Pronouns, Contributing towards the Blog Functionality, Episode Number Customisation and more. Matt has been absolutely amazing, so a big shout out to him. I'll talk more about Open Source Contributions in my next blog post.
2. [The Hugo Community Theme](https://github.com/chrisreddington/hugo-community) - For those of you involved in the Hugo Community, you're probably thinking - this isn't a theme I've heard of before. And you'd be right! This is one that I have created from scratch myself. So let's find more about it in the rest of this blog post...

I've recently taken on the role as Co-Organizer for the [Azure Thames Valley Meet-up Group](https://www.meetup.com/en-AU/Azure-Thames-Valley/). I've been chatting with several other organisers/co-organisers about the aspects they've learned in setting up their own Azure user groups - what works well, what doesn't work well, etc. There is a theme around having a presence (i.e. a website) and Twitter. Twitter is easy to solve, but the website could be a little more challenging. Why challenging? Well, we need to take into account that this is a side-hustle. This is not the main day-job, and should be lightweight and easy to manage, ideally not costing much either, as user groups are typically sponsored on a session by session basis. Even then, you would want the sponsorship to go towards the main purpose of the user group - the community of individuals that are attending your event.

So, with all that in mind - I came up with the idea of the Hugo Community Theme. The intent behind it, is a flexible Hugo theme that can be used in community groups, or conferences to showcase events, speakers and community resources.

Why Hugo? First, let's start with "What is Hugo" as there may be some readers who have not used/do not know what Hugo is. Hugo is a static site generator written in GoLang (don't worry, you don't need to know GoLang to use it!). This means that it converts markdown pages into HTML when you build/compile/render the website.

For local development, you can use the "Hugo Serve" command to get your local instance of the site updating in real-time as you make edits. For a production deployment, you would typically compile the website into the static assets (HTML/JavaScript/CSS/Images) and push that to a platform.

Take for example CloudWithChris.com. This website is built using Hugo, uses the Castanet theme (as mentioned earlier, thank you again [Matt Stratton](https://twitter.com/mattstratton)!) and is hosted on Azure Blob Storage, fronted by Azure CDN. As an experiment, I also have the assets pushed up to AWS S3 and GCP's Cloud Storage, and have an open item to load balance origins across all 3 endpoints (perhaps that could be another blog post).

As you can see, Hugo checks a number of those requirements. Easy to manage (i.e. uses markdown). Low cost (as storage is typically very cheap, and CDN costs are pretty cheap as well. (Both have the benefit of having a cost proportional to the number of users that you would have visiting the site; low number of users, low cost).

This is how I arrived at the conclusion that I wanted to build a theme for Hugo. Fortunately, there are a few good resources out there about getting started -

- [Hugo new theme reference - gohugo.io](https://gohugo.io/commands/hugo_new_theme/)
- [Creating a Hugo Theme From Scratch - retrolog.io](https://retrolog.io/blog/creating-a-hugo-theme-from-scratch/)
- [Let's Create a New Hugo Theme - pakstech.com](https://pakstech.com/blog/create-hugo-theme/)

So overall, after a few weeks of work and learning how Hugo works (e.g. Functions, rendering orders of pages and numerous other aspects), I almost have a minimum viable product. There are a few "paper cuts" that I'd like to fix, which you can checkout over on the [Hugo-Community Project Board](https://github.com/chrisreddington/hugo-community/projects/1).

There are four scenarios that the theme addresses -

1. Single Group, Single Event - Consider this a conference scenario, where you have an annual event and an instance of the site per event.

  ![Example Conference HomePage](/img/blog/contributing-to-a-hugo-theme/hugo-community-home.jpg "Example Conference HomePage")

2. Single Group, Multi Event - Consider this a user group scenario. Each user group wants their own instance of the site, but will have many events across the years that they wish to showcase.

  ![Example Events Listing Page](/img/blog/contributing-to-a-hugo-theme/hugo-community-events.jpg "Example Events Listing Page")

3. Multi Group, Single Event - Consider this a conference scenario, which has sub groups associated with it. A good example could be something like lube on with the numerous special interest groups.

  ![Example Event Page](/img/blog/contributing-to-a-hugo-theme/hugo-community-event.jpg "Example Event Page")

4. Multi Group, Multi Event - Consider this similar to a platform like meetup.com, where many groups would centralise their groups/events on a site. By no means is the intent to compete against something like meetup.com, but instead - I think this theme serves another purpose. This could be a theme to allow "hyper-focused" platforms to show relevant groups. For example, if I want to find out about all the Azure Groups, then there'd be an Azure Deployment of this site. For AWS, an AWS deployment. Then, user groups could make Pull Requests into the site's source code to add their groups, events, speakers and community information to the website.

  ![Example Group Page](/img/blog/contributing-to-a-hugo-theme/hugo-community-group.jpg "Example Group Page")

As part of this theme, I wanted to make it easy for speakers to be discovered, so displaying speaker profiles prominently on the site with a list of events they had attended was a key requirement.

  ![Speaker Page](/img/blog/contributing-to-a-hugo-theme/hugo-community-speakers.jpg "Speaker Page")

You've probably already heard in my videos that the reason I am podcasting, blogging vlogging, etc. is to give back to the community. So, given that this theme focuses around community, it made sense to also have a section for community resources.

  ![Community Resources](/img/blog/contributing-to-a-hugo-theme/hugo-community-resources.jpg "Community Resources")

Now of course, knowing my background - You'll know that I wanted to automate the build and deployment aspects as well. For this, I've been using GitHub Actions and Netlify. I've chosen Netlify as the target deployment as they have some great free hosting options for Open Source projects, and they also integrate well into GitHub, allowing you to get preview links directly in the UI (particularly useful when you're working on preview branches and committing PRs!).

On the GitHub actions side, this is an evolving story. There are aspects in there including HTMLProofer, Markdown Linting, Building the website across various combinations of node versions and Hugo versions. If you're interested, feel free to take a look over on the GitHub Repo under the GitHub workflows folder.

Overall, this has been a very fun project to kick-off and get to know the Hugo Community (when I say Hugo community, I mean the people who build/support Hugo, rather than my theme Hugo-Community!). I've been quite active over on the [Hugo Discourse](https://discourse.gohugo.io/), both in asking questions to support my theme's development, as well as supporting others where my knowledge can help contribute back to the community.

Every month, the Hugo community nominate two users to be their "New User of the Month", based upon their contributions to the community, the number of views they have received on their posts, and who has interacted with those posts. To my complete surprise (and delight), [I was one of the two users for December 2020](https://discourse.gohugo.io/badges/44/new-user-of-the-month), so a big thank you to the community, not just for receiving this, but being so welcoming and helpful!

So, a few thoughts to wrap up this blog -

- Are you interested in the theme? If so, get in touch - I'd love to hear how you think of using it!
- Are you interested in contributing to the theme? Again, if so - get in touch - Take a look at the GitHub repository, as I've spent some time making sure it's in a state that people can get up and running quickly.
- What projects have you had a chance to work on? I'd love to hear about them, and what you've learned along the way. Tweet me over at [https://twitter.com/reddobowen](@reddobowen).

If you've made it this far, thanks for reading! As always, would love any feedback that you have - so please drop me a tweet as well! I hope that this blog has been useful/insightful on how I've spent some of my time over my festive break.

Now, until the next blog - Bye for now.