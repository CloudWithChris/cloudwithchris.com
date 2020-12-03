+++
Title = "1 - Requirements in Context"
Description = "This is the first episode! We'll be talking about all things requirements. Why is that? Well, that's the place any kind of project should start - What are you aiming for, what are you trying to achieve and what is the context?"
Date = 2020-03-01T00:01:00Z
PublishDate = 2020-03-01T00:01:00Z # this is the datetime for the when the epsiode was published. This will default to Date if it is not set. Example is "2016-04-25T04:09:45-05:00"
podcast_file = "1 - Requirements.mp3" # the name of the podcast file, after the media prefix.
podcast_duration = "15:42.383"
podcast_bytes = "18354176" # the length of the episode in bytes
episode_image = "img/cloudwithchrislogo.png"
#episode_banner = "0:40:04"
#guests = [] # The names of your guests, based on the filename without extension.
#sponsors = []
episode = "1"
images = ["img/default-social.png"]
hosts = ["chrisreddington"] # The names of your hosts, based on the filename without extension.
#aliases = ["/##"]
#youtube = ""
explicit = "no" # values are "yes" or "no"
# media_override # if you want to use a specific URL for the audio file
# truncate = ""
categories = ["Architecture"]
series = ["Architecting for the Cloud, one pattern at a time"]
tags = ["Architecture", "APIs", "Cloud Design Patterns"]
+++

Hello and welcome to the first episode of Cloud with Chris. Now I should start by introducing what this podcast is all about.

My name is Chris Reddington, and day to day I help different organisations move their way into the cloud. Of course, I see many trends and themes as I help those organisations move. So, what I want to do is share those with you in my podcast.

It could be about solution architecture, DevOps and the operational readiness of bringing up a workload, or just diving into a specific cloud service.

Now don't worry! The plan is that you shouldn't have to listen to just me on every single episode. I'm planning to bring in some of my friends, colleagues and other folks onto the show, so we can get some variety of perspective and learn from different journeys into the cloud.

So now that we've explained the show, let's start talking about the first episode! Let's start at the very beginning, a very good place to start (and if you know me, you'll know I couldn't resist a good musical reference!) - We'll be talking about all things requirements. Why is that? Well, that's the place any kind of project should start - What are you aiming for? What are you trying to achieve and what is the context?

So, that is why the first episode will be known as requirements in context. Enjoy.

Let's start with an analogy. I ask you to go and design a building. Where do you start?

Now that pause was deliberate. Because, your mind is already going to be racing in so many directions. What question do you start with? Let's have a think. What is the building's purpose? Is it an office, a shop, a factory, a warehouse, a theatre maybe? There are so many options that we could choose.

