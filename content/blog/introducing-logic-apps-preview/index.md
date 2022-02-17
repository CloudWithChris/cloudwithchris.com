---
Authors: 
- chrisreddington
Description: "Following hot off the heels of my recent blog post introducing Logic Apps and how I use the technology on cloudwithchris.com, I thought it made sense for the second post to continue the Logic Apps theme. This time, we'll be focusing on Logic Apps preview (sometimes referred to as Logic Apps v2) - the evolution of Logic Apps. Typically when you deploy Logic Apps, you deploy it as a multi-tenanted service. There are some benefits to that, including the serverless capability, so being able to pay per execution rather than an overall infrastructure cost. But what if cost is less of a requirement for you? What if you care more about portability, greater performance, and ultimately control over your environment? If those are more along the lines of your requirements, then you may want to investigate the Logic Apps previewhttps://docs.microsoft.com/en-us/azure/logic-apps/logic-apps-overview-preview. The Logic Apps preview builds upon the Azure Functions extensibility model. Yes, you read that right - Azure Logic Apps is effectively building on top of Azure Functions. Why should you care? Anywhere that Azure Functions can run, then Logic Apps can run."
PublishDate: "2021-04-28T8:00:00Z"
image: img/cloudwithchrislogo.png
categories:
- Announcement
date: "2021-04-28T8:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Logic Apps
- Integration
- Microservices
- Azure
title: Introducing Logic Apps Preview
banner: "images/cloud-with-chris-banner.png"
---
Following hot off the heels of my recent blog post [introducing Logic Apps and how I use the technology on cloudwithchris.com](/blog/introduction-to-logic-apps), I thought it made sense for the second post to continue the Logic Apps theme. This time, we'll be focusing on Logic Apps preview (sometimes referred to as Logic Apps v2) - the evolution of Logic Apps. Typically when you deploy Logic Apps, you deploy it as a multi-tenanted service. There are some benefits to that, including the serverless capability, so being able to pay per execution rather than an overall infrastructure cost. But what if cost is less of a requirement for you? What if you care more about portability, greater performance, and ultimately control over your environment?

