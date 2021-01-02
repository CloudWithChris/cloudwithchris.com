+++
Description = "Scalability is one of the common areas where I have seen common misconceptions, when customers begin building on the platform."
date = 2016-09-29T12:00:00-00:00
PublishDate = 2016-09-29T12:00:00-00:00 # this is the datetime for the when the epsiode was published. This will default to Date if it is not set. Example is "2016-04-25T04:09:45-05:00"
title = "Are you thinking of scalability in your cloud application?"
images = ["img/cloudwithchrislogo.png"]
Author = "chrisreddington"
# blog_banner = "img/episode/default-banner.jpg"
blog_image = "img/cloudwithchrislogo.png"
categories = ["Azure", "Cloud Architecture"]
tags = ["Azure", "Architecture", "Scalability"]
#series = ["The Nirvana of DevOps"]
#aliases = ["/##"]
+++

Scalability is one of the common areas where I have seen common misconceptions, when customers begin building on the platform.

But before we jump into that topic, let's first revisit the three main cloud operating models or paradigms:

- Infrastructure as a Service (IaaS) - Think of this as "Hosting" your application. The clue is in the term "Infrastructure", you are very much getting a Virtual Machine - So are responsible for the Operating System, Network Connectivity, etc.

- Platform as a Service (PaaS) - Think of that as "Building" your application. Rather than caring too much about the underlying infrastructure (i.e. Which version of the OS, advanced configurations of the underlying infrastructure), you abstract away from those details and focus on building the application quickly. (Note: There is likely still some degree of configuration required here!)

- Software as a Service (SaaS) - Think of this as "Consuming" an application. You don't want to build another version of an application, so you consume software that has been produced by another organisation. Think of Office 365 as an example here.

There are a couple of other concepts to be aware of; Scaling Up vs. Scaling Out.

- Imagine scaling up as throwing more power behind a particular server (i.e. Increasing the number of CPUs it has, increasing the RAM).

- Now, think of Scaling out as building out a server farm. Replicating the level of machine that you have, and increasing the number of instances of that machine to serve the volume of load that you have.

Now, time for some myth busting!

1. An especially important one - The cloud does not necessarily scale automatically. Be sure that once you have chosen an Azure Service, that you are comfortable on configuring scalability. (For example, in App Services, [you may need to configure scalability rules](https://azure.microsoft.com/en-gb/documentation/articles/app-service-scale-readme/). This differs to [Azure Functions Scalability](https://azure.microsoft.com/en-gb/documentation/articles/functions-scale/), where you can either choose a Service Plan or Dynamic Service Plan. There is once again a different approach to be configured when [Scaling Azure Service Fabric](https://azure.microsoft.com/en-us/documentation/articles/service-fabric-concepts-scalability/)).

2. Understand how scaling can impact your application. For example, at time of writing, when changing the performance level of SQL Azure, a replica is generated at the new performance level, and the connections are swapped across to the new replica once the requested changes have been made. No data will be lost, but during the switchover, connections to the database are disabled, meaning some transactions in flight may be rolled back (more detailed documentation available [here](https://azure.microsoft.com/en-gb/documentation/articles/sql-database-scale-up/)). Therefore, it is important to understand on a service-by-service level, how scaling up affects ongoing performance. There is a good talk from Microsoft Ignite "[Design for scalability and high availability on Microsoft Azure](https://myignite.microsoft.com/videos/3179)", which talks about the cloud mind set of scaling out rather than scaling up.

3. Do not wait until production to test whether your solution scales. Ensure that you have tested an environment that is representative of your production environment, at a comparable level to your expected volume of load. This seems like I'm teaching to suck eggs, but this is something that I have seen come up a number of times!

4. Now that we have talked about individual components scaling, start thinking about the bigger picture. It would be a huge management overhead to re-deploy different performance tiers/SKUs of services, if you are not scaling out based upon demand. Consider pulling together your Infrastructure as Code using Azure Resource Manager (ARM) templates. This will make your infrastructure more easily to re-deploy, and therefore, easier to re-deploy at different levels of scale. The [Patterns for designing Azure Resource Manager templates](https://azure.microsoft.com/en-gb/documentation/articles/best-practices-resource-manager-design-templates/) has some good recommendations around "T-Shirt Sizes" and Capacity planning.

Elasticity is one of the large selling points of the cloud, and is something that we should embrace when building Cloud applications. Though be cautious, it is especially important to ensure that you are familiar with how each service in your application scales.

Make yourself aware of the general principles before building your solution. Test the scalability at representative levels of load before you you go into production and Keep refining those load tests, ensuring that they remain representative of the volume of traffic that you are servicing.