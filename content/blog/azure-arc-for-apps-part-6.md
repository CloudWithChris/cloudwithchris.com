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

Mention something about having to recreate my cluster mid-way through writing the blog post

![TBC](/img/blog/azure-arc-for-apps-part-6/azure-arc-event-grid-create-topic-complete.png)


Let's explore what CRDs are within the Kubernetes Cluster...

```bash
kubectl get crd
NAME                                                   CREATED AT
approutes.k8se.microsoft.com                           2021-06-10T13:13:06Z
apps.k8se.microsoft.com                                2021-06-10T13:13:06Z
azureclusteridentityrequests.clusterconfig.azure.com   2021-06-10T13:02:55Z
azureextensionidentities.clusterconfig.azure.com       2021-06-10T13:02:55Z
bgpconfigurations.crd.projectcalico.org                2021-06-10T12:41:00Z
bgppeers.crd.projectcalico.org                         2021-06-10T12:41:00Z
blockaffinities.crd.projectcalico.org                  2021-06-10T12:41:00Z
clusterinformations.crd.projectcalico.org              2021-06-10T12:41:00Z
clustertriggerauthentications.keda.sh                  2021-06-10T13:13:07Z
components.dapr.io                                     2021-06-10T13:13:06Z
configurations.dapr.io                                 2021-06-10T13:13:06Z
connectedclusters.arc.azure.com                        2021-06-10T13:02:55Z
customlocationsettings.clusterconfig.azure.com         2021-06-10T13:02:55Z
eventsubscriptions.eventgrid.microsoft.com             2021-06-10T13:51:11Z
extensionconfigs.clusterconfig.azure.com               2021-06-10T13:02:55Z
felixconfigurations.crd.projectcalico.org              2021-06-10T12:41:00Z
gitconfigs.clusterconfig.azure.com                     2021-06-10T13:02:55Z
globalnetworkpolicies.crd.projectcalico.org            2021-06-10T12:41:00Z
globalnetworksets.crd.projectcalico.org                2021-06-10T12:41:00Z
healthstates.azmon.container.insights                  2021-06-10T12:40:58Z
hostendpoints.crd.projectcalico.org                    2021-06-10T12:41:00Z
imagesets.operator.tigera.io                           2021-06-10T12:41:00Z
installations.operator.tigera.io                       2021-06-10T12:41:00Z
ipamblocks.crd.projectcalico.org                       2021-06-10T12:41:00Z
ipamconfigs.crd.projectcalico.org                      2021-06-10T12:41:00Z
ipamhandles.crd.projectcalico.org                      2021-06-10T12:41:00Z
ippools.crd.projectcalico.org                          2021-06-10T12:41:00Z
kubecontrollersconfigurations.crd.projectcalico.org    2021-06-10T12:41:00Z
networkpolicies.crd.projectcalico.org                  2021-06-10T12:41:00Z
networksets.crd.projectcalico.org                      2021-06-10T12:41:00Z
placeholdertemplates.k8se.microsoft.com                2021-06-10T13:13:07Z
scaledjobs.keda.sh                                     2021-06-10T13:13:07Z
scaledobjects.keda.sh                                  2021-06-10T13:13:07Z
subscriptions.dapr.io                                  2021-06-10T13:13:06Z
tigerastatuses.operator.tigera.io                      2021-06-10T12:41:00Z
topics.eventgrid.microsoft.com                         2021-06-10T13:51:11Z
triggerauthentications.keda.sh                         2021-06-10T13:13:07Z
virtualapps.k8se.microsoft.com                         2021-06-10T13:13:07Z
volumesnapshotclasses.snapshot.storage.k8s.io          2021-06-10T12:40:58Z
volumesnapshotcontents.snapshot.storage.k8s.io         2021-06-10T12:40:58Z
volumesnapshots.snapshot.storage.k8s.io                2021-06-10T12:40:58Z
workerapps.k8se.microsoft.com                          2021-06-10T13:13:07Z
```

Okay, let's see the topics created...

```bash
kubectl get topics.eventgrid.microsoft.com --all-namespaces
NAMESPACE   NAME                      TOPICENDPOINT                                                                                           PROVISIONINGSTATE   FAILUREREASON   OPERATIONID
eventgrid   sample-arc-aks-eg-topic   http://eventgrid.eventgrid-system:80/topics/sample-arc-aks-eg-topic/api/events?api-version=2018-01-01   Succeeded                           109A0C70-B159-4202-BF8E-2451025CC320
```

