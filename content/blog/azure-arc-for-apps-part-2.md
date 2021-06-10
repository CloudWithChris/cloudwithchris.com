---
Author: chrisreddington
Description: "In part 1 of this Using Azure Arc for Apps series, we explored Azure Arc and Azure Arc enabled Kubernetes clusters. In this post, we'll be exploring App Services on Azure Arc. More specifically, these application services run on an Azure Arc enabled Kubernetes cluster, which is a pre-requisite for us to progress. At time of writing, this approach is in public preview, so we may see certain limitations / features that are not yet available."
PublishDate: "2021-06-01T08:01:00Z"
image: img/cloudwithchrislogo.png
date: "2021-06-01T08:01:00Z"
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
title: Using Azure Arc for Apps - Part 2 - Deploying App Services to Kubernetes
---
## App Service Kubernetes Environment

In [part 1](/blog/azure-arc-for-apps-part-1) of this *Using Azure Arc for Apps* series, we explored Azure Arc and Azure Arc enabled Kubernetes clusters. In this post, we'll be exploring App Services on Azure Arc. More specifically, these application services run on an Azure Arc enabled Kubernetes cluster, which is a pre-requisite for us to progress. At time of writing, this approach is in public preview, so we may see [certain limitations / features that are not yet available](https://docs.microsoft.com/en-gb/azure/app-service/overview-arc-integration#public-preview-limitations).

