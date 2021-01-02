+++
Description = "If you have been keeping up to date with the latest and greatest in Azure Services (yes, I know there are quite a few!), you may have heard of a new service called Azure Functions. Azure Functions is an event-driven Platform as a Service capability, helping you to execute code upon the occurrence of a particular event. It is currently in preview, though already has a lot of potential."
date = 2016-09-12T12:00:00-00:00
PublishDate = 2016-09-12T12:00:00-00:00 # this is the datetime for the when the epsiode was published. This will default to Date if it is not set. Example is "2016-04-25T04:09:45-05:00"
title = "An Introduction to Azure Functions"
images = ["img/cloudwithchrislogo.png"]
Author = "chrisreddington"
# blog_banner = "img/episode/default-banner.jpg"
blog_image = "img/cloudwithchrislogo.png"
categories = ["Announcement"]
tags = ["Blogging"]
#series = ["The Nirvana of DevOps"]
#aliases = ["/##"]
+++
If you have been keeping up to date with the latest and greatest in Azure Services (yes, I know there are quite a few!), you may have heard of a new service called Azure Functions.

Azure Functions is an event-driven Platform as a Service capability, helping you to execute code upon the occurrence of a particular event. It is currently in preview, though already has a lot of potential.

If you read my recent blog on Logic Apps, you may be thinking that this sounds somewhat familiar to Logic Apps. I agree, though there is a subtle difference. Quoting a [blog post from chilberto](https://blogs.msdn.microsoft.com/azuredev/2016/04/07/azure-content-spotlight-azure-functions/), Azure Functions is _code_ being triggered by an event, whereas LogicApps is a _workflow_ being triggered by an event.

If you consider using Service Bus in a cloud architecture, you may also previously considered, or already implemented a worker role to de-queue and process messages off the bus. How about Azure Functions instead? Let's give it a go.

First, let's create the Azure Function in the Azure Portal.

* There is a point to note here around the _App Service Plan_ type. You can see in the previous screenshot that I selected "Dynamic". This refers to the "Serverless" compute approach of Azure Functions. There is some further detail on the [Azure Function Scalability Documentation pages](https://azure.microsoft.com/en-gb/documentation/articles/functions-scale/) about this. From a cost-perspective, if you have a sporadically running function, then you may want to look at the Dynamic plans.
* Following from the cost point above, the cost of the Azure Function is calculated slightly differently, and is worth a quick read on the referenced documentation page.
* The Azure Functions platform itself will deal with the scalability (scaling out and scaling in) as required, based upon the number of times the configured triggers are hit.
* **Health Warning:** This feature is still in preview. Documentation, functionality and pricing could still change!

Now that we've covered some of the background points, let's jump in to our newly created Azure Function. Once we navigate to the resource, we will be greeted by the quick start page as shown below. Let's start off by clicking the "New Function" button, just under the "Search my functions" box.

For this example, we are going to create a HTTP Trigger that submits a message to a Service Bus Queue. We are going to create a separate Function that reads from that queue and outputs the message into the Function Trace Output.

For our Service Bus Message Producer, let's start off by selecting the HTTPTrigger template, as shown in the below screenshot. Once selected, scroll down to the bottom of the page, and complete the configuration (Naming the Function, and choosing an appropriate authorisation level; for now, I aim to be lazy and go with anonymous).

Congratulations, you have just created a new Azure Function. By default, you will see the associated code for that newly created function. Underneath the function name on the left hand panel, you will see 4 tabs (Develop, Integrate, Manage and Monitor). Select the Integrate tab.

You will notice that you already have a Trigger and an Output for your Function. We will not want to use the HTTP Output, so instead, let's delete that.

Instead, click on the "New Output" link from the above screenshot. You can then select "Azure Service Bus" from the available options, and click "Select", underneath the list of templates.

You will then be presented with the configuration options for the Azure Service Bus Output. You can see that I have pre-populated the Message Type as "Service Bus Queue", and the Queue Name as "messagesqueue". In a later step, I have also updated the access rights to be "Send".

However, there is one more step - We need to configure the connection to the Service Bus Instance. Let's click the "new" link, next to the Service Bus Connection input box. Once we have done that, we will see another blade appear. The list will either populate Service Bus connections already configured to this Function App instance, or we will need to create a new one.

Once clicking "Add a connection string", we simply need to enter a Connection Name (local to the Function App), and provide the connection string details. _(Note, this is a connection string at the Namespace level and is obtainable from the Azure Management portal)_.

You can now see that we have our ServiceBus Connection field populated with the newly created configuration.

Now, let's click Save and enter the below code into the "Develop" tab.

`using System.Net;`

`public static void Run(HttpRequestMessage req, TraceWriter log, out string outputSbMsg) { log.Info($"C# HTTP Trigger, to Service Bus - Executed!"); string message = $"Service Bus queue message created at: {DateTime.Now}"; outputSbMsg = message; }`

There are a few pieces to note;

* We are connecting the input **req** and the output **outputSbMsg** to the integration points that we configured previously.
* In other words, once the Azure Function endpoint has been hit - It will push a string onto the Azure Service Bus queue, stating the DateTime at which the message was created.

In the above screenshot, you can see in the Logs section that we have an output of "C# Http Trigger, to Service Bus - Executed!". I have tested the HTTP Endpoint, meaning we have successfully added a message to the bus. Now we need to handle consumption.

There is a key point that we have avoided. These are called Azure **Functions**, meaning, we should split our logic into functions. _One Azure function should complete one piece of functionality._ Let's create a New Function - "ServiceBusMessageConsumer". This time, we will create a ServiceBusQueueTrigger - C# Function.

Scrolling passed the template gallery, we will see a view, allowing us to configure our Azure Service Bus trigger. I have pre-populated the:

* Function name: ServiceBusMessageConsumer
* Queue name: messagequeue (Important to check that this is the same as your producer queue name)
* Access rights: Listen

The Service Bus Connection was automatically pre-populated with the connection string that we established earlier in the blog.

Once we have clicked create, we will once again be directed to the "Develop" tab. We will not do anything fancy at this stage, and will simply let our function log when a Service Bus Queue message has been detected.

After hitting the http producer endpoint a few times, we can see in the below image that the consumer function has begun processing the messages on the Service Bus.

This is quite a trivial example - But demonstrates the example of de-coupling components in Azure. Additionally, this same approach also works with Azure Service Bus Topics, so could be suitable for message routing within a solution.

Please drop me a Tweet, I'd love to hear what type of things you are creating with Azure Functions!