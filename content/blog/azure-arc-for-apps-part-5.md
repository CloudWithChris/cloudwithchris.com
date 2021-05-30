---
Author: chrisreddington
Description: ""
PublishDate: "2021-06-02T08:04:00Z"
image: img/cloudwithchrislogo.png
date: "2021-06-02T08:04:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Technology
- DevOps
- Git
- Security
- How To
title: Using Azure Arc for Apps - Part 5
---
![Screenshot showing the Azure Arc Extensions installed so far (Which displays the Application Services Extension)](/img/blog/azure-arc-for-apps-part-5/arc-extensions.jpg)


![Screenshot showing the available extensions to install onto an Azure Arc managed cluster](/img/blog/azure-arc-for-apps-part-5/arc-extensions-options.jpg)

![Screenshot showing the Event Grid on Kubernetes Extension creation experience in the Azure Portal](/img/blog/azure-arc-for-apps-part-5/azure-arc-event-grid-creation.jpg)

As from ... https://docs.microsoft.com/en-gb/azure/event-grid/kubernetes/install-k8s-extension?WT.mc_id=Portal-Microsoft_Azure_EventGrid#install-event-grid-on-kubernetes-extension

The Basics tab of the Install Event Grid page, follow these steps.

The Project Details section shows read-only subscription and resource group values because Azure Arc extensions are deployed under the same Azure subscription and resource group of the connected cluster on which they're installed.

Provide a name in the Event Grid extension name field. This name should be unique among other Azure Arc extensions deployed to the same Azure Arc connected cluster.

For Release namespace, you may want to provide the name of a Kubernetes namespace where Event Grid components will be deployed into. For example, you might want to have a single namespace for all Azure Arc-enabled services deployed to your cluster. The default is eventgrid-system. If the namespace provided doesn't exist, it's created for you.

On the Event Grid broker details section, the service type is shown. The Event Grid broker, which is the component that exposes the topic endpoints to which events are sent, is exposed as a Kubernetes service type ClusterIP. Hence, the IPs assigned to all topics use the private IP space configured for the cluster.

Provide the storage class name that you want to use for the broker and that's supported by your Kubernetes distribution. For example, if you're using AKS, you could use azurefile, which uses Azure Standard storage. For more information on predefined storage classes supported by AKS, see Storage Classes in AKS. If you're using other Kubernetes distributions, see your Kubernetes distribution documentation for predefined storage classes supported or the way you can provide your own.

Storage size. Default is 1 GiB. Consider the ingestion rate when determining the size of your storage. Ingestion rate in MiB/second measured as the size of your events times the publishing rate (events per second) across all topics on the Event Grid broker is a key factor when allocating storage. Events are transient in nature and once they're delivered, there is no storage consumption for those events. While ingestion rate is a main driver for storage use, it isn't the only one. Metadata holding topic and event subscription configuration also consumes storage space, but that normally requires a lower amount of storage space than the events ingested and being delivered by Event Grid.

Memory limit. Default is 1 GiB.

Memory request. Default is 200 MiB. This field isn't editable.

![Screenshot showing the second stage of the Event Grid on Kubernetes Extension creation experience in the Azure Portal - Configuring either HTTP or HTTPS (This shows the options for HTTPS)](/img/blog/azure-arc-for-apps-part-5/azure-arc-event-grid-creation-2-https.jpg)

![Screenshot showing the second stage of the Event Grid on Kubernetes Extension creation experience in the Azure Portal - Configuring either HTTP or HTTPS (This shows the options for HTTP)](/img/blog/azure-arc-for-apps-part-5/azure-arc-event-grid-creation-2-http.jpg)

![Screenshot showing the third stage of the Event Grid on Kubernetes Extension creation experience in the Azure Portal - Configuring monitoring)](/img/blog/azure-arc-for-apps-part-5/azure-arc-event-grid-creation-3.jpg)

![Screenshot showing the verification stage of the Event Grid on Kubernetes Extension creation experience in the Azure Portal](/img/blog/azure-arc-for-apps-part-5/azure-arc-event-grid-creation-final.jpg)

> **Tip:** The deployment completion notification came almost immediately for me. However, the docs and the portal note that this is an asynchronous operation, and you should check the status in kubernetes. For me, I executed ``kubectl get pods -n eventgrid --watch``

```bash
kubectl get pods -n eventgrid --watch
NAME                                  READY   STATUS    RESTARTS   AGE
eventgrid-broker-f59b4d5-xtbwn        1/1     Running   0          65s
eventgrid-operator-7cff4cfd7f-7kfbb   1/1     Running   0          65s
```

![Screenshot showing the Azure Arc Extensions installed once the Event Grid for Kubernetes Extension configuration has completed](/img/blog/azure-arc-for-apps-part-5/arc-extensions-after-eg-install.jpg)

If you prefer, there is an [alternative experience documented in the Azure Docs using Azure CLI](http://localhost:1313/img/blog/azure-arc-for-apps-part-5/arc-extensions-after-eg-install.jpg).

The next step is to create a custom location. If you have followed step 2 already, you'll have once in place for app service. Let's create a location specifically for event grid (given that we included appsvc in the name of the previous location. 

> **Tip:** I did wonder how we would approach this in a production situation, i.e. would we share the same location across different extensions. 
> It looks as though Namespace-scoped cluster extensions cannot be added to a custom location associated with a different namespace. This restriction does not apply to cluster-scoped extensions. (Taken directly from the Azure Portal). I also think that this makes sense... Following principals of least privilege and separation of concerns, we may want to have separate namespaces for our separate extensions. I'd still like to see this information reach the Azure Docs, though I may have missed it! 

Next up, you need to create a custom location so that you can tell Azure where any App Service deployments (e.g. Web Apps) can be routed to your cluster.

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


![Screenshot showing the Azure Portal experience to create an Event Grid Topic, showing custom locations](/img/blog/azure-arc-for-apps-part-5/azure-arc-event-grid-create-topic.jpg)

![Screenshot showing the Azure Portal experience to create an Event Grid Topic, showing event schema as CloudEvents 1.0 only](/img/blog/azure-arc-for-apps-part-5/azure-arc-event-grid-create-topic2.jpg)

> **Note:** It's interesting to see that Identity is not greyed out as an option here, unlike in App Service. For now, I'll leave this as unchecked, but may revisit in the future to determine whether this is available already.

```bash
az eventgrid topic create --name rb-arc-aks-sample-topic \
                        --resource-group $arcResourceGroupName \
                        --location "westeurope" \
                        --kind azurearc \
                        --extended-location-name /subscriptions/0d9fd97f-71f6-4b7b-adbb-3a654846e587/resourceGroups/rb-arc-rg/providers/Microsoft.ExtendedLocation/customLocations/rb-arc-aks-eg \
                        --extended-location-type customLocation \
                        --input-schema CloudEventSchemaV1_0
```