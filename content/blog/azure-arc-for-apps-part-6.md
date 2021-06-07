---
Author: chrisreddington
Description: "In part 1 of this Using Azure Arc for Apps series, we explored Azure Arc and Azure Arc enabled Kubernetes clusters. In this post, we'll be exploring Event Grid for Kubernetes. At time of writing, this approach is in public preview, so we may see certain limitations / features that are not yet available."
PublishDate: "2021-06-05T08:04:00Z"
image: img/cloudwithchrislogo.png
date: "2021-06-05T08:04:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Containers
- Developer
- Cloud Native
- Kubernetes
- Azure
- Azure Arc
series: 
- "Using Azure Arc for Apps"
title: Using Azure Arc for Apps - Part 6 - Setting up Event Grid on Kubernetes with Azure Arc
---
## Setting up Event Grid on Kubernetes with Azure Arc

In [part 1](/blog/azure-arc-for-apps-part-1) of this *Using Azure Arc for Apps* series, we explored Azure Arc and Azure Arc enabled Kubernetes clusters. In this post, we'll be exploring Event Grid for Kubernetes. At time of writing, this approach is in public preview, so we may see certain limitations / features that are not yet available.

> **Tip:** [Part 1](/blog/azure-arc-for-apps-part-1) is a pre-requisite to working through this blog post, if you plan to get hands on. As noted above, an Azure Arc enabled Kubernetes cluster is a pre-requisite in the scenario we're walking through.
>
> **Note:** Parts 2, 3, 5 and 5 are not pre-requisites to completing this blog post if you are following along and completing the series.

## What is Event Grid?

Before we talk about Event Grid on Kubernetes with Azure Arc, it's worth us understanding the idea behind Event Grid. Event Grid is an event broker and is commonly used to integrate different services in an event-driven architecture.

In the past, you may have had consumers of a services in a loop, either polling or seeking for changes and to take action. Event-driven architectures are different. Event-driven programming (sometimes known as reactive programming), allows us to react to the events as they occur. This event-driven approach can be very common in the popular microservices architecture pattern.