> **Tip:** [Part 1](/blog/azure-arc-for-apps-part-1) is a pre-requisite to working through this blog post, if you plan to get hands on. As noted above, an Azure Arc enabled Kubernetes cluster is a pre-requisite to deploy App Services, Azure Functions or Logic Apps to a Kubernetes cluster.
>
> It's also worth noting that when you setup App Services on Kubernetes, [you'll need to have a Public Static IP address](https://docs.microsoft.com/en-gb/azure/app-service/overview-arc-integration#public-preview-limitations) (at time of writing, though check the Azure Doc link for the latest). This is the load balancer public IP address of your Kubernetes cluster. As I don't have a Public Static IP address for my local environment, I opted for an Azure Kubernetes Service (AKS) cluster to progress with my writeup. Feel free to use a Kubernetes cluster elsewhere if you have a public IP address available for it (e.g. AWS, GCP or on-premises).
>
> Also be aware that the public preview is supported in a [handful of regions](https://docs.microsoft.com/en-gb/azure/app-service/overview-arc-integration#public-preview-limitations) (East US and West Europe at time of writing).

There are some additional considerations to be aware of before we start getting hands on. Firstly, only Linux-based apps are supported, both code and custom containers. At time of writing, Windows apps are not supported. According to the docs, all of the built-in Linux stacks are supported, though I haven't had a chance to test all of these yet.

## Pre-requisites

We'll be using the Azure CLI to create our App Service for Kubernetes environment. As this capability is currently in an early preview stage, several commands that we'll be using are not yet part of the core Azure CLI. As such, we'll need to add those extensions by using the below snippet.

```bash
az extension add --upgrade --yes --name connectedk8s
az extension add --upgrade --yes --name k8s-extension
az extension add --upgrade --yes --name customlocation
az extension remove --name appservice-kube
az extension add --yes --source "https://aka.ms/appsvc/appservice_kube-latest-py2.py3-none-any.whl"
```

> **Tip:** Notice that we're also adding an Azure CLI extension for the App Service Kubernetes environment capability. For the time being, we need to install this from the source listed above. It may be worth reviewing the [Azure Docs](https://docs.microsoft.com/en-gb/azure/app-service/manage-create-arc-environment#add-azure-cli-extensions) if this is still the latest recommendation.

As in [part 1](/blog/azure-arc-for-apps-part-1), we'll also be relying upon several Azure Resource Providers that may not be registered in our subscription yet.

> **Note:** Whenever you deploy or interact with resources, you are typically retrieving or sending information to the Azure APIs about that resource. For example, creating a Network Interface Card, or retrieving details about a Public IP resource. These APIs are commonly known as Azure Resource Providers. If you have written any Azure Resource Manager (ARM) templates, Bicep Templates or Terraform Templates, you may have noticed some of these resource provider (e.g. Microsoft.Web, Microsoft.Compute, Microsoft.Kubernetes, etc.).
>
> Before you use an Azure Resource Provider, your subscription must be registered to use it. This registration doesn't cost anything, but effectively 'enables' the functionality on your subscription. There are a number of resource providers that are configured by default, [as described here](https://docs.microsoft.com/en-us/azure/azure-resource-manager/management/azure-services-resource-providers).
>
> You can learn more about Azure Resource Providers [here](https://docs.microsoft.com/en-us/azure/azure-resource-manager/management/resource-providers-and-types).

You can register the required providers by using the snippet below. Each command has a --wait flag afterwards, so that we can be sure the provider has registered successfully.

You'll also need to make sure that you have a number of Microsoft Resource Endpoints enabled -
```bash
az provider register --namespace Microsoft.ExtendedLocation --wait
az provider register --namespace Microsoft.Web --wait
az provider register --namespace Microsoft.KubernetesConfiguration --wait
```

As we discussed in [part 1](/blog/azure-arc-for-apps-part-1), the amount of time it takes to register a Resource Provider can vary. You won't be able to progress with the following steps in the blog post until the registration is complete. As we added the --wait command above, the Azure Resource Providers should have successfully registered before you can do anything else in your terminal. However, just to be doubly sure - you can go ahead and monitor the registration of these providers by using the below:

```bash
az provider show -n Microsoft.Kubernetes -o table
az provider show -n Microsoft.KubernetesConfiguration -o table
az provider show -n Microsoft.ExtendedLocation -o table
```

With the Azure CLI extensions added and the Azure Resource Providers registered, we're now in a place to work towards a deployment of App Service on our Azure Arc enabled Kubernetes cluster. We'll be using the Azure CLI to create all of the required resources. There are a few moving parts, so it's worth us configuring some variables to make the end-to-end configuration easier and easy to follow throughout the samples as well. I've attempted to make the variables names self-documenting, but please do get in touch if there's any confusion here and I can update the sample.

## Initial Configuration

```bash
# Define several variables that will be required throughout the end-to-end sample
arcResourceGroupName="rb-arc-rg"
arcClusterName="rb-arc-aks"
aksResourceGroupName="rb-aks-rg"
aksClusterName="rb-aks"
appsvcPipName="$aksClusterName-appsvc-pip"

# The below is not needed if you are not using AKS. You will need to populate this in another way, it is effectively being used to obtain a static IP to be used by the App Service on Kubernetes deployment.
aksComponentsResourceGroupName=$(az aks show --resource-group $aksResourceGroupName --name $aksClusterName --output tsv --query nodeResourceGroup)

# Create a Public IP address to be used as the Public Static IP for our App Service Kubernetes environment. We'll assign that to a variable called staticIp.
az network public-ip create --resource-group $aksComponentsResourceGroupName --name $appsvcPipName --sku STANDARD
staticIp=$(az network public-ip show --resource-group $aksComponentsResourceGroupName --name $appsvcPipName --output tsv --query ipAddress)
```
## Creating a Log Analytics Workspace (optional)

[The documentation](https://docs.microsoft.com/en-gb/azure/app-service/manage-create-arc-environment#create-a-log-analytics-workspace) explains that creating a Log Analytics workspace is not required for an App Service Kubernetes environment. However, this is how developers can get application logs for their apps running in App Service. In my opinion, monitoring of any application is critical to successful operation, so I will be going ahead and enabling this for my environment. Feel free to skip this step if you prefer.

```bash
appsvcWorkspaceName="$arcClusterName-appsvc-logs"

az monitor log-analytics workspace create \
    --resource-group $arcResourceGroupName \
    --workspace-name $appsvcWorkspaceName

logAnalyticsWorkspaceId=$(az monitor log-analytics workspace show \
    --resource-group $arcResourceGroupName \
    --workspace-name $appsvcWorkspaceName \
    --query customerId \
    --output tsv)
logAnalyticsWorkspaceIdEnc=$(printf %s $logAnalyticsWorkspaceId | base64) # Needed for the next step
logAnalyticsKey=$(az monitor log-analytics workspace get-shared-keys \
    --resource-group $arcResourceGroupName \
    --workspace-name $appsvcWorkspaceName \
    --query primarySharedKey \
    --output tsv)
logAnalyticsKeyEncWithSpace=$(printf %s $logAnalyticsKey | base64)
logAnalyticsKeyEnc=$(echo -n "${logAnalyticsKeyEncWithSpace//[[:space:]]/}") # Needed for the next step
```

## Install the App Service Extension to your Azure Arc enabled Kubernetes cluster

This is a required step. It can be achieved through the Azure Portal if you prefer, though we will be using the Azure CLI throughout this blog post. Navigate to your Azure Arc enabled Kubernetes cluster and select Extensions from the left hand menu. From there, you should see an "Add Extensions" button. In the list of possible extensions, you should see Application services extension (preview). As I prepared to write this blog post series, I primarily followed the Azure Docs.

> **Comment:** I wanted to make sure I added the line above, as I appreciate folks learn in different ways. I actually stumbled upon the Azure Arc extensions experience in the Azure Portal when I worked through setting up Event Grid on Kubernetes.

Therefore, I used the Azure CLI to enable an instance of the App Service Extension on my Azure Arc enabled Kubernetes Cluster.

> **Important:** If you skipped the optional Log Analytics Workspace step, then you'll need to amend the snippet below. The docs note that you can remove the last three lines frmo the az k8s-extension create aspect of the script (so lines beginning with --configuration-settings "logProcessor.appLogs.... onwards").

```bash
# We'll provide a name for the Azure Arc enabled Kubernetes cluster extension that will be installed,
# as well as the namespace where we want the app service pods to be created (consider principal of 
# least privilege, and separation of concerns here, i.e. logical isolation of your namespaces) and
# the name of the App Service Kubernetes environment resource that will be created in your Resource Group,
extensionName="$arcClusterName-appsvc" # Name of the App Service extension
namespace="appservice" # Namespace in your cluster to install the extension and provision resources
kubeEnvironmentName="$arcClusterName-appsvc" # Name of the App Service Kubernetes environment resource

# Explain that this step configures the extension for Azure Arc.
az k8s-extension create \
    --resource-group $arcResourceGroupName \
    --name $extensionName \
    --cluster-type connectedClusters \
    --cluster-name $arcClusterName \
    --extension-type 'Microsoft.Web.Appservice' \
    --release-train stable \
    --auto-upgrade-minor-version true \
    --scope cluster \
    --release-namespace $namespace \
    --configuration-settings "Microsoft.CustomLocation.ServiceAccount=default" \
    --configuration-settings "appsNamespace=${namespace}" \
    --configuration-settings "clusterName=${kubeEnvironmentName}" \
    --configuration-settings "loadBalancerIp=${staticIp}" \
    --configuration-settings "keda.enabled=true" \
    --configuration-settings "buildService.storageClassName=default" \
    --configuration-settings "buildService.storageAccessMode=ReadWriteOnce" \
    --configuration-settings "customConfigMap=${namespace}/kube-environment-config" \
    --configuration-settings "envoy.annotations.service.beta.kubernetes.io/azure-load-balancer-resource-group=${aksResourceGroupName}" \
    --configuration-settings "logProcessor.appLogs.destination=log-analytics" \
    --configuration-protected-settings "logProcessor.appLogs.logAnalyticsConfig.customerId=${logAnalyticsWorkspaceIdEnc}" \
    --configuration-protected-settings "logProcessor.appLogs.logAnalyticsConfig.sharedKey=${logAnalyticsKeyEnc}"

# Now save the id property of the App Service Extension resource (created above) which is associated with your Azure Arc enabled Kubernetes Cluster. We'll need this later on, and saving it as a variable means that we can easily refer to it when we create the App Service Kubernetes Environment.
extensionId=$(az k8s-extension show \
--cluster-type connectedClusters \
--cluster-name $arcClusterName \
--resource-group $arcResourceGroupName \
--name $extensionName \
--query id \
--output tsv)

# The Azure Docs recommend waiting until the extension is fully created before proceeding with any additional steps. The below command can help with that.
az resource wait --ids $extensionId --custom "properties.installState!='Pending'" --api-version "2020-07-01-preview"

# Now when you check the pods in the namespace on your Azure Arc enabled Kubernetes cluster, you'll see the required components for your App Service "stamp" (or, deployment.. though deployment can be an overloaded term - especially in a Kubernetes concept) are running as pods.
kubectl get pods -n $namespace
```

## Create a Custom Location

Whenever we create an Azure Resource, we need to specify a location. Though, our location will not be in an Azure Region. Instead, the intent is to create App Service resources on our Azure Arc enabled Kubernetes cluster. To provide Azure with the ability to create resources on our cluster, we'll need to create a Custom Location (which is just another resource type) in Azure. This will effectively allow Azure to "route" the creation request to the appropriate location (i.e. a namespace on our cluster). In a later step, we'll associate our App Service Kubernetes environment with that custom location.


```bash
customLocationName="$arcClusterName-appsvc" # Name of the custom location

# Obtain the Azure Arc enabled Kubernetes Cluster Resource ID. We'll need this for later Azure CLI commands.
connectedClusterId=$(az connectedk8s show --resource-group $arcResourceGroupName --name $arcClusterName --query id --output tsv)

# Now create a custom location based upon the information we've been gathering over the course of this post
az customlocation create \
    --resource-group $arcResourceGroupName \
    --name $customLocationName \
    --host-resource-id $connectedClusterId \
    --namespace $namespace \
    --cluster-extension-ids $extensionId

# The above resource should be created quite quickly. We'll need the Custom Location Resource ID for a later step, so let's go 
# ahead and assign it to a variable.
customLocationId=$(az customlocation show \
    --resource-group $arcResourceGroupName \
    --name $customLocationName \
    --query id \
    --output tsv)

# Let's double check that the variable was appropriately assigned and isn't empty.
echo $customLocationId
```

## Create the App Service Kubernetes environment

Okay, you've reached the primary milestone of this post - creating the App Service Kubernetes environment! But wait, what's the difference here compared to the extension that we installed earlier?

The extension is used to install all the backend components that make App Service run in your Azure Arc enabled Kubernetes cluster. You can find a list of the deployed pods and what they do [here](https://docs.microsoft.com/en-us/azure/app-service/overview-arc-integration#pods-created-by-the-app-service-extension). You can also find a broader writeup on Azure Arc enabled Kubernetes cluster extensions [here](https://docs.microsoft.com/en-us/azure/azure-arc/kubernetes/conceptual-extensions).

Yes, we have the App Service Extension configured. However, we now need to create an **App Service Kubernetes Environment** to map -
* The **Custom Location** that we configured a few moments ago. This is associated with -
  * The App Service Extension that we configured earlier on in the post.
  * The namespace in which we want to deploy our pods as a result of any Azure Resources being created (e.g. App Service Apps, Logic Apps, Functions, etc.)
* The **Static IP** that we setup earlier on. This is used to map our App Service Kubernetes Environment custom domain to an ingress IP address (i.e. the Static IP).

So with that context and explanation, let's go ahead and create the App Service Kubernetes Environment.

```bash
  # For anyone interested, the below step is where I encountered issues when attempting to create an App Service Kubernetes Environment for
  # a local Kubernetes cluster. I believe it's due to the Static IP requirement. The command kept on 'running', though didn't seem to 
  # be doing anything. Instead, when I executed this for an Azure Kubernetes Service (AKS) environment with an accessible Public Static IP,
  # I had no issues. I'd love to hear if anyone tries this, or has any issues along the way. I'll update this as I receive further info.
  az appservice kube create \
      --resource-group $arcResourceGroupName \
      --name $kubeEnvironmentName \
      --custom-location $customLocationId \
      --static-ip $staticIp

  # Be prepared to wait. The above step took me a good few minutes to complete, so the below may not be available for some time.
  az appservice kube show \
    --resource-group $arcResourceGroupName \
    --name $kubeEnvironmentName
```

Navigate to the Azure Arc Resource Group that you created earlier. You'll notice that there a new **App Service Kubernetes Environment** resource exists. It will show that there are 0 App Service Plans, and 0 Apps/Slots deployed. It will also show the "domain name" which will act as the suffix to your App Service deployments (consider this as the replacement to azurewebsites.net).

![Screenshot showing the App Service Kubernetes environment resource in the Azure Portal](/img/blog/azure-arc-for-apps-part-2/app-service-kubernetes-environment.jpg)

## Create an App Service resource in our App Service Kubernetes Environment

Let's go ahead and create a new application in your custom location. You can do that by following the usual Azure Portal experience to create a new App Service resource. However, you may notice a couple of differences in the creation experience -

* The instance name has a suffix of the custom domain that you will have seen in the **App Service Kubernetes Environment** resource earlier.
* You can still run either Code or Docker Container based App Services.
* The Operating System option for Windows is disabled.
* The region option now has an option for Custom Locations, including the region that you had created earlier on.
* There is no option to select an App Service Plan.
  * From what I can tell, each time you deploy a new application, a new App Service Plan is automatically created for you. I'm still working through this one though, so I'll update the blog post as I discover any further.

![Screenshot showing the App Service creation experience for an App Service in an App Service Kubernetes environment](/img/blog/azure-arc-for-apps-part-2/app-service-on-kubernetes-create-appservice.jpg)

Complete the process to create a new App Service. I created an App Service called christest (yes, very original and intuitive - I know!). Before I hit create on the App Service, I ran the command ``kubectl get po -n appservice --watch`` in my terminal (though change the -n property to the namespace variable that you had set earlier on). You should see that a new pod will get scheduled in the Kubernetes cluster. Yes, that is the App Service instance that you created through the Azure Portal using your custom location.

```bash
kubectl get po -n appservice --watch
NAME                                                            READY   STATUS    RESTARTS   AGE
rb-arc-aks-appsvc-k8se-activator-56f59bbb9f-h57q7               1/1     Running   0          109s
rb-arc-aks-appsvc-k8se-app-controller-86656c54cf-f8fmm          1/1     Running   0          109s
rb-arc-aks-appsvc-k8se-build-service-568b9d8d7-5pldl            1/1     Running   0          10m
rb-arc-aks-appsvc-k8se-envoy-586565cdbd-4qzvn                   1/1     Running   0          10m
rb-arc-aks-appsvc-k8se-envoy-586565cdbd-9hb5g                   1/1     Running   0          10m
rb-arc-aks-appsvc-k8se-envoy-586565cdbd-xpp7h                   1/1     Running   0          10m
rb-arc-aks-appsvc-k8se-http-scaler-569b995bb-2csvc              1/1     Running   0          10m
rb-arc-aks-appsvc-k8se-img-cacher-xc47s                         1/1     Running   0          10m
rb-arc-aks-appsvc-k8se-keda-metrics-apiserver-678946464-hvf67   1/1     Running   0          10m
rb-arc-aks-appsvc-k8se-keda-operator-b7488958-5h4t8             1/1     Running   0          10m
rb-arc-aks-appsvc-k8se-log-processor-jpt2m                      1/1     Running   3          10m
christest-7755545bfb-pjbv8                                      0/1     Pending   0          0s
christest-7755545bfb-pjbv8                                      0/1     Pending   0          0s
christest-7755545bfb-pjbv8                                      0/1     Init:0/1   0          0s
rb-arc-aks-appsvc-k8se-log-processor-jpt2m                      0/1     Error      3          10m
christest-7755545bfb-pjbv8                                      0/1     Init:0/1   0          6s
christest-7755545bfb-pjbv8                                      0/1     PodInitializing   0          11s
rb-arc-aks-appsvc-k8se-log-processor-jpt2m                      0/1     CrashLoopBackOff   3          10m
christest-7755545bfb-pjbv8                                      0/1     Running            0          36s
christest-7755545bfb-pjbv8                                      1/1     Running            0          38s
```

Navigating to the Azure Portal, we can see that the resource has been created.

![Screenshot showing the App deployed in the Azure Portal](/img/blog/azure-arc-for-apps-part-2/app-service-on-kubernetes-azure-portal.jpg)

> **Tip:** There are a few key configuration items to observe:
>
> * Under Custom domains, the IP address for the App Service is the same as the one that was assigned to the staticIp variable.
> * The URL is of the form appserviceInstanceName.AppServiceKubernetesEnvironmentCustomDomain. For example, mine is [https://christest.rb-arc-aks-appsv-gdcume5.westeurope.k4apps.io](https://christest.rb-arc-aks-appsv-gdcume5.westeurope.k4apps.io)
> * Not all menu items are available to you. Some menu items are disabled. At time of writing, these include Application Insights, Identity, Backups, Networking, Networking (preview), WebJobs, Push, MySQL In App, Clone App, Extensions, Health Check and Process Explorer.
>
> The Azure Docs explain that during the preview period, certain App Service features are being validated. When they're supported, their left navigation options in the Azure portal will be activated. Features that are not yet supported remain grayed out. So it's best to keep up to date with [the Azure Docs](https://docs.microsoft.com/en-us/azure/app-service/overview-arc-integration#which-app-service-features-are-supported), as well as the options in your Azure portal.
>
> It's worth calling out that Apps cannot be assigned managed identities when running in Azure Arc at this time. At time of writing, the recommended approach is to use an application service principal as documented [here](https://docs.microsoft.com/en-us/azure/app-service/overview-arc-integration#are-managed-identities-supported). I encourage you to review the Azure Docs in case this has changed since time of writing.
> It's also worth calling out that hybrid connections, vNet integration and IP restrictions are not supported. It is noted that networking should be handled directly in the networking rules in the Kubernetes cluster itself. I encourage you to review the [Azure Docs](https://docs.microsoft.com/en-us/azure/app-service/overview-arc-integration#are-networking-features-supported) for the latest, in case this recommendation has changed.

## Configuring Easy Auth for our App Service

The experience to configure Authentication for our App Service deployment is no different to that when using the Platform as a Service (PaaS) hosted platform that we are used to. I'm going to make an assumption that you are familiar with this experience already, so it won't be the focus of this blog post (as it's already becoming quite a long one!). For completeness, you can find an example screenshot below of the Easy Auth experience. Before progressing, go ahead and configure an identity provider. I configured Azure Active Directory.

![Screenshot showing the Easy Auth setup for Kubernetes on App Service](/img/blog/azure-arc-for-apps-part-2/app-service-on-kubernetes-easyauth.jpg)

Before moving on, there is one interesting point to note. Before fully configuring Easy Auth on the App Service, run the command ``kubectl get po -n appservice --watch`` (or replace the -n value with the appropriate value for your namespace). You should see that a new pod (christest-559548c65f-zf22d in the snippet below) will get scheduled in the Kubernetes cluster and contains **two** containers. You'll also notice that the previous instance of the app service (christest-7755545bfb-pjbv8) is then terminated. This is not surprising - It appears as though the Easy Auth functionality is a side car container to the main application that is running in our App Service.

```bash
kubectl get po -n appservice --watch
NAME                                                            READY   STATUS             RESTARTS   AGE
christest-559548c65f-zf22d                                      0/2     PodInitializing    0          8s
christest-6c4dd4c6fd-dvp5l                                      1/1     Running            0          17s
christest-7755545bfb-pjbv8                                      1/1     Terminating        0          12m
rb-arc-aks-appsvc-k8se-activator-56f59bbb9f-h57q7               1/1     Running            0          14m
rb-arc-aks-appsvc-k8se-app-controller-86656c54cf-f8fmm          1/1     Running            0          14m
rb-arc-aks-appsvc-k8se-build-service-568b9d8d7-5pldl            1/1     Running            0          23m
rb-arc-aks-appsvc-k8se-envoy-586565cdbd-4qzvn                   1/1     Running            0          23m
rb-arc-aks-appsvc-k8se-envoy-586565cdbd-9hb5g                   1/1     Running            0          23m
rb-arc-aks-appsvc-k8se-envoy-586565cdbd-xpp7h                   1/1     Running            0          23m
rb-arc-aks-appsvc-k8se-http-scaler-569b995bb-2csvc              1/1     Running            0          23m
rb-arc-aks-appsvc-k8se-img-cacher-xc47s                         1/1     Running            0          23m
rb-arc-aks-appsvc-k8se-keda-metrics-apiserver-678946464-hvf67   1/1     Running            0          23m
rb-arc-aks-appsvc-k8se-keda-operator-b7488958-5h4t8             1/1     Running            0          23m
rb-arc-aks-appsvc-k8se-log-processor-jpt2m                      0/1     CrashLoopBackOff   6          23m
christest-559548c65f-zf22d                                      1/2     Running            0          17s
christest-559548c65f-zf22d                                      2/2     Running            0          17s
christest-6c4dd4c6fd-dvp5l                                      1/1     Terminating        0          26s
```

If we now try navigating to the App Service (e.g. [https://christest.rb-arc-aks-appsv-gdcume5.westeurope.k4apps.io](https://christest.rb-arc-aks-appsv-gdcume5.westeurope.k4apps.io)), you should now be greeted by the Azure Active Directory account selector prompt (assuming you configured the Microsoft identity provider, at least).

![Screenshot showing Easy Auth AAD Login](/img/blog/azure-arc-for-apps-part-2/app-service-on-kubernetes-aad-login.jpg)

## Configuring Custom domains

Rather than repeating myself in each section, I'm going to make the assumption that you are familiar with App Service already and are familiar with the capabilities and typical configuration experience. Custom domains is an available option in the left hand menu, though I encountered some issues here as you can see from the screenshot below.

This is one that I plan to investigate further, and determine whether this is a user interface challenge (e.g. should custom domains actually be grayed out as it's unsupported, or is the validation experience not available through the user interface).

![Screenshot showing the Custom Domain Validation for the App Service on Kubernetes through Azure Portal](/img/blog/azure-arc-for-apps-part-2/app-service-on-kubernetes-custom-domain-validation.jpg)

## Scaling out your App Service instance

As we have become accustomed to, scaling in App Service is quite literally a slider. This is no different when using an App Service Kubernetes environment. We can go ahead and adjust the slider to represent the maximum number of instances that we would like to scale to. Then, App Service deals with adding the additional instances of our application behind the scenes.

![Screenshot showing the Scaling out Functionality for App Service on Kubernetes through Azure Portal](/img/blog/azure-arc-for-apps-part-2/app-service-on-kubernetes-scale-out.jpg)

If you have your Kubernetes-thinking hat on, then you'll probably be able to determine where this is going. Before saving the new scale out configuration, I once again ran the command ``kubectl get po -n appservice --watch``. You'll notice that Kubernetes maintain the replicaset (i.e. christest-559548c65f), but adds two additional pods to it. Again, this is unsurprising and in-line with how we'd expect Kubernetes to handle a scale out event for any Kubernetes workload.

```bash
kubectl get po -n appservice --watch
NAME                                                            READY   STATUS             RESTARTS   AGE
christest-559548c65f-zf22d                                      2/2     Running            0          6m1s
rb-arc-aks-appsvc-k8se-activator-56f59bbb9f-h57q7               1/1     Running            0          20m
rb-arc-aks-appsvc-k8se-app-controller-86656c54cf-f8fmm          1/1     Running            0          20m
rb-arc-aks-appsvc-k8se-build-service-568b9d8d7-5pldl            1/1     Running            0          28m
rb-arc-aks-appsvc-k8se-envoy-586565cdbd-4qzvn                   1/1     Running            0          28m
rb-arc-aks-appsvc-k8se-envoy-586565cdbd-9hb5g                   1/1     Running            0          28m
rb-arc-aks-appsvc-k8se-envoy-586565cdbd-xpp7h                   1/1     Running            0          28m
rb-arc-aks-appsvc-k8se-http-scaler-569b995bb-2csvc              1/1     Running            0          28m
rb-arc-aks-appsvc-k8se-img-cacher-xc47s                         1/1     Running            0          28m
rb-arc-aks-appsvc-k8se-keda-metrics-apiserver-678946464-hvf67   1/1     Running            0          28m
rb-arc-aks-appsvc-k8se-keda-operator-b7488958-5h4t8             1/1     Running            0          28m
rb-arc-aks-appsvc-k8se-log-processor-jpt2m                      0/1     CrashLoopBackOff   7          28m
christest-559548c65f-ncmkz                                      0/2     Pending            0          0s
christest-559548c65f-ncmkz                                      0/2     Pending            0          0s
christest-559548c65f-wmv7p                                      0/2     Pending            0          0s
christest-559548c65f-wmv7p                                      0/2     Pending            0          0s
christest-559548c65f-ncmkz                                      0/2     Init:0/1           0          0s
christest-559548c65f-wmv7p                                      0/2     Init:0/1           0          0s
christest-559548c65f-ncmkz                                      0/2     Init:0/1           0          2s
christest-559548c65f-wmv7p                                      0/2     Init:0/1           0          2s
christest-559548c65f-ncmkz                                      0/2     PodInitializing    0          7s
christest-559548c65f-wmv7p                                      0/2     PodInitializing    0          8s
christest-559548c65f-ncmkz                                      1/2     Running            0          8s
christest-559548c65f-wmv7p                                      1/2     Running            0          9s
christest-559548c65f-ncmkz                                      2/2     Running            0          9s
christest-559548c65f-wmv7p                                      2/2     Running            0          10s
```

## Configuring deployment slots

Deployment slots are a feature of App Service that can make it incredibly easy for us to test out a separate instance of our application. We can even consider deploying a staging version of our site, so that our application is warm before we 'swap' it into the production slot. Once again, the capability is no different within an App Service Kubernetes environment.

![Screenshot showing the Deployment Slots Functionality for App Service on Kubernetes through Azure Portal](/img/blog/azure-arc-for-apps-part-2/app-service-on-kubernetes-deployment-slots.jpg)

Once I navigate to the staging endpoint ([https://christest-staging.rb-arc-aks-appsv-gdcume5.westeurope.k4apps.io](https://christest-staging.rb-arc-aks-appsv-gdcume5.westeurope.k4apps.io)), I can see another instance of my application. Just like in the multi-tenant Platform as a Service (PaaS) platform, you can associate variables and code with a specific staging slot.

![Screenshot showing the Deployment Slots Functionality for App Service on Kubernetes through Azure Portal](/img/blog/azure-arc-for-apps-part-2/app-service-on-kubernetes-deployment-slots2.jpg)

Notice that in the below snippet, we have 3 pods which have the prefix ``christest-79944ffd49``? Those are our production slot. Notice that we have one pod with a prefix of ``christest-55d5-5f775bbdd``? That is the staging slot instance.

```bash
kubectl get po -n appservice
NAME                                                            READY   STATUS    RESTARTS   AGE
arc-aks-func-demo-6cd899c4bf-7sz22                              2/2     Running   0          36h
christest-55d5-5f775bbdd-sdnpd                                  1/1     Running   0          2d4h
christest-79944ffd49-5tzxt                                      2/2     Running   0          37h
christest-79944ffd49-7n5bs                                      2/2     Running   0          37h
christest-79944ffd49-ksb96                                      2/2     Running   0          37h
logic-app-k8s-7cc75474-xmxdd                                    2/2     Running   0          2d4h
rb-arc-aks-appsvc-k8se-activator-56f59bbb9f-h57q7               1/1     Running   0          2d5h
rb-arc-aks-appsvc-k8se-app-controller-86656c54cf-f8fmm          1/1     Running   0          2d5h
rb-arc-aks-appsvc-k8se-build-service-568b9d8d7-5pldl            1/1     Running   0          2d5h
rb-arc-aks-appsvc-k8se-envoy-586565cdbd-4qzvn                   1/1     Running   0          2d5h
rb-arc-aks-appsvc-k8se-envoy-586565cdbd-9hb5g                   1/1     Running   0          2d5h
rb-arc-aks-appsvc-k8se-envoy-586565cdbd-xpp7h                   1/1     Running   0          2d5h
rb-arc-aks-appsvc-k8se-http-scaler-569b995bb-2csvc              1/1     Running   0          2d5h
rb-arc-aks-appsvc-k8se-img-cacher-xc47s                         1/1     Running   0          2d5h
rb-arc-aks-appsvc-k8se-keda-metrics-apiserver-678946464-hvf67   1/1     Running   0          2d5h
rb-arc-aks-appsvc-k8se-keda-operator-b7488958-5h4t8             1/1     Running   0          2d5h
rb-arc-aks-appsvc-k8se-log-processor-jpt2m                      1/1     Running   576        2d5h
```

How we can we be sure? Just like we would with any other Kubernetes pod, let's describe the pod to investigate the environment variables! Notice the WEBSITE_SLOT_NAME variable underneath the Environment property.

```bash
kubectl describe po christest-55d5-5f775bbdd-sdnpd -n appservice
Name:         christest-55d5-5f775bbdd-sdnpd
Namespace:    appservice
Priority:     0
Node:         aks-agentpool-85955326-vmss000000/10.240.0.4
Start Time:   Sat, 29 May 2021 18:22:30 +0100
Labels:       app=christest-55d5
              k8se.microsoft.com/environmentName=production
              k8se.microsoft.com/owner=app
              pod-template-hash=5f775bbdd
Annotations:  appsettings-resourceVersion: 19460
              fluentbit.io/exclude: false
              kind: apps
Status:       Running
IP:           10.240.0.55
IPs:
  IP:           10.240.0.55
Controlled By:  ReplicaSet/christest-55d5-5f775bbdd
Init Containers:
  app-init:
    Container ID:   containerd://2d770a8741a337160c45b1e8fc1653a9084bb98927137f42a67a7cf6d43feba5
    Image:          mcr.microsoft.com/k8se/app-init:1.0.20
    Image ID:       mcr.microsoft.com/k8se/app-init@sha256:849f6926ef625ce78bd61260a867340eb2fb6dbe40b1e361a450e1954ab3bb13
    Port:           <none>
    Host Port:      <none>
    State:          Terminated
      Reason:       Completed
      Exit Code:    0
      Started:      Sat, 29 May 2021 18:22:31 +0100
      Finished:     Sat, 29 May 2021 18:22:36 +0100
    Ready:          True
    Restart Count:  0
    Environment:
      BUILD_METADATA:        christest-55d5|hostingstart|eyJidWlsZFZlcnNpb24iIDogImhvc3RpbmdzdGFydCIsICJhcHBOYW1lIiA6ICJjaHJpc3Rlc3QtNTVkNSIsICJhcHBTdWJQYXRoIiA6ICIifQ==
      BUILD_SERVICE_NAME:    rb-arc-aks-appsvc-k8se-build-service
      SYSTEM_NAMESPACE:      appservice
      FRAMEWORK:             dotnetcore
      FRAMEWORK_VERSION:     5.0
      WEBSITE_SSH_USER:      root
      NODE_NAME:              (v1:spec.nodeName)
      POD_NAME:              christest-55d5-5f775bbdd-sdnpd (v1:metadata.name)
      WEBSITE_SSH_PASSWORD:  christest-55d5-5f775bbdd-sdnpd (v1:metadata.name)
      POD_IP:                 (v1:status.podIP)
      POD_NAMESPACE:         appservice (v1:metadata.namespace)
      ASPNETCORE_URLS:       http://+:8080
      PORT:                  8080
      WEBSITE_SITE_NAME:     christest-55d5
      APP_NAME:              christest-55d5
      WEBSITE_SLOT_NAME:     staging
      WEBSITE_HOSTNAME:      christest-55d5.rb-arc-aks-appsv-gdcume5.westeurope.k4apps.io
    Mounts:
      /home/site from sitecontentvol (rw)
      /var/run/secrets/kubernetes.io/serviceaccount from christest-55d5-token-bzs7w (ro)
Containers:
  http:
    Container ID:   containerd://b1037e1d90005db876fe6336e12fff9976c0b5bb3c9970e87786b9736d2834b9
    Image:          mcr.microsoft.com/appsvc/dotnetcore:5.0_20210301.1
    Image ID:       mcr.microsoft.com/appsvc/dotnetcore@sha256:3b1f9cc3871f9e9c3d6f7fddc95a5efa071eb30966ca096a2267482f644fed5a
    Port:           8080/TCP
    Host Port:      0/TCP
    State:          Running
      Started:      Sat, 29 May 2021 18:22:37 +0100
    Ready:          True
    Restart Count:  0
    Liveness:       tcp-socket :8080 delay=0s timeout=240s period=10s #success=1 #failure=3
    Readiness:      tcp-socket :8080 delay=0s timeout=5s period=1s #success=1 #failure=240
    Environment Variables from:
      christest-55d5-secrets  Secret  Optional: false
    Environment:
      FRAMEWORK:             dotnetcore
      FRAMEWORK_VERSION:     5.0
      WEBSITE_SSH_USER:      root
      NODE_NAME:              (v1:spec.nodeName)
      POD_NAME:              christest-55d5-5f775bbdd-sdnpd (v1:metadata.name)
      WEBSITE_SSH_PASSWORD:  christest-55d5-5f775bbdd-sdnpd (v1:metadata.name)
      POD_IP:                 (v1:status.podIP)
      POD_NAMESPACE:         appservice (v1:metadata.namespace)
      ASPNETCORE_URLS:       http://+:8080
      PORT:                  8080
      WEBSITE_SITE_NAME:     christest-55d5
      APP_NAME:              christest-55d5
      WEBSITE_SLOT_NAME:     staging
      WEBSITE_HOSTNAME:      christest-55d5.rb-arc-aks-appsv-gdcume5.westeurope.k4apps.io
    Mounts:
      /home/site from sitecontentvol (rw)
      /var/run/secrets/kubernetes.io/serviceaccount from christest-55d5-token-bzs7w (ro)
Conditions:
  Type              Status
  Initialized       True
  Ready             True
  ContainersReady   True
  PodScheduled      True
Volumes:
  sitecontentvol:
    Type:       EmptyDir (a temporary directory that shares a pod's lifetime)
    Medium:
    SizeLimit:  <unset>
  christest-55d5-token-bzs7w:
    Type:        Secret (a volume populated by a Secret)
    SecretName:  christest-55d5-token-bzs7w
    Optional:    false
QoS Class:       BestEffort
Node-Selectors:  <none>
Tolerations:     node.kubernetes.io/not-ready:NoExecute op=Exists for 300s
                 node.kubernetes.io/unreachable:NoExecute op=Exists for 300s
Events:          <none>
```

## Configuring deployment center

It's probably about time for us to deploy something to our App Service. After all, what good is a web hosting platform if we can't deploy to it?  The [Azure Docs](https://docs.microsoft.com/en-us/azure/app-service/overview-arc-integration#are-all-app-deployment-types-supported) note that FTP deployment is not supported. Currently az webapp up is also not supported. Other deployment methods are supported, including Git, ZIP, CI/CD, Visual Studio, and Visual Studio Code. I'm going to use the deployment center functionality within App Service to create a GitHub Action workflow and deploy a File > New .NET 5 application.

Below, you can see that I created a [GitHub repository](https://github.com/chrisreddington/dummysite) with the contents of a File > New .NET 5 MVC application

![Screenshot showing a basic .NET 5 MVC Application in GitHub](/img/blog/azure-arc-for-apps-part-2/github-dummy-mvc.jpg)

Navigating over to the Deployment Center tab of my App Service, I configured the source to be GitHub. I went ahead and configured the settings so that they matched up to the GitHub repository that I showed in the screenshot above.

![Screenshot showing the Deployment Center Functionality for App Service on Kubernetes through Azure Portal](/img/blog/azure-arc-for-apps-part-2/app-service-on-kubernetes-deployment-center.jpg)

After hitting save, I navigated over to the GitHub repository. Below is a screenshot of a commit made on my behalf. It committed a GitHub Action workflow file to my repository with the required steps to deploy the application to my App Service (again, to really keep hitting the point hope - The App Service that is running on my App Service for Kubernetes environment).

![Screenshot showing a GitHub Action Workflow setup automatically by App Service's Deployment Center functionality](/img/blog/azure-arc-for-apps-part-2/github-automated-workflow-setup.jpg)

Finally - navigating back to the deployment center section of my App Servrice in the Azure Portal, I can see the logs of the runs (including the time, associated Git Commit ID, Commit Author, Git Commit Message and Status).

![Screenshot showing the Deployment Center Logs Section for App Service on Kubernetes through Azure Portal](/img/blog/azure-arc-for-apps-part-2/app-service-on-kubernetes-deployment-center-logs.jpg)

And of course, we've done it several times in this blog post already. Before the GitHub Action was triggered, I ran the command ``kubectl get po -n appservice --watch`` so that we can see what's happening on the cluster as a result of the change. You'll notice that a new replicaset is created (those pods with the prefix christest-79944ffd49) and that the ones from the earlier replicaset (christest-559548c65f) are terminated.

```bash
kubectl get po -n appservice --watch
NAME                                                            READY   STATUS    RESTARTS   AGE
christest-559548c65f-ncmkz                                      2/2     Running   0          15h
christest-559548c65f-wmv7p                                      2/2     Running   0          15h
christest-559548c65f-zf22d                                      2/2     Running   0          15h
christest-55d5-5f775bbdd-sdnpd                                  1/1     Running   0          15h
logic-app-k8s-7cc75474-xmxdd                                    2/2     Running   0          14h
rb-arc-aks-appsvc-k8se-activator-56f59bbb9f-h57q7               1/1     Running   0          15h
rb-arc-aks-appsvc-k8se-app-controller-86656c54cf-f8fmm          1/1     Running   0          15h
rb-arc-aks-appsvc-k8se-build-service-568b9d8d7-5pldl            1/1     Running   0          15h
rb-arc-aks-appsvc-k8se-envoy-586565cdbd-4qzvn                   1/1     Running   0          15h
rb-arc-aks-appsvc-k8se-envoy-586565cdbd-9hb5g                   1/1     Running   0          15h
rb-arc-aks-appsvc-k8se-envoy-586565cdbd-xpp7h                   1/1     Running   0          15h
rb-arc-aks-appsvc-k8se-http-scaler-569b995bb-2csvc              1/1     Running   0          15h
rb-arc-aks-appsvc-k8se-img-cacher-xc47s                         1/1     Running   0          15h
rb-arc-aks-appsvc-k8se-keda-metrics-apiserver-678946464-hvf67   1/1     Running   0          15h
rb-arc-aks-appsvc-k8se-keda-operator-b7488958-5h4t8             1/1     Running   0          15h
rb-arc-aks-appsvc-k8se-log-processor-jpt2m                      0/1     Error     177        15h
rb-arc-aks-appsvc-k8se-log-processor-jpt2m                      0/1     CrashLoopBackOff   177        15h
christest-79944ffd49-ksb96                                      0/2     Pending            0          0s
christest-79944ffd49-ksb96                                      0/2     Pending            0          0s
christest-79944ffd49-ksb96                                      0/2     Init:0/1           0          0s
christest-79944ffd49-ksb96                                      0/2     Init:0/1           0          2s
christest-79944ffd49-ksb96                                      0/2     PodInitializing    0          7s
christest-79944ffd49-ksb96                                      1/2     Running            0          8s
christest-79944ffd49-ksb96                                      2/2     Running            0          10s
christest-559548c65f-wmv7p                                      2/2     Terminating        0          15h
christest-79944ffd49-7n5bs                                      0/2     Pending            0          0s
christest-79944ffd49-7n5bs                                      0/2     Pending            0          0s
christest-79944ffd49-7n5bs                                      0/2     Init:0/1           0          0s
christest-79944ffd49-7n5bs                                      0/2     Init:0/1           0          1s
christest-79944ffd49-7n5bs                                      0/2     PodInitializing    0          7s
christest-79944ffd49-7n5bs                                      1/2     Running            0          8s
christest-79944ffd49-7n5bs                                      2/2     Running            0          9s
christest-559548c65f-ncmkz                                      2/2     Terminating        0          15h
christest-79944ffd49-5tzxt                                      0/2     Pending            0          0s
christest-79944ffd49-5tzxt                                      0/2     Pending            0          0s
christest-79944ffd49-5tzxt                                      0/2     Init:0/1           0          0s
christest-79944ffd49-5tzxt                                      0/2     Init:0/1           0          2s
christest-79944ffd49-5tzxt                                      0/2     PodInitializing    0          7s
christest-79944ffd49-5tzxt                                      1/2     Running            0          8s
christest-79944ffd49-5tzxt                                      2/2     Running            0          10s
christest-559548c65f-zf22d                                      2/2     Terminating        0          15h
rb-arc-aks-appsvc-k8se-log-processor-jpt2m                      1/1     Running            178        15h
christest-559548c65f-wmv7p                                      0/2     Terminating        0          15h
```

And to complete the story - Once we navigate to our application in the production staging slot, we can see that it has been deployed successfully.

![Screenshot showing the MVC App running on App Service on Kubernetes](/img/blog/azure-arc-for-apps-part-2/app-service-on-kubernetes-deployment-center-result.jpg)

## App Service Plans

At this point in my write-up, I'm quite late in to the night - So this may be where my brain is firing on fewer cylinders! However, I'm not quite sure on how the concept of App Service Plans translates into the Application Services Kubernetes environment. It appears as though a new App Service Plan is created for each new App Service created. This somewhat makes sense, given that we didn't have any choice to configure this in the very beginning.

However, when I looked at the deployment in Kubernetes - I see no link between the naming of the deployments and the App Service Plans.

```bash
kubectl get deployment -n appservice
NAME                                            READY   UP-TO-DATE   AVAILABLE   AGE
christest                                       3/3     3            3           16h
christest-55d5                                  1/1     1            1           15h
rb-arc-aks-appsvc-k8se-activator                1/1     1            1           16h
rb-arc-aks-appsvc-k8se-app-controller           1/1     1            1           16h
rb-arc-aks-appsvc-k8se-build-service            1/1     1            1           16h
rb-arc-aks-appsvc-k8se-envoy                    3/3     3            3           16h
rb-arc-aks-appsvc-k8se-http-scaler              1/1     1            1           16h
rb-arc-aks-appsvc-k8se-keda-metrics-apiserver   1/1     1            1           16h
rb-arc-aks-appsvc-k8se-keda-operator            1/1     1            1           16h
```

When describing the deployments, I'm unable to find any useful information relating back to the App Service Plan either. So, at the moment - I don't have a good answer around App Service Plans. Typically in the multi-tenanted App Service model, they relate to an underlying Server Farm (or set of Virtual Machines). I had expected this to map to a deployment, though I can't find anything which confirms/denies this. This will be another area of the blog post that I'll hope to update at a later point.

> **Future thought:** Given that Azure Kubernetes Service (AKS) is capable of hosting pods on Virtual Machines across Availability Zones, it will be interesting to see if that functionality will become available within an App Service Kubernetes environment (i.e. any way to influence placement of app services based upon underlying node labels). I'm not sure that it'd be **too** specific of a usecase either. Azure, AWS and GCP each have the concept of availability zones. Even in an on-premises environment, you'll likely have some labels associated with your host machines that you may want to use to schedule traffic of Kubernetes pods. I'd be intrigued to see if this progresses further at all.

## Custom Resource Definitions in Kubernetes

You can absolutely feel free to skip over this next section. However, as I'm comfortable with Kubernetes - I wanted to dig into some more detail about what's going on behind the scenes with App Service. Specifically, what custom resource definitions got created when we set up the Application Services extension for our Azure Arc enabled Kubernetes cluster earlier? You can see there are several custom resource definitions on my Kubernetes cluster -

* Those ending k8se.microsoft.com relate to the Application Services Extension / App Services Kubernetes environment
* Those ending in clusterconfig.azure.com relate to the Azure Arc enabled Kubernetes cluster functionality
* Those ending in projectcalico.org and tigera.io relate to the Calico networking policy model that I have configured on my AKS cluster.
* Those ending in dapr.io relate to the DAPR project that I Have configured on my cluster
* Those ending in keda.sh relate to the KEDA project that was configured as part of the Application Services Extension / App Services Kubernetes environment

```bash
kubectl get crd
NAME                                                   CREATED AT
approutes.k8se.microsoft.com                           2021-05-29T16:40:12Z
apps.k8se.microsoft.com                                2021-05-29T16:40:13Z
azureclusteridentityrequests.clusterconfig.azure.com   2021-05-29T16:21:47Z
azureextensionidentities.clusterconfig.azure.com       2021-05-29T16:21:47Z
bgpconfigurations.crd.projectcalico.org                2021-05-29T16:18:49Z
bgppeers.crd.projectcalico.org                         2021-05-29T16:18:49Z
blockaffinities.crd.projectcalico.org                  2021-05-29T16:18:49Z
clusterinformations.crd.projectcalico.org              2021-05-29T16:18:49Z
clustertriggerauthentications.keda.sh                  2021-05-29T16:40:13Z
components.dapr.io                                     2021-05-29T16:40:12Z
configurations.dapr.io                                 2021-05-29T16:40:12Z
connectedclusters.arc.azure.com                        2021-05-29T16:21:47Z
customlocationsettings.clusterconfig.azure.com         2021-05-29T16:21:47Z
extensionconfigs.clusterconfig.azure.com               2021-05-29T16:21:47Z
felixconfigurations.crd.projectcalico.org              2021-05-29T16:18:49Z
gitconfigs.clusterconfig.azure.com                     2021-05-29T16:21:47Z
globalnetworkpolicies.crd.projectcalico.org            2021-05-29T16:18:49Z
globalnetworksets.crd.projectcalico.org                2021-05-29T16:18:49Z
hostendpoints.crd.projectcalico.org                    2021-05-29T16:18:49Z
imagesets.operator.tigera.io                           2021-05-29T16:18:49Z
installations.operator.tigera.io                       2021-05-29T16:18:49Z
ipamblocks.crd.projectcalico.org                       2021-05-29T16:18:49Z
ipamconfigs.crd.projectcalico.org                      2021-05-29T16:18:49Z
ipamhandles.crd.projectcalico.org                      2021-05-29T16:18:49Z
ippools.crd.projectcalico.org                          2021-05-29T16:18:49Z
kubecontrollersconfigurations.crd.projectcalico.org    2021-05-29T16:18:49Z
networkpolicies.crd.projectcalico.org                  2021-05-29T16:18:49Z
networksets.crd.projectcalico.org                      2021-05-29T16:18:49Z
placeholdertemplates.k8se.microsoft.com                2021-05-29T16:40:13Z
scaledjobs.keda.sh                                     2021-05-29T16:40:13Z
scaledobjects.keda.sh                                  2021-05-29T16:40:13Z
subscriptions.dapr.io                                  2021-05-29T16:40:12Z
tigerastatuses.operator.tigera.io                      2021-05-29T16:18:49Z
triggerauthentications.keda.sh                         2021-05-29T16:40:13Z
virtualapps.k8se.microsoft.com                         2021-05-29T16:40:13Z
workerapps.k8se.microsoft.com                          2021-05-29T16:40:13Z
```

I'm particularly interested in the apps.k8se.microsoft.com resource type. Let's inspect what ``apps.k8se.microsoft.com`` resources  are created across all namespaces.

```bash
kubectl get apps.k8se.microsoft.com --all-namespaces
NAMESPACE    NAME             AGE
appservice   christest        16h
appservice   christest-55d5   15h
```
As expected, we created a production slot and a staging slot. So, it appears as though we have two apps deployed across the cluster. Let's go and take a peek at the configuration of one of the appservice resources.

```bash
kubectl describe apps.k8se.microsoft.com christest -n appservice
Name:         christest
Namespace:    appservice
Labels:       k8se.microsoft.com/environmentName=production
Annotations:  <none>
API Version:  k8se.microsoft.com/v1alpha1
Kind:         App
Metadata:
  Creation Timestamp:  2021-05-29T16:51:11Z
  Finalizers:
    app.finalizer.k8se.io
  Generation:  5
  Managed Fields:
    API Version:  k8se.microsoft.com/v1alpha1
    Fields Type:  FieldsV1
    fieldsV1:
      f:metadata:
        f:finalizers:
      f:status:
        .:
        f:appHealthStatus:
        f:appProvisioningState:
        f:observedGeneration:
    Manager:      appcontroller
    Operation:    Update
    Time:         2021-05-29T16:51:49Z
    API Version:  k8se.microsoft.com/v1alpha1
    Fields Type:  FieldsV1
    fieldsV1:
      f:metadata:
        f:labels:
          .:
          f:k8se.microsoft.com/environmentName:
      f:spec:
        .:
        f:appType:
        f:code:
          .:
          f:packageRef:
            .:
            f:framework:
        f:config:
          .:
          f:appSettings:
            .:
            f:name:
          f:slotName:
        f:httpOptions:
          .:
          f:authentication:
            .:
            f:enabled:
            f:metadata:
              .:
              f:provider:
            f:secretRef:
              .:
              f:name:
            f:type:
            f:version:
          f:hostnames:
          f:ipSecurityRestrictions:
          f:port:
          f:scmIpSecurityRestrictions:
          f:scmIpSecurityRestrictionsUseMain:
        f:scaleOptions:
          .:
          f:maxReplicaCount:
          f:minReplicaCount:
          f:sku:
          f:stopped:
        f:triggerOptions:
    Manager:      unknown
    Operation:    Update
    Time:         2021-05-29T17:09:30Z
    API Version:  k8se.microsoft.com/v1alpha1
    Fields Type:  FieldsV1
    fieldsV1:
      f:spec:
        f:code:
          f:packageRef:
            f:buildMetadata:
    Manager:         buildctl
    Operation:       Update
    Time:            2021-05-30T08:33:14Z
  Resource Version:  314797
  UID:               60cd36dc-c66e-4f2c-8bc1-14714b209365
Spec:
  App Type:  kubernetes,linux,app
  Code:
    Package Ref:
      Build Metadata:  christest|7a6e12fbabe04353b1affcdf585c6745|eyJhcHBOYW1lIjoiY2hyaXN0ZXN0IiwiYnVpbGRWZXJzaW9uIjoiN2E2ZTEyZmJhYmUwNDM1M2IxYWZmY2RmNTg1YzY3NDUiLCJhcHBTdWJQYXRoIjpudWxsfQ==
      Framework:       DOTNETCORE|5.0
  Config:
    App Settings:
      Name:     christest-secrets
    Slot Name:  production
  Http Options:
    Authentication:
      Enabled:  true
      Metadata:
        Provider:  azureactivedirectory
      Secret Ref:
        Name:   christest-authsecrets
      Type:     EasyAuth
      Version:  v2
    Hostnames:
      Domain:  christest.rb-arc-aks-appsv-gdcume5.westeurope.k4apps.io
    Ip Security Restrictions:
    Port:  8080
    Scm Ip Security Restrictions:
    Scm Ip Security Restrictions Use Main:  false
  Scale Options:
    Max Replica Count:  4
    Min Replica Count:  3
    Sku:                Kubernetes
    Stopped:            false
  Trigger Options:
Status:
  App Health Status:       Healthy
  App Provisioning State:  Provisioned
  Observed Generation:     5
Events:
```

There wasn't anything particular different to what we have seen from earlier resources from what I could see. However, there was one other resource type that interested me - ``approutes.k8se.microsoft.com``. Let's once again take a look at what ``approutes.k8se.microsoft.com`` exist across all namespaces.

```bash
kubectl get approutes.k8se.microsoft.com -n appservice
NAME            AGE
christest       16h
```

It's interesting that there is only one route. I'm expecting to see information relating to our staging slot and production slot within this resource. Let's go ahead and investigate further.

```bash
kubectl describe approutes.k8se.microsoft.com christest -n appservice
Name:         christest
Namespace:    appservice
Labels:       <none>
Annotations:  <none>
API Version:  k8se.microsoft.com/v1alpha1
Kind:         AppRoute
Metadata:
  Creation Timestamp:  2021-05-29T16:51:11Z
  Finalizers:
    approute.finalizer.k8se.io
  Generation:  2
  Managed Fields:
    API Version:  k8se.microsoft.com/v1alpha1
    Fields Type:  FieldsV1
    fieldsV1:
      f:metadata:
        f:finalizers:
          .:
          v:"approute.finalizer.k8se.io":
        f:ownerReferences:
          .:
          k:{"uid":"60cd36dc-c66e-4f2c-8bc1-14714b209365"}:
            .:
            f:apiVersion:
            f:blockOwnerDeletion:
            f:controller:
            f:kind:
            f:name:
            f:uid:
      f:spec:
        .:
        f:routes:
          .:
          f:christest:
            .:
            f:hostnames:
          f:christest-55d5:
            .:
            f:hostnames:
      f:status:
    Manager:    appcontroller
    Operation:  Update
    Time:       2021-05-29T17:22:30Z
  Owner References:
    API Version:           k8se.microsoft.com/v1alpha1
    Block Owner Deletion:  true
    Controller:            true
    Kind:                  App
    Name:                  christest
    UID:                   60cd36dc-c66e-4f2c-8bc1-14714b209365
  Resource Version:        19483
  UID:                     7febb811-a3d6-4e16-b81f-bda5f463134d
Spec:
  Routes:
    Christest:
      Hostnames:
        Domain:  christest.rb-arc-aks-appsv-gdcume5.westeurope.k4apps.io
    christest-55d5:
      Hostnames:
        Domain:  christest-staging.rb-arc-aks-appsv-gdcume5.westeurope.k4apps.io
Status:
Events:  <none>
```

And as expected, there lies the information for both of our slots for the christest App Service (Production and Staging slot). I suspect that the Custom Domain functionality (if it is indeed supposed to work at this time) will likely be configured within this route. However, I'll need to do some more research in that space as mentioned in the earlier section.

## Resources available in the Azure Resource Group

Okay, we've had a whistle-stop tour through the many App Service features. Not only showcasing that these are the same features that we're used to in the multi-tenanted App Service model, but also taking a look at how these map to some of the Kubernetes concepts that we may be aware of.

As I've been writing up this series of blog posts, I've been jumping around between creating App Services, Logic Apps and Azure Functions. But, to give you a flavour of what the resources look like within a resource group - you can check out the screenshot below. Spoiler: They don't look any different to any other App Service, Logic App or Azure Function that you would deploy in Azure.

![Screenshot showing the App deployed in the Azure Portal](/img/blog/azure-arc-for-apps-part-2/app-service-on-kubernetes-apps-resource-group.jpg)

## Additional comments

There was an additional question from the [Azure Docs Q&A](https://docs.microsoft.com/en-us/azure/app-service/overview-arc-integration#what-logs-are-collected) that I didn't have an opportunity to naturally loop in to the blog post. If you are interested in understanding which logs are collected, then review the link just mentioned. It explains which logs are written to which locations, and confirms that by default, logs from system components are sent to the Azure team, whereas application logs are not sent. The system component piece is configurable however, but may impact your experience when working with Azure support according to the docs.

Overall, I still have a few open questions in my mind that I'd like to get closed out. If you're reading this and have stumbled across an answer, I'd love to hear from you and get the blog post updated. Alternatively, if I find out - I'll be sure to update the post!

### Remaining questions

* How do App Service Plans map into the App Service Kubernetes environment model?
* Why didn't custom domain validation experience work as expected in the Azure portal

## Summary

I've said it before, and I'll say it again - For the latest and greatest information, I encourage you to review the [Azure Docs](https://docs.microsoft.com/en-us/azure/app-service/overview-arc-integration#are-all-app-deployment-types-supported). It's very likely that my blog post will become outdated quickly (as does happen in the cloud!), but is intended to be a resource for those that either -

* Have App Service experience and want to understand how the functionality differs within an App Service for Kubernetes environment
* Have App Service experience and want to understand how the concepts map into a Kubernetes cluster
* Have Kubernetes experience and want to understand how to deploy the Application services extension onto an Azure Arc enabled Kubernetes cluster

This is probably one of the longer blog posts of the series (at least, he says this not having written the blog posts that will follow!). I hope that you've enjoyed this one, and regardless, whether you're coming from an App Service background, a Kubernetes background, or both - I hope that it has provided some value. Writing this out has certainly helped out with my own understanding, and I'm still just as excited about the potential of App Service for Kubernetes environment in an Azure Arc enabled Kubernetes cluster.

With that, any comments and feedback are always appreciated over on [Twitter, @reddobowen](https://twitter.com/reddobowen). Don't forget, there are several posts in this series that continue the story of Azure Arc for Apps.

* [Part 1 - Setting up an Azure Arc enabled Kubernetes cluster](/blog/azure-arc-for-apps-part-1)
* [Part 3 - Deploying Azure Functions into an App Service Kubernetes Environment](/blog/azure-arc-for-apps-part-3)
* [Part 4 - Deploying Logic Apps into your App Services Kubernetes Environment](/blog/azure-arc-for-apps-part-4)
* [Part 5 - Deploying an Azure API Management gateway to an Azure Arc enabled Kubernetes Cluster](/blog/azure-arc-for-apps-part-5)
* [Part 6 - Setting up Event Grid on Kubernetes with Azure Arc](/blog/azure-arc-for-apps-part-6)

 I hope that you'll continue on with the series, in which case - read on! Otherwise, until the next blog post - Thanks for reading, and bye for now!