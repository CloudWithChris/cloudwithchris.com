---
Authors:
- chrisreddington
Description: "In a previous blog post, I provided an overview of the Distributed Application Runtime (dapr) and explained how it is a useful framework when building microservices. In this blog post, I will show you how to use dapr to enqueue and dequeue messages locally with Azure Service Bus and Azure Storage Queues."
PublishDate: "2022-04-26T22:00:00Z"
image: img/cloudwithchrislogo.png
date: "2022-04-26T22:00:00Z"
banner: "images/banner.png"
images:
- img/cloudwithchrislogo.png
tags:
- Containers
- Kubernetes
- Microservices
- Open Source
- Development
- Dapr
- Distributed Application Runtime
- Azure Service Bus
- Cloud
- Azure
- Queue
series: 
- "CNCF Projects"
title: Enqueue and Dequeue messages locally with dapr, Azure Service Bus and Azure Storage Queues
---
In a [previous blog post](https://www.cloudwithchris.com/blog/introduction-to-dapr/), I provided an overview of the Distributed Application Runtime (dapr) and explained how it is a useful framework when building microservices. In this blog post, I will show you how to use dapr to enqueue and dequeue messages locally with Azure Service Bus and Azure Storage Queues.

> **Note:** If you haven't read my [previous blog post - Introduction to the Distributed Application Runtime (dapr)](https://www.cloudwithchris.com/blog/introduction-to-dapr/), please do so now as I will assume that you have initialised dapr and have a working local environment.

I will be creating a couple of simple .NET 6 application. I will write a **producer** app (i.e. the application that will send messages to Azure Service Bus) and a **consumer** app (i.e. the application that will receive messages from Azure Service Bus).

> **Note:** You are not limited to using .NET 6.0. In fact, you could write multiple microservices each in a different language. There are a range of languages which have [a dapr SDK](https://docs.dapr.io/developing-applications/sdks/) which is either in development or stable. These include C++, Go, Java, JavaScript, .NET, PHP, Python and Rust. If an SDK does not exist for your language, then you could also consider calling the dapr sidecar over HTTP. [Here is an example](https://docs.dapr.io/developing-applications/building-blocks/state-management/howto-get-save-state/) on how to get and save state by calling the dapr sidecar over HTTP.

With that context out of the way, let's get started.

## Pre-requisites

* [Install .NET 6.0](https://dotnet.microsoft.com/en-us/download/dotnet/6.0)
* [Install the dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/) and follow the steps in [my previous blog post](https://www.cloudwithchris.com/blog/introduction-to-dapr/) to initialise dapr
* Install an editor of your choice, I prefer [Visual Studio Code](https://code.visualstudio.com/)
* [Create an Azure Service Bus namespace and Queue](https://docs.microsoft.com/en-us/azure/service-bus-messaging/service-bus-quickstart-portal) (The Basic SKU will be plenty, as we're putting together a simple sample to interact with a queue)
* [Create an Azure Storage Queue](https://docs.microsoft.com/en-us/azure/storage/queues/storage-quickstart-queues-portal)

## Creating the producer application

Once you have the pre-requisites created, we can begin creating the producer application. The role of the producer application is purely to send messages to the Azure Service Bus Queue. We'll create a separate application later to dequeue messages from the Azure Service Bus Queue.

First up, let's create a new .NET Console application. We'll create this app with a background service type of model in mind.

```bash
dotnet new console -n DaprExample.Producer
```

Next up, we have a choice. We have two ways that we can interact with the dapr sidecar (and therefore reap the benefits of dapr, e.g. service invocation, being able to leverage the component model, etc.). The first is using the [dapr Client Nuget package](https://docs.dapr.io/developing-applications/sdks/dotnet/dotnet-client/) to interact with the dapr sidecar. The second is using HTTP requests to directly call the APIs that are exposed by the sidecar.

For simplicity, we will use the NuGet package option. There is an added benefit, as we'll be able to use intelligent code completion (intellisense) in our code editor as a result of using the SDK.

Let's go ahead and add the NuGet package to our project.

```bash
dotnet add package Dapr.Client
```

With that complete, we can now begin writing some code! To keep this example simple, I'll be writing the code in Program.cs. For a production application, I'd break out my definitions into a separate file. However, this application will simply increment a counter and send it to the Azure Service Bus Queue.

```csharp
// Use the dapr client .NET SDK
using Dapr.Client;

// Set up the appropriate binding information
string BINDING_NAME = "azurebusbinding";
string BINDING_OPERATION = "create";

// Initialise the counter to 0 and init the Dapr Client
var daprClient = new DaprClientBuilder().Build();
var counter = 0;

// Keep looping every second, create a message by invoking the binding.
while (true)
{
    Console.WriteLine($"Counter = {counter++}");
    await daprClient.InvokeBindingAsync(BINDING_NAME, BINDING_OPERATION, counter);
    await Task.Delay(200);
}
```

Great. That was easy, wasn't it? Let's go ahead and execute the application. We'll need to make sure that dapr is executed alongside the application.

> **Note:** This was covered in my previous blog post - Introduction to the Distributed Application Runtime (dapr). You can check it out [here](https://www.cloudwithchris.com/blog/introduction-to-dapr/).

At this point, you'll notice that the application is unable to run. This is because the code is attempting to invoke a dapr binding called "azurebusbinding". However, we have not yet configured any binding component in dapr. To fix this, we'll need to add the binding to our dapr deployment.

Below is an example of a yaml file to define an Azure Service Bus Queue binding. Other components in dapr will follow a similar pattern. All of the schemas are clearly outlined and documented in the [dapr documentation](https://docs.dapr.io/reference/components-reference/).

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azurebusnosecrets
  namespace: default
spec:
  type: bindings.azure.servicebusqueues
  version: v1
  metadata:
  - name: connectionString
    secretKeyRef:
      name: servicebusConnectionString
      key: servicebusConnectionString
  - name: queueName
    value: testqueue
  - name: ttlInSeconds
    value: 60
auth:
  secretStore: azurekeyvault
```

> **Note:** Notice that there was a property called connectionString which takes a value through a 'secret key reference'. This is because the connection string is considered sensitive material and should be stored in a secret key.
>
> You may also notice that there is a property called ``auth.secretStore`` which references another dapr component (a secret store). This is where dapr will look to find the secret that was mentioned above.

Of course, the previous yaml referenced a secret store. So we need to create the configuration for that component as well!

Below is the YAML file definition used to configure the secret store. In this example, I reference an existing Azure KeyVault which should be used. I have omitted some of the details from the YAML file, to protect the secret material used to authenticate with Azure KeyVault. You can find the full schema definition for Azure KeyVault [here](https://docs.dapr.io/reference/components-reference/supported-secret-stores/azure-keyvault/).

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azurekeyvault
  namespace: default
spec:
  type: secretstores.azure.keyvault
  version: v1
  metadata:
  - name: vaultName
    value: daprkvtest
```

Right, let's try that again. We'll need to make sure that dapr is executed alongside the application, by using the ``dapr run`` command.

> **Note:** As a reminder - This was was covered in my previous blog post - [Introduction to the Distributed Application Runtime (dapr)](https://www.cloudwithchris.com/blog/introduction-to-dapr/).

This time, you should see that the application is running successfully. The application will increment a counter every second and send it to the Azure Service Bus Queue. The current value of the counter is also sent to the console.

## Creating the consumer application

Now that we have messages on the queue, we can create a consumer application to dequeue messages from the Azure Service Bus Queue. This time we'll create an ASP.NET MVC application.

```bash
dotnet new mvc -n DaprExample.Consumer
```

Once again, we'll add the ``Dapr.Client`` NuGet package to our project.

```bash
dotnet add package Dapr.Client
```

Now we can write the code for the consumer application. The logic will once again be very simple, mainly to demonstrate the binding capabilities of dapr.

> **Note:** There is an important difference to note when using input bindings. They listen on a specific endpoint for messages from the dapr side car.
>
> Consider an input binding called ``azurebusnosecrets`` (i.e. that's the name of the ``spec.name`` in your component configuration file). Your application will need to be listening for ``POST`` messages on an endpoint with that same name. Therefore, your application needs to be listening for HTTP POST requests on ``/azurebusnosecrets``.

As I opted to create an ASP.NET MVC application, I can create a new controller that listens for ``POST`` requests on the ``/azurebusnosecrets`` path.

```csharp
[HttpPost("/azurebusnosecrets")]
public ActionResult<string> getCheckout([FromBody] int orderId)
{
    _logger.LogInformation("Received Message: " + orderId);
    return Ok("CID" + orderId);
}
```

Assuming that you are re-using the component definitions that you have already configured (i.e. using them from your dapr components folder, rather than passing in a subfolder into your ``dapr run`` command) - you should see that the application will log the received messages to the console.

> **Note:** Did you notice that the application is returning a 200 OK response? This is how our application sends the acknowledgement back to the dapr sidecar, so that the message can be appropriately handled on the queue.

At this point, you should be able to use the Azure Portal and see that the messages are being drained from the Azure Service Bus Queue. I will leave this as a follow-up exercise for you to complete.

## Transitioning from the Azure Storage Bus Queue Component to the Azure Storage Queue Component

To seamlessly interact with the Azure Storage Queue, we'll need to create a component that has the same name as the one we had configured previously (i.e. ``azurebusnosecrets``).

> **Note:** This is a good point to highlight the importance of naming conventions for your components!

In a real-world scenario, you *may* want to have a different name so that you can fail-back to your original component if there is a problem. Don't forget that you would then need to update the application accordingly for deployment/rollback. This requires a large amount of thought, particularly for applications that rely upon some kind of queue (e.g. how do you deicde on the appropriate application migration strategy to drain the messages, and transition across).

Further details are available in the [Dapr documentation](https://docs.dapr.io/reference/components-reference/supported-bindings/storagequeues/).

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azurebusnosecrets
  namespace: default
spec:
  type: bindings.azure.storagequeues
  version: v1
  metadata:
  - name: storageAccount
    value: "cloudwithchrisfakestg"
  - name: storageAccessKey
    value: "notarealstorageaccountkey
  - name: queue
    value: "notarealqueue"
  - name: ttlInSeconds
    value: "60"
  - name: decodeBase64
    value: "false"
```

To update your components locally, simply stop the currently running application. Ensure that your application is pointing to the appropriate dapr input binding component, and then run ``dapr run`` again.

## Summary

And that's it! You've just created your first local application using dapr. In fact, it's probably fair to say that you've created two applications! A producer and a consumer, both using the dapr sidecar to interact with some kind of queue.

So what's next? Well, you can start building additional microservices, and deploying them to your local dapr environment. Or, you could continue exploring additional bindings (e.g. AWS SQS, GCP Cloud Pub/Sub, RabbitMQ, etc.). I'd encourage you to also investigate adopting additional components (e.g. the state store, configuration store components, etc.) into your application.

> **Note:** As an additional homework, consider updating the consumer application to write the output of your message to a state store. Let me know in the comments how you get on!

Since I started writing this post, I've begun building a few more microservices for a side project, and I'm hoping to continue to do so. I'll create an additional blog post to explore these further, including some learnings that I've had around debugging and troubleshooting dapr applications by using Visual Studio Code.

Any thoughts? I'd love to hear from you! Drop a note into the comment below, and I'll be sure to get back to you! Until the next time... Bye for now!
