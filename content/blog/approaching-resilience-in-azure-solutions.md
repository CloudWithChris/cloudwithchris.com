+++
Description = "I mentioned in Building Solutions in the Cloud that I would be writing a series of blog posts on the areas of risk that I have seen since I have been providing guidance around Azure. In this post, I will provide some thoughts on how you can consider resilience within the context of your own solution or application."
date = 2016-08-26T12:00:00-00:00
PublishDate = 2016-08-26T12:00:00-00:00 # this is the datetime for the when the epsiode was published. This will default to Date if it is not set. Example is "2016-04-25T04:09:45-05:00"
title = "Approaching Resilience in Azure Solutions"
images = ["img/cloudwithchrislogo.png"]
Author = "chrisreddington"
# blog_banner = "img/episode/default-banner.jpg"
blog_image = "img/cloudwithchrislogo.png"
categories = ["Azure", "Cloud Architecture"]
tags = ["Azure", "Architecture", "Resilience"]
#series = ["The Nirvana of DevOps"]
#aliases = ["/##"]
+++
I mentioned in [Building Solutions in the Cloud](https://www.christianreddington.co.uk/building-solutions-in-the-cloud/) that I would be writing a series of blog posts on the areas of risk that I have seen since I have been providing guidance around Azure. In this post, I will provide some thoughts on how you can consider resilience within the context of your own solution or application.

In my previous blog post, I kept banging on about the word "Context". Guess what, I'm going to bring it up again! It is very important when designing a cloud service.

Q: Why is it that important?\
A: Your solution is entirely dependent upon another vendor. Therefore, you need to be clear about the purpose and requirements of your system, so that you can design it a way that will function as you expect, in the domain of the vendor's services.

Context is key. Remember your non-functional requirements
----------------------------------------------------------

How comfortable are you with your non-functional requirements? When I say comfortable, I mean could you explain them to me?

*If your answer to the above is yes, good! But let's slightly change the exam question.*

How comfortable is your team with your non-functional requirements? Again, could your team is them to me?

*Again, this is slightly vague. Is "your team" just your direct reports?*

Ok, third time lucky. How comfortable is your entire development team *(Business Analysts, Developers across function teams, Testers across function teams, Project/Program Managers, Security Managers, etc.)* with your functional requirements?

*Could your whole team articulate the same functional requirements to me?*

This probably sounds like I'm teaching to suck eggs, but it's a topic that has become evident since I have been involved in this space. If I asked you to construct me a building and you didn't have some form of plan, where would you start?

You're probably thinking that I'm preaching about Waterfall right now, but that's not the case (Agile all the way!). The point I am making is that your entire team should be pointing in the same direction.

- What are the SLAs that your solution should have? (Availability, Throughput, Duration of Transactions, etc... These are all contextual!)

- What are the data residency requirements of your solution? Do you have some form of compliance constraints that your team should be aware of? Can certain data

- What is the usage profile of your solution, and what is the forecasted growth of usage?

There are many other areas that we could investigate around the softer requirements of the solution, but that gives you an initial flavour.

Once you have those answers, then begin considering the components that you will use within your cloud solution. If you have a solution that has an SLA for 100% availability, there is likely going to be a problem if you pick a cloud component that has an SLA of 99.95%.

You have a few options;

- Identify the risk to your project stakeholders, and highlight the difference in requirements. You could then challenge whether the 100% SLA is required.

- Again, identify the risk to your project stakeholders, and highlight the difference in requirements. They may decided to run at risk, though this should be captured in some form of sign-off.

- Alternatively, this SLA could absolutely be required. If so, then you should consider this when architecting the solution and design a Highly Available system that will help align to this requirement. However, it will add extra complexity. We'll come back to this point in a separate blog post.

Once we have our requirements and a candidate architecture, we can head to our second stage...

Analyse the dependencies across your solution; cloud, on-premises and third party
----------------------------------------------------------------------------------

By this stage, you would have some form of architecture diagram, or a strong understanding of how your solution ties together.

Walk through that solution diagram, and component by component review:

- Whether that component hits your non-functional requirements

- Whether that component requires some form of geographical redundancy (This is quite complex, and would likely be performed at the solution level, e.g. a blue/green deployment. What would happen if a region of your cloud provider went down, due to a natural disaster, a poor network link, etc? Are you protected against that?)

- What would happen if that particular component degrades or entirely fails? Play through the scenario, to see how this would affect your entire solution (i.e. Determine how tightly coupled the solution is and whether it can degrade gracefully).

The above points are very cloud focused. What would happen if there are on premises components (e.g. Databases or Identity systems), or third party services (For example, payments handlers) being used as a pivotal part of your solution.

Ask yourself the question again, what would happen if that on-premises component, or third party services degrades, or worse, entirely fails?

This is the very reason that I mentioned context. Context is incredibly important, as some of these decisions may not be necessary in a system that does not require such high levels of availability. However, for business critical solutions, this extra complexity may be required.

It is up to you to determine the acceptable risk versus complexity. If this is deemed necessary, then there are a [number of well-documented patterns and practices](https://msdn.microsoft.com/en-gb/library/dn600215.aspx).

For a more broader list of patterns and practices, take a look at the [Azure Guidance page](https://azure.microsoft.com/en-us/documentation/articles/guidance/) maintained by the Patterns & Practices team. You can also contribute to that page by using GitHub, so well worth a look!

Resilience is just one area to think about when building a solution in the cloud. In future blog posts, we will investigate additional areas for consideration.