Right, now we understand that, let's go and create some subscriptions!s

![TBC](/img/blog/azure-arc-for-apps-part-6/azure-arc-event-grid-create-subscription1.png)

![TBC](/img/blog/azure-arc-for-apps-part-6/azure-arc-event-grid-create-subscription-event-handler.png)

At this point, call out that I've created a Service Bus queue for the purposes of the blog post. Though you could use a webhook, or something similar. I don't have one deployed locally, so I'll just use a Service Bus.

![TBC](/img/blog/azure-arc-for-apps-part-6/service-bus-queue.png)


![TBC](/img/blog/azure-arc-for-apps-part-6/azure-arc-event-grid-create-subscription-event-handler2.png)
```bash
kubectl get eventsubscriptions.eventgrid.microsoft.com --all-namespaces
NAMESPACE   NAME                             PROVISIONINGSTATE   FAILUREREASON   OPERATIONID
eventgrid   sample-arc-aks-eg-subscription   Succeeded                           568FB02F-7BC5-4002-85BA-506378CB59AF
```


![TBC](/img/blog/azure-arc-for-apps-part-6/service-bus-no-messages.png)


## Sending to Event Grid


```bash
az eventgrid topic show --name sample-arc-aks-eg-topic -g rb-arc-rg --query "endpoint" --output tsv
http://eventgrid.eventgrid-system:80/topics/sample-arc-aks-eg-topic/api/events?api-version=2018-01-01
```



```bash
az eventgrid topic key list --name sample-arc-aks-eg-topic -g rb-arc-rg --query "key1" --output tsv
```


**ADD EMPTY BUS SCREENSHOT HERE**

Now, note the IP endpoint for the event grid is private...

Now let's try again...

```bash
kubectl run curl --image=curlimages/curl --restart=Never -it --rm -- /bin/sh

curl  -k -X POST -H "Content-Type: application/cloudevents-batch+json" -H "aeg-sas-key: <EnterYourKey>" -g <EnterYourURL> \
-d  '[{ 
      "specversion": "1.0",
      "type": "blogPublished",
      "source": "CloudWithChris/content",
      "id": "eventId-n",
      "time": "2020-12-25T20:54:07+00:00",
      "subject": "blog/azure-arc-for-apps-part-6",
      "dataSchema": "1.0",
      "data" : {
         "mediumUrl": "https://cloudwithchris.medium.com",
         "devtoUrl": "https://dev.to/cloudwithchris"
      }
}]'
```

Ah, but look. The type of the event being sent is blogPublished. We didn't have that in the filter to eventtypes list. let's change that.

![TBC](/img/blog/azure-arc-for-apps-part-6/azure-arc-event-grid-subscription-update.jpg)


```bash
kubectl run curl --image=curlimages/curl --restart=Never -it --rm -- /bin/sh

curl  -k -X POST -H "Content-Type: application/cloudevents-batch+json" -H "aeg-sas-key: <EnterYourKey>" -g <EnterYourURL> \
-d  '[{ 
      "specversion": "1.0",
      "type": "blogPublished",
      "source": "CloudWithChris/content",
      "id": "eventId-n",
      "time": "2020-12-25T20:54:07+00:00",
      "subject": "blog/azure-arc-for-apps-part-6",
      "dataSchema": "1.0",
      "data" : {
         "mediumUrl": "https://cloudwithchris.medium.com",
         "devtoUrl": "https://dev.to/cloudwithchris"
      }
}]'
```

Great, the event sent once again. Let's see if the subscription picked up the event this time.

![TBC](/img/blog/azure-arc-for-apps-part-6/service-bus-1-message.png)

![TBC](/img/blog/azure-arc-for-apps-part-6/service-bus-peak-message.png)

