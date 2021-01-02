+++
Description = "By now, we should be aware of the benefits that the cloud can bring to any individual or organisaton. There are plenty of case studies, talking about the scalable, flexible and economic benefits. Companies see the cloud as a differentiator, and utilise it to disrupt and innovate in their respective markets. Gartner predicts that in 2016 the total public cloud market is due to increase by 16%. But, Chris - You're starting a blog about technology. Why are you talking to me about customer case studies and market fact? Why? Context."
date = 2016-08-04T12:00:00-00:00
PublishDate = 2016-08-04T12:00:00-00:00 # this is the datetime for the when the epsiode was published. This will default to Date if it is not set. Example is "2016-04-25T04:09:45-05:00"
title = "Building Solutions in the Cloud"
images = ["img/cloudwithchrislogo.png"]
Author = "chrisreddington"
# blog_banner = "img/episode/default-banner.jpg"
blog_image = "img/cloudwithchrislogo.png"
categories = ["Azure", "Cloud Architecture"]
tags = ["Azure", "Architecture", "Scalability", "Resilience"]
#series = ["The Nirvana of DevOps"]
#aliases = ["/##"]
+++

By now, we should be aware of the benefits that the cloud can bring to any individual or organisaton. There are plenty of case studies, talking about the scalable, flexible and economic benefits (See [Azure](https://azure.microsoft.com/en-gb/case-studies/), [AWS](https://aws.amazon.com/solutions/case-studies/) or [Google](https://cloud.google.com/customers/) for more information).

Companies see the cloud as a differentiator, and utilise it to disrupt and innovate in their respective markets. [Gartner predicts](http://www.gartner.com/newsroom/id/3188817) that in 2016 the total public cloud market is due to increase by 16%.

But, Chris - You're starting a blog about technology. Why are you talking to me about customer case studies and market fact? Why? Context.

I work with a broad set of enterprise clients focused around custom development. Custom Development is broad - My specialism is in Azure solution development and DevOps.

Interestingly, there are a number of trends that seem to repeat. Customer X aims to use the cloud to go to market more quickly; Customer Y aims to use the cloud to reduce management overhead. These benefits are very high level, and we need to think a bit deeper in terms of achieving those, on a project by project basis.

Consider an e-commerce site. It has users on a 24x7 basis, potentially 365 days a year. It cannot afford downtime, as that has a direct loss of profitability to the business. Potentially millions.

Conversely, consider an internal HR portal for a small business. It is likely used predominantly within working hours, and has a limited user-base.

Each of these scenarios will have very different requirements, both from a functional and non-functional perspective. This is important, perhaps even moreso when considering the cloud as your next step. You need to think of the whole setup, end to end and not just the architecture. Think People, Processes AND technology - [ITIL](https://en.wikipedia.org/wiki/ITIL) anyone?

Thinking solely technical architecture is a very easy trap to fall into, when transitioning into the cloud.

- What happens if there is a disaster, for example - a datacenter outage?
- What happens if our data leaks - How will we respond as an organisation?
- How will we support our users to provide a great end-user experience?
- How do we ensure consistency and continuity across our cloud resources, and the mechanisms that we use to deploy them?

Consider the supporting operations. The innovation of cloud technologies is rapid, and keeping up can be tough. But you need to ensure that your processes safeguard you. It is part of the mindset of transitioning from product to service...

- How can you provide a great customer experience, if your custom support team is available 9 - 5, when customer usage is 24x7?
- How can you be sure that your Disaster Recovery processes are appropriate, when they were last tested on the sites initial deployment?
- What will happen if you roll out a major release into production, but due to a lack of load testing - You find you have deployed code which contains a bottleneck and hits performance in your live environment.

It is not just about the cloud architecture, but also about the governance and supporting organisational policies and processes. You will now have a cloud vendor involved. You may be utilising third party services as well. It is important to ensure there is clarity on responsibilities, clear governance on cloud usage and defined processes and escalation routes for those unwanted eventualities.

You remember what I said about context earlier? There is no "one size fits all". The governance model, operations and architecture are relevant to you, and your solution. That means, that you may have a different architecture to suit an SLA, or a different supporting process. Context is important when building in the cloud, so consider this when thinking about your technical architecture and planning your operational procedures and governance.

Over the coming weeks, I will share some of the common risk areas that I have seen in the field. They will of course be my own personal opinion, though I hope that they will enlighten you. Stay tuned for more.