Now each of those types of scenarios is likely going to have a different set requirements and criteria on how they should and in fact need to be designed. They may potentially even have some external regulations that they need to adhere to. Now speaking about regulations, there may be rules that are required because you are in a specific country, or region of a country, or maybe even some kind of industry-dependent regulation, which you need to meet because (for example if it was a hospital, let's say).

All of these thoughts are before we even begin to speak to our specific client, and what finer requirements that may be important to them. For example, let's assume the organisation is a hotel chain. Do they have a brand of being a unique boutique hotel, who care deeply about providing a high-class customer service and care about style and brand for example? Or is it a budget hotel based near an airport, where simplicity and maximising on the number of rooms available is a key requirement?

You can see where this analogy is going, and you can see how this aligns to requirements for a cloud project as well. You're probably thinking that this is a very common topic, and shouldn't deserve a place as the defining episode of my podcast! I recently setup my blog posts again, and was reading a blog from about 4 years ago, titled "Building Solutions in the Cloud", which focused on the importance of defining these requirements.

4 years on, and I find I'm still having the very same discussions with a lot of organisations as they begin along their cloud journey.

The cloud is not a magical destination, but it is a new destination. Being ready for that new destination requires a little bit of preparation ahead of time, as we're designing for a new environment. Now we need to consider these, regardless of our approach, whether that's a Lift and Shift scenario or some kind of re-architecture or re-write.

Cloud isn't magical (and I'm very sorry to say that as I'd love to call myself a cloud magician, that would be really cool!) - But those thoughts around availability, uptime and scalability - like we thought about on premises - still absolutely need to be considered in advance, and leads us into the world of requirements based engineering.

On that thought - let's start with the topic of resilience! Resilience from a solution architecture perspective is focused on the availability of our solution, and how we deal with any potential failures. I'm a firm believer of if it can happen, then it probably will happen!

So when you think of resilience, you typically think of the term SLA (Service Level Agreement), which is normally shown as a percentage value and helps us determine the amount of downtime that the end-business or customer should be able to tolerate.

Now we also typically think of metrics to describe the recovery requirements of the system. For example RTO (Recovery Time Objective) which is the maximum amount of time an application can be unavailable when an incident has taken place, and RPO (Recovery Point Objective) which is the maximum amount of data loss that is acceptable during a disaster.

We also hear of metrics such as Mean Time to Recover (MTTR) which is an availability metric to determine the average time it takes to restore a failed component, and the Mean Time between Failures (MBTF) which describes how long a component should last between failures.

Now defining these types of metrics ahead of time is a super valuable activity, before putting any pen-to-paper and writing up any kind of architecture diagram.

There are definitely themes that I see in this space when I work with organisations. For example:

- Not having any clearly defined availability requirements, so not knowing what target they need to achieve
- Not having any clearly defined requirements, so they design based off assumptions which will never meet the business' requirements without some re-work or re-architecture needed at a later point
- Or worse yet, overcomplicating the design to meet requirements which are not needed so adding in extra complexity to meet some kind of availability requirement that just isn't needed and isn't suitable for that environment

Failing to plan is planning to fail. There are plenty of design patterns and approaches that you can take to build resilience concepts into a cloud architecture (and we'll touch on those in other episodes!). But you first need to understand what is it that you're aiming to achieve. And this needs to be well understood by not just yourself, but by the entire project team who are working on the solution.

Let's think of a financial system which is critical to processing transactions in a banking environment. That's going to have much higher availability requirements than my own podcast for example (although I would like to think my listeners would be sad at not being able to hear my lovely voice!).

You shouldn't think about those requirements in the cloud in a different way to how you define those for your current environment. You likely think in terms of racks and datacentres, so let's break this down into a few scenarios -

Scenario 1 - You host your applications and your underlying solution instances in the same rack
Scenario 2 - You host your applications and instances in the same datacentre building
Scenario 3 - You host your applications and instances in different datacentre buildings but those datacentre buildings are in a small distance of each other
Scenario 4 - You host your applications in different datacentres, but perhaps they're split across different countries or different areas across a country

Each one of those scenarios will have a different tolerance to failure.

- For example, if there was a power outage in a rack, then scenario 1 would suffer downtime whereas the others would not
- If there was a significant weather event (e.g. tornado/lightning strike/ tsunami for example) which caused issues with a particular building, then Scenarios 1 and 2 would fail. You can see how this idea extrapolates outwards.

These concepts translate in exactly the same way to the cloud. We still need to consider these eventualities. Cloud Services still run in datacentres, but at a much bigger scale.

So the question is now a little less abstract than picking a percentage number that you want to be available, but what scale of risk are you willing to accept compared to cost? Cost is another factor which we must consider in the context of these decisions. This is especially as important - I've seen occasions where designs have been overcomplicated - which is a risk in its own right - and will cause an increase in cost directly to the resources that you are consuming, as well as the ongoing maintenance of the system as well.

Consider the scenario, where you are building a solution using Microsoft Azure. You have a requirement of 99.9% SLA. That sounds quite high, but in reality, that means you can afford about 10.1 minutes of downtime a week, 43.2 minutes per month and about 8.76 hours per year.

To contrast that, a 99.999% SLA would mean 6 seconds of downtime a week, 25.9 seconds per month and 5.26 minutes per year. So that's quite a difference!

At a high level, how would you design an application to meet each of those requirements? Each approach would drive you in a slightly different variation. For example, in the latter scenario, you may want to design the system to be resilient against a catastrophic event where an entire Azure region could be brought down - Perhaps by a Tsunami, Meteor strike, or one of those big events that we mentioned earlier.

In the initial 99.9% SLA scenario, it would be likely that running in a single region (potentially even in the same building) would be acceptable to meet the requirements. We do of course need to factor in our own processes into that agreement, for example, any downtime window for updating our software and the application itself into that SLA, so that we then know what we are going to be giving to our end business users or end customers. Now that briefly touches upon the area of DevOps, but we will definitely  be talking about that in another episode as well.

I have seen a number of organisations take the approach of  "we're only as strong as the weakest link", meaning, they set the SLA of the solution equal to the component with the lowest SLA percentage. However, I would argue that this is not the most accurate way to look at it. You should look at something called a Composite SLA, where you look at the sum of the parts (or rather, the product of the failure of those parts) rather than looking at the weakest part of the system.

Moving on from resilience, let's talk about scalability and performance.

Consider that solution that you were architecting earlier on (with the 99.9 or the 99.999% SLA). How many users does the application need to serve? That's quite a broad question, so we might need to understand that in some more detail.

- What is the number of concurrent users (i.e. using the system at the same time)?
- What is the total number of users overall?
- When do those users actually use the system (Is that during working hours? During a particular region's time zone for example? Or is it used 365 days a year, 24x7?)?
- That then brings us onto an interesting question. Where are those users located? Does the service need to be available in all of those regions to minimise latency for example?

You can see how these questions start another web of thinking and begin a set of trade-offs between the overall pillars of Cost, Resilience and Scalability. There are plenty of other factors, or pillars to consider, but this begins to get us thinking and arrive at a level of detail to bring an initial view of our architecture.

The answers to these questions begin to lead us to a certain set of outcomes. We should factor that cost element into these decisions as well, and can use pricing calculators and public cloud pricing to help us estimate what that will look like. Of course, if we can design a solution that can auto scale rather than operate at a constant level, then this could mean we could also optimise on cost and only have the higher level of provisioned compute as needed, rather than having it all the time. But you may have noticed, I've just made an assumption about the requirements of an architecture, and that would be something else for us to validate. Whether that workload is spiky for example, whether there is some seasonality to the load or whether there is a constant level of load.

Now remember that these requirements shouldn't just be considered as part of the "Overall" solution's SLA, but are worth considering in the context of any subsystems or microservices. For example, do you have a specific microservice that needs to be global and can handle requests below some level of latency and process a certain amount of transactions per minute? If those sets of requirements are particularly different to your overall solution, or that specific subsystem has particular nuances around their requirements, then you should make sure they are clearly  defined and considered separately, and most importantly, that they are documented.

It's key to ensure all of these requirements in the context of our business and our solution. Yes, there absolutely are proven practices and proven patterns out there, example reference architectures, but there is no “one size fits all”. The operating model, the governance and associated architecture and all those requirements are relevant to you, and your solution.  Context is important when designing your  solution, so keep referring back to these throughout your design process.

We have only begun to scratch the surface on this topic. There is plenty more for us to explore further in future episodes. There are a number of books which cover software design  requirements and architectures where some of these concepts have been re-used from. There are also architecture centres on all of the main cloud providers that you should go and take a look through, to see any reference architectures, common patterns and themes amongst requirements.

I hope that this has triggered some initial ideas on any designs that you may be working on, and given a framework of thought to approaching architecture design. I'd love to hear suggestions for topics to cover in future episodes, and also hear any of your feedback on this episode! Please get in touch on Facebook or Twitter at CloudWithChris!

Until next time, Good bye!