```bash
kubectl describe eventsubscriptions.eventgrid.microsoft.com sample-arc-aks-eg-subscription -n eventgrid
Name:         sample-arc-aks-eg-subscription
Namespace:    eventgrid
Labels:       eventgrid.microsoft.com/Topic=sample-arc-aks-eg-topic
Annotations:  eventgrid.microsoft.com/activityId: 85e44ef7-e688-4545-9127-0e42fbcaeb29
              eventgrid.microsoft.com/operationId: FE5AB17C-AE80-412D-9E7D-E0AB9208106E
API Version:  eventgrid.microsoft.com/v1alpha1
Kind:         EventSubscription
Metadata:
  Creation Timestamp:  2021-06-10T14:15:07Z
  Finalizers:
    eventsubscription.finalizer
  Generation:  4
  Managed Fields:
    API Version:  eventgrid.microsoft.com/v1alpha1
    Fields Type:  FieldsV1
    fieldsV1:
      f:metadata:
        f:finalizers:
          .:
          v:"eventsubscription.finalizer":
        f:labels:
          .:
          f:eventgrid.microsoft.com/Topic:
        f:ownerReferences:
          .:
          k:{"uid":"3ece6103-c1fe-4844-86f4-2301e644bd1a"}:
            .:
            f:apiVersion:
            f:kind:
            f:name:
            f:uid:
      f:spec:
        f:properties:
          f:persistencePolicy:
      f:status:
        .:
        f:operationId:
        f:provisioningState:
    Manager:      manager
    Operation:    Update
    Time:         2021-06-10T14:30:49Z
    API Version:  eventgrid.microsoft.com/v1alpha1
    Fields Type:  FieldsV1
    fieldsV1:
      f:metadata:
        f:annotations:
          .:
          f:eventgrid.microsoft.com/activityId:
          f:eventgrid.microsoft.com/operationId:
      f:spec:
        .:
        f:properties:
          .:
          f:destination:
            .:
            f:endpointType:
            f:properties:
              .:
              f:connectionString:
          f:eventDeliverySchema:
          f:filter:
            .:
            f:includedEventTypes:
            f:isSubjectCaseSensitive:
          f:retryPolicy:
            .:
            f:eventExpiryInMinutes:
            f:maxDeliveryAttempts:
          f:topic:
    Manager:    unknown
    Operation:  Update
    Time:       2021-06-10T14:30:49Z
  Owner References:
    API Version:     eventgrid.microsoft.com/v1alpha1
    Kind:            Topic
    Name:            sample-arc-aks-eg-topic
    UID:             3ece6103-c1fe-4844-86f4-2301e644bd1a
  Resource Version:  37787
  UID:               ed3baa7c-2530-4b54-a7a0-f1e37e106f4d
Spec:
  Properties:
    Destination:
      Endpoint Type:  ServiceBusQueue
      Properties:
        Connection String:  Endpoint=sb://cloudwithchris.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=Tb0qPnSHY/2iwq9KZeqbTE7oCJae9fIpcoV4r67oF4Q=;EntityPath=eg-aks
    Event Delivery Schema:  CloudEventSchemaV1_0
    Filter:
      Included Event Types:
        myevent
        myotherevent
        blogPublished
      Is Subject Case Sensitive:  false
    Persistence Policy:
    Retry Policy:
      Event Expiry In Minutes:  1440
      Max Delivery Attempts:    30
    Topic:                      sample-arc-aks-eg-topic
Status:
  Operation Id:        FE5AB17C-AE80-412D-9E7D-E0AB9208106E
  Provisioning State:  Succeeded
Events:                <none>
```