If those are more along the lines of your requirements, then you may want to investigate the [Logic Apps preview](https://docs.microsoft.com/en-us/azure/logic-apps/logic-apps-overview-preview). The Logic Apps preview builds upon the Azure Functions extensibility model. Yes, you read that right - Azure Logic Apps is effectively building on top of Azure Functions. Why should you care? Anywhere that Azure Functions can run, then Logic Apps can run.

If you're familiar with Azure Functions, your mind will likely start thinking of the several types of environments in which you could run these. If you're not, let's help you out! Azure Functions can be executed by using the Azure Functions runtime in machines (physical or virtual) or could even be executed from within a container. So you could feasibly run your Logic Apps within a container or across a set of pods within a Kubernetes cluster. If you'd prefer a Platform as a Service (PaaS) based approach (rather than a host it yourself approach) to host the Logic App, then you will need to opt for either a Premium or App Service Plan. [The documentation states clearly](https://docs.microsoft.com/en-us/azure/logic-apps/logic-apps-overview-preview#changed-limited-unavailable-or-unsupported-capabilities) that running the Logic Apps preview in the Azure Functions Consumption plan is unavailable and unsupported.

As a result of the fact that the Logic App preview runtime builds upon the Azure Functions runtime, it also changes the local development experience. For the better. You can now go ahead and debug and test your Logic Apps locally. Furthermore, the team have been doing some incredible work to improve the authoring experience. There is now a [Visual Studio Code Extension available](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurelogicapps) where you can begin local development of your Logic App (preview) workflows through a visual designer, just like the one you are used to in the Azure Portal.

Ok, great. With that context, let's explore creating a new Logic App (preview) locally. First off, there are a few pre-requisites that we'll need to have installed -
* Visual Studio Code, with the following extensions
  * [Azure Accounts Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.azure-account)
  * [C# Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.csharp)
  * [Azure Logic Apps Preview Extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurelogicapps) (I understand that the Logic Apps and Logic Apps preview extensions can live side-by-side within VSCode)
* [Azure Functions Core Tools](https://github.com/Azure/azure-functions-core-tools/) (The docs specify version 3.0.3245 or later is required)
* Azure Storage is a required dependency for Azure Functions to run. Typically, the [Azure Storage Emulator](https://docs.microsoft.com/en-us/azure/storage/common/storage-use-emulator) is used for local debugging in Windows environments. However, that is not available for macOS and Linux environments. If this is you, then you will need to create a Storage Account and use those details for your Logic App.
* [.NET Core SDK](https://dotnet.microsoft.com/download)

Once you have installed those extensions, make sure that you are logged in to the appropriate Azure Account that you wish to use for this demo.

  > You can sign in to another Azure Account by using the [Visual Studio Code Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette). Once you have the VS Code command Palette opened (Ctrl + Shift + P on Windows, Cmd + Shift + P on macOS), you can type Azure: Sign In or Azure: Sign Out if you have the Azure Account extension installed.

Once you have successfully signed in, you should be able to see a list of subscriptions underneath the Logic Apps (Preview) section of the Azure VSCode Extension.

![Select an Azure Account in Visual Studio Code](images/introducing-logic-apps-preview/vscode-azure-account.png "Select an Azure Account in Visual Studio Code")

Next up, we'll want to create a project for our Logic Apps (preview) project. Notice in the previous screenshot that there is a small folder icon? Click on that and create a new folder in your desired directory.

At this point, you will notice that a new option pops up within Visual Studio Code. You need to select a template for your Logic App Workflow, either a **Stateful** workflow or **Stateless** workflow.

You'll likely know the difference between these two terms from a generic architectural perspective (i.e. one contains state, while the other does not), but what does that mean from a Logic Apps implementation perspective with this new runtime?

* You may want to consider a **Stateful** workflow when you need to reference data from previous events. Consider the scenario where you need to save the inputs and outputs of each action for a review of the workflow run after the fact. An additional benefit of stateful workflows is continuity in the event of some issue impacting the running of the workflow (e.g. an outage). As the state is externalised, the Logic App can continue running as it will effectively have an indicator of the most recent execution step. [The documentation](https://docs.microsoft.com/en-us/azure/logic-apps/logic-apps-overview-preview#stateful-and-stateless-workflows) mentions that a Stateful workflow can continue running for up to a year, which I thought was quite impressive!
* On the other hand, a **stateless** workflow may be appropriate when you don't have the requirements mentioned above. Rather than externalising the inputs/outputs for each action to Azure Storage, these are saved in memory. This means that if there was an outage, the Logic App would not be able to recover as the contents within memory would have been lost. However, as the Logic App is not externalising the state to a state store, that means that response times can be quicker, higher throughput can be reached and potentially cost savings due to no external storage being needed. These stateless workflows are typically shorter in nature, with the documentation citing that they're typically less than 5 minutes long.

With that context, let's continue onwards. As this is intended to be a blog on the Logic Apps Preview runtime rather than Logic Apps as a platform (actions, etc.) - I'm opting for the stateless workflow to keep things focused on a basic scenario.

  > If you do not have the .NET Core SDK installed, you will encounter an error at this point, saying *"You must have the .NET Core SDK installed to perform this operation. See here for supported versions."* Go ahead and install this and restart Visual Studio Code. While creating this blog post, I had a preview version of .NET 6.0 installed, but VSCode failed to create the workflow. Once I removed that version of .NET (I tried with both .NET 5.0 and .NET Core 3.1), I was able to continue successfully.

You will then be asked to provide a name for your workflow file and confirm whether you want to open the workflow in the existing window. Great, at this point we should now have a brand new project created!

![A default Stateless Workflow Project template created in Visual Studio Code](images/introducing-logic-apps-preview/vscode-logicapps-default-project.png "A default Stateless Workflow Project template created in Visual Studio Code")

Now we want to move forwards with the interesting part, and get designing! I mentioned a bit earlier that the Logic Apps team have been improving the authoring experience. If you right click on the workflow.json file, you will see several options including **Open in Designer** as demonstrated in the screenshot below. Click on that option.

![Screenshot showing the menu options when right clicking the workflow.json file](images/introducing-logic-apps-preview/vscode-rightclick-workflowjson.png "Screenshot showing the menu options when right clicking the workflow.json file")

Assuming that you have the Azure Functions Core Tools installed, you should see the designer open within a few seconds. If you're having any issues, double check the output within VSCode. I hadn't installed the Azure Functions Core Tools before running this step, which is why I encountered some issues. Once installed and reloading VSCode, all worked as expected.

![Screenshot of the Logic Apps Preview Designer in VSCode](images/introducing-logic-apps-preview/vscode-logicapp-designer.png "Screenshot of the Logic Apps Preview Designer in VSCode")

Now, let's go ahead and add a trigger for **When a HTTP request is received**. You will see that the local URL will be generated after the workflow is saved. We'll also add another step to provide an HTTP 200 response. The focus of this post isn't to demonstrate an extravagant workflow, but to demonstrate the Logic Apps preview - Hence we'll keep this as simple as possible! Once you've added the additional step, don't forget to hit save on the top left hand corner.

![Screenshot of the Logic Apps Preview Designer in VSCode with a HTTP Request Trigger and an HTTP Response](images/introducing-logic-apps-preview/vscode-logicapp-http-request-response.png "Screenshot of the Logic Apps Preview Designer in VSCode with a HTTP Request Trigger and an HTTP Response")

Navigate back to the workflow.json file in Visual Studio Code (viewing it as code, rather than the editor), and you will see that we now have a trigger and an action. So, if you're thinking ahead - Yes! We now have a streamlined development experience, where we can commit our Logic Apps changes to a Git repository, while still using the designer tooling that we know and love.

  > If you don't see any changes in the workflow.json file, make sure that you definitely saved your changes from earlier in the designer!

![Screenshot of the Logic Apps Preview in VSCode with the workflow.json code for a HTTP Request Trigger and an HTTP Response](images/introducing-logic-apps-preview/vscode-logicapp-http-request-response-code.png "Screenshot of the Logic Apps Preview in VSCode with the workflow.json code for a HTTP Request Trigger and an HTTP Response")

Now, you'll be able to go ahead into the "Run and Debug" section and run the Logic Apps Workflow. Before doing that, if you are using macOS or Linux, you will need to make sure that you have updated your ``AzureWebJobsStorage`` property in your ``local.settings.json`` file to a connection string for an Azure Storage Account if you don't have the Azure Storage Emulator available locally.

  > As a reminder, the Azure Storage Emulator does not run on macOS or Linux. As the Azure Functions runtime has a dependency on Azure Storage and I'm creating this example from a MacBook, I'll need to change the ``AzureWebJobsStorage`` property in my ``local.settings.json``.

With the Logic Apps workflow running locally, right click on the workflow.json file in your navigation pane and select **overview**. You should see the callback URL available for the Logic App workflow which is running. Feel free to call this endpoint using your usual tool of choice, e.g. Visual Studio Code REST extensions, Postman, Web Browser, etc. For completeness (and the sake of a screenshot for this blog post), I edited my workflow to respond with a JSON body, as can be seen in the below screenshot.

![Screenshot of the Logic Apps endpoint returning a HTTP 200 response with JSON Object](images/introducing-logic-apps-preview/logicapp-http-response-200.png "Screenshot of the Logic Apps endpoint returning a HTTP 200 response with JSON Object")

Now for a couple of other concepts. You may have noticed the term "Built-in" connectors or the term "Managed"  (Azure) connectors. The built-in triggers/actions run natively within the Logic Apps Preview runtime environment. If you are using any managed connectors, these run on deployed into Azure.

  > If you do not see any other options than built-in connectors (like in my designer screenshot earlier), then you may need to enable these for your project. You can do this by right clicking on the workflow.json file, selecting use connectors from Azure and following the steps on screen. If you already have the editor open, you may need to reload it to see the managed connectors which are now available to you.
  
There is not yet full parity in terms of all built-in connectors being available. There are also some differences between Stateless/Stateful and which triggers will be shown. You can find these well documented [here](https://docs.microsoft.com/en-us/azure/logic-apps/logic-apps-overview-preview#changed-limited-unavailable-or-unsupported-capabilities).

  > You can even create your own custom built-in connectors, as documented [here](https://docs.microsoft.com/en-us/azure/logic-apps/create-stateful-stateless-workflows-visual-studio-code#enable-built-in-connector-authoring).

But hold on, when I'm running Logic Apps in a serverless / consumption mode, I'm charged by execution, and per connector use. What's the difference here, especially if I'm running this is in a container, or an app service, or similar? That's a great question. The team haven't released any details around the pricing model yet. You will of course have to pay for the underlying infrastructure where you're running the Logic Apps runtime (e.g. App Service). If you're running a stateful Logic Apps workflow, then you'll also need to consider the pricing of Azure Storage (as Logic Apps preview externalises the state to Azure Storage).

So overall, why should you care about the Logic Apps Preview? I think there are a couple of main points that I find particularly interesting about this -
* The Logic Apps Preview runtime builds upon the Azure Functions runtime. This means that it can be deployed in a number of new environments, including containers!
* As it builds upon the Azure Functions runtime, and there is a great investment into the authoring experience, the overall development experience is much simpler and effective. I can create a project from my machine and commit it to my Git repository, while still using the designer experience that I know and love.
* Not only can I develop locally, but I can test locally as well. Once again, with thanks to the Azure Functions runtime and the Core Functions tools, being able to run a local version of the Logic Apps workflow for the inner loop of my development.

So that's it for this blog post. What do you think? Will you be trying the new Logic Apps Preview? What use-cases are you considering building? I'd love to hear more! Get in touch over on [Twitter, @reddobowen](https://twitter.com/reddobowen).

That's it for this blog post. So, until the next one - bye for now!