> **Tip:** It's important to understand the difference between a message and an event in this context. An event is a notification of a state change. Imagine this like a broadcast saying, "Hey, I just published this new file!". You don't typically have any expectations on whether anyone is listening (or what they'll do with that information). The event will contain lightweight information about what happened.
>
> Conversely, messages contain the entire payload of information. When a message is sent, typically the publisher expects the consumer to do something with that information. For example, analysing the contents of the message and saving the analysis to an end-location.

The above definition of messages/events is important, as event Grid operates using a publish / subscriber model. It has no understanding of the upstream source that is generating / sending the events.

We'll be using a few terms throughout this blog post -

* **Event publisher** - The entity that sends events to Event Grid
* **Topic** - An input channel used by an event publisher to send events to Event Grid.
* **Event subscription** - An Event Grid resource that contains settings on filtering and routing events to a destination (i.e. an event subscriber or event handler).
  * **Note:** Not all events need to be delivered to all subscribers.
* **Event subscriber** (Sometimes referred to as an **Event handler**) -  An entity that is listening to an Event Subscription for events and takes action by reacting to those events.

## Where can Events be routed (which event handlers are supported)?

The latest and greatest information will be in [The Azure Docs](https://docs.microsoft.com/en-us/azure/event-grid/kubernetes/event-handlers), so I thoroughly encourage you to go there and take a look.

At time of writing, the docs mention the following -

Through Webhooks, Event Grid supports the following destinations hosted on a Kubernetes cluster:

* Azure App Service on Kubernetes with Azure Arc.
* Azure Functions on Kubernetes with Azure Arc.
* Azure Logic Apps on Kubernetes with Azure Arc.

In addition to Webhooks, Event Grid on Kubernetes can send events to the following destinations hosted on Azure:

* Azure Event Grid using Webhooks
* Azure Functions using Webhooks only
* Azure Event Hubs using its Azure Resource Manager resource ID
* Azure Service Bus topics or queues using its Azure Resource Manager resource ID
* Azure Storage queue using its Azure Resource Manager resource ID

Once again, I encourage you to familiarise yourself with [the Azure Doc](https://docs.microsoft.com/en-us/azure/event-grid/kubernetes/event-handlers). 

* If you've previously used Azure Event Grid, you'll likely know that there are various Event Schemas that can be used. In Event Grid for Kubernetes, only the Cloud Events 1.0 schema is supported (at time of writing).
* You may also be aware that Azure Functions has an Event Grid trigger. You cannot use this trigger an Azure Function to Event Grid for Kubernetes. Instead, you'll need to use the webhook trigger.

These are two examples where there are feature differences, and worth exploring the Azure Doc for completeness.

## Installing the Event Grid on Kubernetes extension to an Azure Arc enabled Kubernetes Cluster

If you've been following the series, you will have seen that the Azure Extensions can be installed in several ways. In this post, we'll work through the Azure CLI and the Azure Portal methods.

### Installing the Event Grid on Kubernetes extension through the Azure Portal

Navigate to your Kubernetes - Azure Arc resource in the Azure Portal. On the left hand menu, select the Extensions (preview) item.

You should see a list of the extensions that are already installed on your cluster.

![Screenshot showing the Azure Arc Extensions installed so far (Which displays the Application Services Extension)](/img/blog/azure-arc-for-apps-part-6/arc-extensions.jpg)

Click the Add button, and you'll see a list of the extensions which are available for installation.

![Screenshot showing the available extensions to install onto an Azure Arc managed cluster](/img/blog/azure-arc-for-apps-part-6/arc-extensions-options.jpg)

Select the Event Grid on Kubernetes extension. You'll reach a page which looks similar to the below screenshot.

![Screenshot showing the Event Grid on Kubernetes Extension creation experience in the Azure Portal](/img/blog/azure-arc-for-apps-part-6/azure-arc-event-grid-creation.jpg)

Note the following on the **Basics** tab:

* The **Project Details** section shows read-only subscription and resource group values because Azure Arc extensions are deployed under the same Azure subscription and resource group of the connected cluster on which they're installed.
* The **Event Grid extension Name** is the name of the extension as it will be installed in your Azure Arc Cluster Resource. This must be unique across all extensions in your Azure Arc enabled Kubernetes Cluster.
* The **Release namespace** is the namespace in your Azure Arc enabled Kubernetes Cluster in which you want to deploy your Azure Event Grid resources.
* The **Service type** relates to the type of Kubernetes Service that you want to use to expose the Event Grid resources. Only ClusterIP is supported during the preview, which means we'll only be able to call that service from within the cluster, unless we expose it through an ingress point or some other means.
* The **Static IP** is used to map a custom domain for the event grid to an ingress point into the cluster. I used the Public IP address for my Azure Kubernetes Service (AKS) cluster.
* The **Storage class name** may be quite an involved explanation. But in a nutshell, this is the name of the storage class on your Kubernetes cluster that you wish to use. This will vary depending upon how you're running your cluster (e.g. Azure Kubernetes Service (AKS), Elastic Kubernetes Service (EKS), Google Kubernetes Engine (GKE) or some kind of bring your own solution). You may need to research which storage classes are available for your cluster, but this is [well-defined for AKS](https://docs.microsoft.com/en-us/azure/aks/concepts-storage#storage-classes). I'll be using ``azurefile``.
* The **Storage size in GiB** default is 1 GiB.
  * How you wish to configure this will depend. This will depend upon the number of events being ingested through Event Grid on Kubernetes, and the size of those events. This would be across all topics on the Event Grid broker. Events are transient, so once they're delivered, they do not consume any space. Also be sure to factor in any metadata associated with the events.
* The **Memory limit in GiB** default is 1 GiB.
  * This is the limit on the pod that will run. Remember that it is a recommended practice to setup Requests and Limits on your pod/deployment manifests. This limit is how much the pod will be allowed to scale up until if the space is available.
* The **Memory request** default is 200 MiB.
  * This field isn't editable. For this pod to run, Kubernetes **must** be able to allocate 200 MiB of memory.

Let's move on to the **Configuration** tab. In this section, we configure the certificates used to establish a TLS session between the Event Grid operator and an Event Grid broker. As this is a demonstration environment, I'll be ticking the box for ``Enable HTTP (not secure) communication``. However, this is something you'll want to review for a production environment.

![Screenshot showing the second stage of the Event Grid on Kubernetes Extension creation experience in the Azure Portal - Configuring either HTTP or HTTPS (This shows the options for HTTPS)](/img/blog/azure-arc-for-apps-part-6/azure-arc-event-grid-creation-2-https.jpg)

Finally, the **Monitoring** tab allows you to enable collection of metrics from the dataplane. This includes items such as the number of events that have been received, delivery success count and more. I'll be keeping this flag set as enabled.

![Screenshot showing the third stage of the Event Grid on Kubernetes Extension creation experience in the Azure Portal - Configuring monitoring)](/img/blog/azure-arc-for-apps-part-6/azure-arc-event-grid-creation-3.jpg)

At this point, we've fully configured the extension. Let's review our settings and create the extension.

![Screenshot showing the verification stage of the Event Grid on Kubernetes Extension creation experience in the Azure Portal](/img/blog/azure-arc-for-apps-part-6/azure-arc-event-grid-creation-final.jpg)

> **Tip:** The deployment completion notification came almost immediately for me. However, the docs and the portal note that this is an asynchronous operation, and you should check the status in kubernetes. For me, I executed ``kubectl get pods -n eventgrid --watch``


```bash
kubectl get po --watch -n eventgrid
NAME                                  READY   STATUS    RESTARTS   AGE
eventgrid-operator-7cff4cfd7f-hb9wm   0/1     Pending   0          0s
eventgrid-operator-7cff4cfd7f-hb9wm   0/1     Pending   0          0s
eventgrid-broker-f59b4d5-rmfxh        0/1     Pending   0          0s
eventgrid-broker-f59b4d5-rmfxh        0/1     Pending   0          0s
eventgrid-operator-7cff4cfd7f-hb9wm   0/1     ContainerCreating   0          0s
eventgrid-operator-7cff4cfd7f-hb9wm   1/1     Running             0          1s
eventgrid-broker-f59b4d5-rmfxh        0/1     Pending             0          2s
eventgrid-broker-f59b4d5-rmfxh        0/1     ContainerCreating   0          2s
eventgrid-broker-f59b4d5-rmfxh        1/1     Running             0          5s
```

I had also prepared the same from the deployment side, using `kubectl get deployment -n eventgrid --watch`

```bash
kubectl get deployment -n eventgrid --watch
NAME                 READY   UP-TO-DATE   AVAILABLE   AGE
eventgrid-operator   0/1     0            0           1s
eventgrid-operator   0/1     0            0           1s
eventgrid-broker     0/1     0            0           0s
eventgrid-broker     0/1     0            0           0s
eventgrid-operator   0/1     0            0           1s
eventgrid-operator   0/1     1            0           1s
eventgrid-broker     0/1     0            0           0s
eventgrid-broker     0/1     1            0           0s
eventgrid-operator   1/1     1            1           2s
eventgrid-broker     1/1     1            1           5s
```

Likewise, watching the service with `kubectl get svc -n eventgrid --watch` -

```bash
kubectl get svc -n eventgrid --watch
NAME        TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE
eventgrid   ClusterIP   10.0.121.237   <none>        80/TCP    0s
```

Once complete, you should see the Extension Install status change from **Pending** to **Installed**.

![Screenshot showing the Azure Arc Extensions installed once the Event Grid for Kubernetes Extension configuration has completed](/img/blog/azure-arc-for-apps-part-6/arc-extensions-after-eg-install.jpg)

### Installing the Event Grid on Kubernetes extension through the Azure CLI

If you prefer, there is an [alternative experience documented in the Azure Docs using Azure CLI](https://docs.microsoft.com/en-us/azure/event-grid/kubernetes/install-k8s-extension#install-using-azure-cli).

I personally found the Portal Experience incredibly intuitive, so didn't revisit this through the Azure CLI. I'll leave this as an exercise to follow the Azure Doc above if you prefer.

## Creating a Custom Location

Whenever we create an Azure Resource, we need to specify a location. Though, our location will not be in an Azure Region. Instead, when we create Event Grid topics, we'll want to create them on our Azure Arc enabled Kubernetes cluster instead of an Azure Region. To provide Azure with the ability to create resources on our cluster, we'll need to create a Custom Location (which is just another resource type) in Azure. This will effectively allow Azure to "route" the creation request to the appropriate location (i.e. a namespace on our cluster).

> **Tip:** I did wonder how we would approach this in a production situation, i.e. would we share the same Custom Location across different extensions.
>
> It looks as though a namespace-scoped cluster extensions cannot be added to a custom location associated with a different namespace. This restriction does not apply to cluster-scoped extensions (Taken directly from the Azure Portal). To me, this makes sense. This starts aligning us to the principal of least privilege and separation of concerns (i.e. logical separation within a Kubernetes cluster, and then assigning access on a namespace basis, as we are commonly used to in a multi-tenant Kubernetes environment.). Therefore, we may want to have separate namespaces for our separate extensions.

Right then - Let's go ahead and create a custom location.

```bash
# First make sure the custom location resource provider is registered
az extension add --upgrade --yes --name customlocation
az provider register --namespace Microsoft.ExtendedLocation --wait

# In case you're following this guide separately to part 2, redefine our needed variables. Remember that we're using a different namespace.
arcClusterName="rb-arc-aks"
arcResourceGroupName="rb-arc-rg"
customLocationName="$arcClusterName-eg" # Name of the custom location
namespace="eventgrid"
extensionName="$arcClusterName-eg"

# Find the cluster ID
connectedClusterId=$(az connectedk8s show --resource-group $arcResourceGroupName --name $arcClusterName --query id --output tsv)

# Set the extension ID
extensionId=$(az k8s-extension show \
--cluster-type connectedClusters \
--cluster-name $arcClusterName \
--resource-group $arcResourceGroupName \
--name $extensionName \
--query id \
--output tsv)

# Now create a custom location based upon that information
az customlocation create \
    --resource-group $arcResourceGroupName \
    --name $customLocationName \
    --host-resource-id $connectedClusterId \
    --namespace $namespace \
    --cluster-extension-ids $extensionId

# You should be able to see that the resource is successfully created.
customLocationId=$(az customlocation show \
    --resource-group $arcResourceGroupName \
    --name $customLocationName \
    --query id \
    --output tsv)
```
Excellent. At this point, we have bound the Custom Location resource to the Azure Arc extension and namespace that we'll want to deploy into. We can now go ahead and create an Event Grid Topic!

## Creating an Event Grid Topic on Event Grid for Kubernetes in our Azure Arc Enabled Kubernetes Cluster

We have several options to create our Event Grid Topic. We'll review the Azure Portal and the Azure CLI.

### Creating an Event Grid Topic through the Azure Portal

We'll navigate to the Azure Portal and create a new Event Grid Topic. Give your Event Grid topic a name, and select a region. Notice that the Custom Location that you created earlier is available as an option.

![Screenshot showing the Azure Portal experience to create an Event Grid Topic, showing custom locations](/img/blog/azure-arc-for-apps-part-6/azure-arc-event-grid-create-topic.jpg)

Click Next, and move on to the **Advanced** tab. Notice that the **Events Schema** and **Enable system assigned identity** options are both disabled. As noted earlier, **Cloud Event Schema v1.0** is the only supported Event Schema in Event Grid for Kubernetes. Likewise, system assigned identities are not supported in Event Grid for Kubernetes at this time.

![Screenshot showing the Azure Portal experience to create an Event Grid Topic, showing event schema as CloudEvents 1.0 only](/img/blog/azure-arc-for-apps-part-6/azure-arc-event-grid-create-topic2.jpg)

### Creating an Event Grid Topic through the Azure CLI

```bash
az eventgrid topic create --name rb-arc-aks-sample-topic \
                        --resource-group $arcResourceGroupName \
                        --location "westeurope" \
                        --kind azurearc \
                        --extended-location-name /subscriptions/0d9fd97f-71f6-4b7b-adbb-3a654846e587/resourceGroups/rb-arc-rg/providers/Microsoft.ExtendedLocation/customLocations/rb-arc-aks-eg \
                        --extended-location-type customLocation \
                        --input-schema CloudEventSchemaV1_0
```