```bash
kubectl logs eventgrid-broker-6fff87f477-cdktx -n eventgrid-system
2021-06-10 13:51:53.087+00:00:[INF] - [EventGridCoreHost:.ctor@55] 
****************************************************************************************************************************
|  _______                                   __________                      _____       _________        _____ _________  |
|  ___    |__________  _______________       ___  ____/___   _______ _______ __  /_      __  ____/___________(_)______  /  |
|  __  /| |___  /_  / / /__  ___/_  _ \      __  __/   __ | / /_  _ \__  __ \_  __/      _  / __  __  ___/__  / _  __  /   |
|  _  ___ |__  /_/ /_/ / _  /    /  __/      _  /___   __ |/ / /  __/_  / / // /_        / /_/ /  _  /    _  /  / /_/ /    |
|  /_/  |_|_____/\__,_/  /_/     \___/       /_____/   _____/  \___/ /_/ /_/ \__/        \____/   /_/     /_/   \__,_/     |
|                                                                                                                          |
****************************************************************************************************************************
2021-06-10 13:51:53.430+00:00:[INF] - [BaseEnvironment:SetupInboundServerAuthAsync@109] Starting. inbound:serverAuth={
  "tlsPolicy": "Disabled",
  "serverCert": {
    "source": "File",
    "certFile": "",
    "keyFile": "",
    "caFile": ""
  }
}
2021-06-10 13:51:53.430+00:00:[INF] - [BaseEnvironment:SetupInboundServerAuthAsync@114] Completed. inbound:serverAuth:tlsPolicy=disabled, nothing more to do.
2021-06-10 13:51:53.435+00:00:[INF] - [BaseEnvironment:SetupInboundClientAuthAsync@186] Starting. inbound:clientAuth={
  "sasKeys": {
    "enabled": false,
    "key1": "<redacted>",
    "key2": "<redacted>"
  },
  "clientCert": {
    "enabled": false,
    "source": "File",
    "caFile": "",
    "allowUnknownCA": false
  }
}
2021-06-10 13:51:53.435+00:00:[INF] - [BaseEnvironment:SetupInboundClientAuthAsync@204] Completed. inbound:clientAuth:clientCert:enabled=false, nothing more to do.
2021-06-10 13:51:53.437+00:00:[INF] - [BaseEnvironment:SetupOutboundClientAuthAsync@246] Starting. outbound:clientAuth={
  "clientCert": {
    "enabled": false,
    "source": "File",
    "allowUnknownCA": false
  }
}
2021-06-10 13:51:53.437+00:00:[INF] - [BaseEnvironment:SetupOutboundClientAuthAsync@251] Completed. outbound:clientAuth:clientCert:enabled=false, nothing more to do.
2021-06-10 13:51:53.439+00:00:[INF] - [BaseEnvironment:SetupOutboundDestinationConfiguration@274] outbound:webhook={
  "httpsOnly": false,
  "skipServerCertValidation": false,
  "allowUnknownCA": false,
  "skipEventGridUrlValidation": true
}
2021-06-10 13:51:53.440+00:00:[INF] - [BaseEnvironment:SetupOutboundDestinationConfiguration@275] outbound:eventgrid={
  "httpsOnly": false,
  "allowInvalidHostnames": true
}
2021-06-10 13:51:53.451+00:00:[INF] - [Metric:Initialize@43] MetricOptions: {
  "reporterType": "Prometheus",
  "reportingIntervalInSeconds": 60,
  "context": "",
  "telegraf": {
    "telegrafUdpAddress": "",
    "telegrafUdpPort": 0,
    "failuresBeforeBackoff": 5,
    "timeoutInSeconds": 30,
    "backoffPeriodInSeconds": 5
  },
  "prometheus": {
    "environmentInfoEndpointEnabled": false,
    "metricsEndpointEnabled": true,
    "metricsTextEndpointEnabled": false
  },
  "azureMonitor": {
    "instrumentationKey": ""
  }
}
2021-06-10 13:51:55.224+00:00:[INF] - [RocksDbFactory:GetOrCreateRocksDbInstance@44] Opened rocksDB database at path 'metadataDb/' with columnFamilies 'default'.
2021-06-10 13:51:55.986+00:00:[INF] - [ApiBuilder:GetHostBuilder@47] ApiOptions: {
  "maxTopicNameLength": 128,
  "maxContentLengthInBytes": 1058576,
  "logLevel": "Information",
  "requestTimeoutInSeconds": 30,
  "httpPort": 5888,
  "httpsPort": 4438,
  "retryPolicyLimits": {
    "minExpirationTimeInMinutes": 1,
    "maxExpirationTimeInMinutes": 1440,
    "maxDeliveryAttempts": 30
  },
  "deliveryPolicyLimits": {
    "maxPreferredBatchSizeInKilobytes": 1033,
    "maxEventsPerBatch": 50
  },
  "health": {
    "httpProbe": {
      "enabled": true
    }
  }
}
2021-06-10 13:51:55.986+00:00:[INF] - [ApiBuilder:GetHostBuilder@50] KestrelUrls: http://*:5888
2021-06-10 13:51:56.005+00:00:[INF] - [EventGridBrokerBuilder:Build@81] BrokerOptions: {
  "startTimeoutInSeconds": 120,
  "stopTimeoutInSeconds": 120,
  "maxReadBatchSize": 200,
  "maxConcurrentDeliveries": 100,
  "logLevel": "Information",
  "logDeliverySuccess": false,
  "logDeliveryFailure": true,
  "logEventExpiry": true,
  "deliverTimeoutInSeconds": 60,
  "defaultMaxDeliveryAttempts": 30,
  "defaultEventTimeToLiveInSeconds": 7200,
  "defaultMaxBatchSizeInBytes": 1058576,
  "defaultMaxEventsPerBatch": 10,
  "maxSubscriptionCacheStalenessInSeconds": 3,
  "backoffIntervals": [
    "00:01:00",
    "00:10:00"
  ],
  "defaultIsPersisted": true,
  "backoffIsPersisted": true,
  "commitDelayInMs": 1,
  "stopDispatchers": false
}
2021-06-10 13:51:56.131+00:00:[INF] - [FasterEventLogFactory:.ctor@40] FasterOptions: {
  "eventLogBasePath": "eventsDb",
  "pageSizeBits": 22,
  "memorySizeBits": 25,
  "segmentSizeBits": 26,
  "enablePerEntryChecksums": true,
  "disposalDelayInSeconds": 60,
  "pendingCheckpointMaxCount": 131072,
  "maxInflightWrites": 0,
  "checkpointCoalesceWaitIntervalInMilliseconds": 100
}
2021-06-10 13:51:56.243+00:00:[INF] - [EventGridDesiredConfigProcessor:GetDesiredConfigAsync@32] GetDesiredConfigAsync check if there's any default configuration specified.
2021-06-10 13:51:56.244+00:00:[INF] - [EventGridDesiredConfigProcessor:ReadConfigFromEnvVar@64] ReadConfigFromEnvVar checking if configuration specified in environment variable desired_config.
2021-06-10 13:51:56.244+00:00:[INF] - [EventGridDesiredConfigProcessor:ReadConfigFromEnvVar@69] ReadConfigFromEnvVar no configuration specified in environment variable desired_config.
2021-06-10 13:51:56.245+00:00:[INF] - [EventGridDesiredConfigProcessor:ReadConfigFromFileAsync@87] ReadConfigFromFileAsync checking if configuration specified in environment variable desired_config_file.
2021-06-10 13:51:56.245+00:00:[INF] - [EventGridDesiredConfigProcessor:ReadConfigFromFileAsync@92] ReadConfigFromFileAsync no file specified in environment variable desired_config_file.
2021-06-10 13:51:56.249+00:00:[INF] - [EventGridBroker:Broker:OpenAsync:Starting] 
2021-06-10 13:51:56.260+00:00:[INF] - [ServiceObjectManager(EventGridBroker):Broker:OpenAsync:Starting] 
2021-06-10 13:51:56.264+00:00:[INF] - [MetadataCache:Broker:OpenAsync:Starting] 
2021-06-10 13:51:56.269+00:00:[INF] - [EventLogManager:Broker:OpenAsync:Starting] 
2021-06-10 13:51:56.269+00:00:[INF] - [SharedBackoffManager:Broker:OpenAsync:Starting] 
2021-06-10 13:51:56.339+00:00:[INF] - [FasterEventLogFactory:Faster:CreateAsync:Succeeded] Created event log with id=__BACKOFF_1_1MINS metadata={"EventLogBasePath":"eventsDb","PageSizeBits":22,"MemorySizeBits":25,"SegmentSizeBits":26,"EnablePerEntryChecksums":true,"DisposalDelayInSeconds":60,"PendingCheckpointMaxCount":131072,"MaxInflightWrites":0,"CheckpointCoalesceWaitIntervalInMilliseconds":100}.
2021-06-10 13:51:56.350+00:00:[INF] - [FasterEventLogFactory:Faster:CreateAsync:Succeeded] Created event log with id=__BACKOFF_2_10MINS metadata={"EventLogBasePath":"eventsDb","PageSizeBits":22,"MemorySizeBits":25,"SegmentSizeBits":26,"EnablePerEntryChecksums":true,"DisposalDelayInSeconds":60,"PendingCheckpointMaxCount":131072,"MaxInflightWrites":0,"CheckpointCoalesceWaitIntervalInMilliseconds":100}.
2021-06-10 13:51:56.350+00:00:[INF] - [ServiceObjectManager(SharedBackoffManager):Broker:OpenAsync:Starting] 
2021-06-10 13:51:56.350+00:00:[INF] - [FasterEventLog(__BACKOFF_1_1MINS):Faster:OpenAsync:Starting] 
2021-06-10 13:51:56.408+00:00:[INF] - [ServiceObjectManager(FasterEventLog(__BACKOFF_1_1MINS)):Faster:OpenAsync:Starting] 
2021-06-10 13:51:56.408+00:00:[INF] - [FasterEventLogCheckpointer(__BACKOFF_1_1MINS):Faster:OpenAsync:Starting] 
2021-06-10 13:51:56.408+00:00:[INF] - [FasterEventLogReader(__BACKOFF_1_1MINS):Faster:OpenAsync:Starting] 
2021-06-10 13:51:56.410+00:00:[INF] - [FasterEventLogWriter(__BACKOFF_1_1MINS):Faster:OpenAsync:Starting] 
2021-06-10 13:51:56.410+00:00:[INF] - [CheckpointWorker<OutputEvent>:Delivery:OpenAsync:Starting] 
2021-06-10 13:51:56.410+00:00:[INF] - [SharedBackoffDispatcher-00:01:00:Broker:OpenAsync:Starting] 
2021-06-10 13:51:56.411+00:00:[INF] - [FasterEventLog(__BACKOFF_2_10MINS):Faster:OpenAsync:Starting] 
2021-06-10 13:51:56.442+00:00:[INF] - [ServiceObjectManager(FasterEventLog(__BACKOFF_2_10MINS)):Faster:OpenAsync:Starting] 
2021-06-10 13:51:56.442+00:00:[INF] - [FasterEventLogCheckpointer(__BACKOFF_2_10MINS):Faster:OpenAsync:Starting] 
2021-06-10 13:51:56.442+00:00:[INF] - [FasterEventLogReader(__BACKOFF_2_10MINS):Faster:OpenAsync:Starting] 
2021-06-10 13:51:56.442+00:00:[INF] - [FasterEventLogWriter(__BACKOFF_2_10MINS):Faster:OpenAsync:Starting] 
2021-06-10 13:51:56.442+00:00:[INF] - [CheckpointWorker<OutputEvent>:Delivery:OpenAsync:Starting] 
2021-06-10 13:51:56.442+00:00:[INF] - [SharedBackoffDispatcher-00:10:00:Broker:OpenAsync:Starting] 
2021-06-10 13:51:56.443+00:00:[INF] - [SharedBackoffManager:Broker:OnOpenAsync:Succeeded] Started shared backoff queue(s) for intervals:00:01:00,00:10:00
2021-06-10 13:51:56.443+00:00:[INF] - [DedicatedQueueManager:Broker:OpenAsync:Starting] 
2021-06-10 13:51:56.448+00:00:[INF] - [SharedBackoffDispatcher-00:01:00:Broker:OnRunAsync:InProgress] Starting, now that dedicated queues have been setup.
2021-06-10 13:51:56.454+00:00:[INF] - [SharedBackoffDispatcher-00:10:00:Broker:OnRunAsync:InProgress] Starting, now that dedicated queues have been setup.
2021-06-10 13:51:56.454+00:00:[INF] - [MetadataChangeListener:Broker:OpenAsync:Starting] 
warn: Microsoft.AspNetCore.DataProtection.Repositories.FileSystemXmlRepository[60]
      Storing keys in a directory '/root/.aspnet/DataProtection-Keys' that may not be persisted outside of the container. Protected data will be unavailable when container is destroyed.
warn: Microsoft.AspNetCore.DataProtection.KeyManagement.XmlKeyManager[35]
      No XML encryptor configured. Key {5475ef00-481b-432b-bd83-f7954e5aa761} may be persisted to storage in unencrypted form.
2021-06-10 13:56:28.988+00:00:[INF] - [TopicsApiService:Management:PutAsync:Starting] Creating topic with TopicName: sample-arc-aks-eg-topic
2021-06-10 13:56:29.424+00:00:[INF] - [TopicsApiService:Management:PutAsync:Succeeded] Created topic with TopicName: sample-arc-aks-eg-topic
2021-06-10 14:15:07.900+00:00:[INF] - [EventSubscriptionsApiService:Management:PutAsync:Starting] Putting eventSubscription with Name: sample-arc-aks-eg-subscription
2021-06-10 14:15:07.986+00:00:[INF] - [FasterEventLogFactory:Faster:CreateAsync:Succeeded] Created event log with id=SAMPLE-ARC-AKS-EG-SUBSCRIPTION-C9B6020D030A43BFAC785A3ECDB46B62 metadata={"EventLogBasePath":"eventsDb","PageSizeBits":22,"MemorySizeBits":25,"SegmentSizeBits":26,"EnablePerEntryChecksums":true,"DisposalDelayInSeconds":60,"PendingCheckpointMaxCount":131072,"MaxInflightWrites":0,"CheckpointCoalesceWaitIntervalInMilliseconds":100}.
2021-06-10 14:15:08.014+00:00:[INF] - [ServiceObjectManager(DedicatedQueue SubId=SAMPLE-ARC-AKS-EG-SUBSCRIPTION-C9B6020D030A43BFAC785A3ECDB46B62):Broker:OpenAsync:Starting] 
2021-06-10 14:15:08.014+00:00:[INF] - [FasterEventLog(SAMPLE-ARC-AKS-EG-SUBSCRIPTION-C9B6020D030A43BFAC785A3ECDB46B62):Faster:OpenAsync:Starting] 
2021-06-10 14:15:08.048+00:00:[INF] - [ServiceObjectManager(FasterEventLog(SAMPLE-ARC-AKS-EG-SUBSCRIPTION-C9B6020D030A43BFAC785A3ECDB46B62)):Faster:OpenAsync:Starting] 
2021-06-10 14:15:08.048+00:00:[INF] - [FasterEventLogCheckpointer(SAMPLE-ARC-AKS-EG-SUBSCRIPTION-C9B6020D030A43BFAC785A3ECDB46B62):Faster:OpenAsync:Starting] 
2021-06-10 14:15:08.048+00:00:[INF] - [FasterEventLogReader(SAMPLE-ARC-AKS-EG-SUBSCRIPTION-C9B6020D030A43BFAC785A3ECDB46B62):Faster:OpenAsync:Starting] 
2021-06-10 14:15:08.048+00:00:[INF] - [FasterEventLogWriter(SAMPLE-ARC-AKS-EG-SUBSCRIPTION-C9B6020D030A43BFAC785A3ECDB46B62):Faster:OpenAsync:Starting] 
2021-06-10 14:15:08.048+00:00:[INF] - [CheckpointWorker<OutputEvent>:Delivery:OpenAsync:Starting] 
2021-06-10 14:15:08.048+00:00:[INF] - [SharedPostponeWorker:Delivery:OpenAsync:Starting] 
2021-06-10 14:15:08.048+00:00:[INF] - [DeliveryAgent:Delivery:OpenAsync:Starting] 
2021-06-10 14:15:08.048+00:00:[INF] - [DedicatedQueueDispatcher (SubscriptionId=SAMPLE-ARC-AKS-EG-SUBSCRIPTION-C9B6020D030A43BFAC785A3ECDB46B62):Delivery:OpenAsync:Starting] 
2021-06-10 14:15:08.049+00:00:[INF] - [DedicatedQueueManager:Broker:CreateIfNotExistsAsync:Succeeded] Started dedicated dispatcher for topicId=SAMPLE-ARC-AKS-EG-TOPIC-BEDA9774F38E45128E2B46C65453CF69 subscriptionId=SAMPLE-ARC-AKS-EG-SUBSCRIPTION-C9B6020D030A43BFAC785A3ECDB46B62 with persistenceMode=Disk.
2021-06-10 14:15:08.053+00:00:[INF] - [EventSubscriptionsApiService:Management:PutAsync:Succeeded] Created eventSubscription with Name: sample-arc-aks-eg-subscription
2021-06-10 14:15:08.103+00:00:[INF] - [EventSubscriptionsApiService:Management:PutAsync:Starting] Putting eventSubscription with Name: sample-arc-aks-eg-subscription
2021-06-10 14:15:08.154+00:00:[INF] - [EventSubscriptionsApiService:Management:PutAsync:Succeeded] Created eventSubscription with Name: sample-arc-aks-eg-subscription
```