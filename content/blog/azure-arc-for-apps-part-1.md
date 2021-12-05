---
Author: chrisreddington
Description: "At Microsoft //Build 2021, Microsoft announced a series of updates relating to Cloud Native Applications anywhere. In summary, those updates refer to running Azure Services (such as App Services, Logic Apps, Azure Functions, Event Grid and API Management) in any Kubernetes cluster which is managed by Azure Arc. That means you could have Azure App Services running in Amazon Web Services (AWS), Google Cloud Platform (GCP), or in your on-premises Kubernetes deployment. This is a significant update, so I've decided that I'll be writing a series of blog posts on the topic - as one post would not do the topic justice!"
PublishDate: "2021-06-01T08:00:00Z"
image: img/cloudwithchrislogo.png
date: "2021-06-01T08:00:00Z"
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
title: Using Azure Arc for Apps - Part 1 - Setting up an Azure Arc enabled Kubernetes Cluster
---

## Cloud Native Applications that run anywhere
At Microsoft //Build 2021, Microsoft announced a series of updates relating to Cloud Native Applications anywhere. In summary, those updates refer to running Azure Services (such as App Services, Logic Apps, Azure Functions, Event Grid and API Management) in any Kubernetes cluster which is managed by Azure Arc. That means you could have Azure App Services running in Amazon Web Services (AWS), Google Cloud Platform (GCP), or in your on-premises Kubernetes deployment. This is a significant update, so I've decided that I'll be writing a series of blog posts on the topic - as one post would not do the topic justice!

In this first post of the series, we'll first gain some understanding around Azure Arc, Azure Arc enabled Kubernetes, and some tips/tricks on getting started. It will be demo heavy, as we get our Kubernetes cluster setup as an Azure Arc enabled Kubernetes Cluster. There are options here. In this blog post, I showcase Kubernetes in Docker (kind), as well as Azure Kubernetes Service (AKS). However, I continue to use my Azure Kubernetes Service (AKS) deployment in the following blog posts of the series, as several of the application services require a public static IP address, which is something I do not have access to in my local home environment.

## What is Azure Arc?

With that context, let's begin. First off, what is Azure Arc? [Azure Arc was announced back at Ignite 2019](https://azure.microsoft.com/en-us/blog/azure-services-now-run-anywhere-with-new-hybrid-capabilities-announcing-azure-arc/). At its core, it's a service which simplifies governance and management across multiple environments. It originated with Azure Arc for Servers, and then expanded to Azure Arc enabled Kubernetes and Azure Arc enabled data services.

> **Thought:** Consider the scenario where you have platforms across multiple clouds, or multiple environments. Perhaps Azure, AWS, GCP and on-premises. Each of those platforms will have different tools/user interfaces to manage the underlying infrastructure. This is where Azure Arc can add significant value. You can use a single pane of glass (The Azure Portal) to manage resources across those environments, as if they were running in Azure. Even better, you can start leveraging some of the Azure Control Plane / Azure Resource Manager benefits, around topics like Azure Policy to manage resources at scale. Azure Arc helps you bring the investments from the Azure Engineering team into your infrastructure across multiple hosting platforms.

## What is Azure Arc enabled Kubernetes?

How does Azure Arc enabled Kubernetes fit into that? [Azure Arc enabled Kubernetes was announced in May 2020](https://azure.microsoft.com/en-gb/blog/azure-arc-enabled-kubernetes-preview-and-new-ecosystem-partners/). The first 'release' of Azure Arc was primarily focused around Virtual Machines/Servers, and being able to manage governance, security and inventory at scale across a traditional estate. As we all know, Kubernetes has been gaining some significant traction over recent years, becoming a container orchestrator considered by many. It made sense for Microsoft to extend Azure Arc's capabilities towards Kubernetes.

> **Thought:** Consider the scenario where you need to quickly spin up underlying infrastructure across a number of different sites across the country. For example, a retail environment where you are deploying application infrastructure for each store. That could be time consuming, require time on site and could be error-prone. Containers help us run applications consistently across environments. Kubernetes helps us orchestrate containers at scale. So, if we needed to deploy and manage Kubernetes Clusters at scale (i.e. country-wide retail stores)? Azure Arc can help us. For example, setting guardrails across resources with Azure Policy ensuring a level of compliance; Using GitOps to deploy configuration across one or more clusters at scale from Git repositories (which means, as we deploy updates - our clusters can also stay in sync!); Integrate into our existing Azure operational approach for monitoring, inventory, resource tagging, threat protection with Azure Defender and more.

Okay, so now we understand why we may want to consider Azure Arc and Azure Arc enabled Kubernetes. How does this fit in to the various Azure services that can be used in a combination with Azure Arc? Take note of what I mentioned in the thought above. Containers help us run applications consistently across environments. Kubernetes helps us orchestrate containers at scale.

The Azure Services (such as App Services, Logic Apps, Azure Functions, Event Grid and API Management) can all be deployed to a Kubernetes cluster, which ensures we have a consistent environment for deployment. To enable these Application Services in a Kubernetes cluster, we need to ensure that our Kubernetes cluster is Azure Arc enabled (i.e. has Azure Arc installed on it).

> **Tip:** Containers ensure that we have a consistent deployment environment for our applications. However, as end-users, we may decide to host our Kubernetes clusters in several ways. We may use bare-metal. We may virtualise. We may use a specific distribution. Or perhaps, a managed service such as Elastic Kubernetes Service (EKS) from AWS, Google Kubernetes Engine (GKE) from GCP or Azure Kubernetes Service from Microsoft Azure. The [Azure Arc team have a validation program](https://docs.microsoft.com/en-gb/azure/azure-arc/kubernetes/validation-program) to ensure the experience conforms to a certain number of tests, and that you will have a consistent experience running in setting up an Azure Arc enabled cluster.

## Creating a Kubernetes Cluster

And so, we have arrived at the purpose of this first blog post. Let's create a Kubernetes Cluster and configure it to be an Azure Arc enabled Cluster. I'm going to work through two scenarios -

* Setting up a Kubernetes Cluster using kind (Kubernetes in Docker) and installing the required components for Azure Arc enabled Kubernetes
* Setting up an Azure Kubernetes Cluster and installing the required components for Azure Arc enabled Kubernetes

### Creating a Kubernetes Cluster with WSL and kind

I have Windows 10 running on my desktop machine. This is the one that I typically use for gaming, streaming, development work and write the majority of my blog posts here.

These are the following **pre-requisites** that I have installed -

* [Docker Desktop](https://docs.docker.com/docker-for-windows/install/)
* [Windows Subsystem for Linux 2](https://docs.microsoft.com/en-us/windows/wsl/install-win10)
* [Ubuntu 20.04 LTS](https://www.microsoft.com/en-us/p/ubuntu-2004-lts/9n6svws3rx71?activetab=pivot:overviewtab), or your favourite distribution of Linux.
* [Windows Terminal](https://www.microsoft.com/en-us/p/windows-terminal/9n0dx20hk701?activetab=pivot:overviewtab)
  * This isn't a hard requirement, but a strong recommendation. I love being able to use a single terminal application across all of the types of consoles that I work with (PowerShell, Command Prompt, Bash Terminals, etc.)

> *Tip:* Before progressing, it's worth reviewing [this article](https://docs.docker.com/docker-for-windows/wsl/) and making sure that you have configured Docker Desktop to work well with Windows Subsystem for Linux 2. There are some positive performance gains of using WSL2 (compared with the original WSL implementation).

First up, installing a Kubernetes Cluster on your machine. Eagle-eyed readers will be aware that there is an option to [Enable Kubernetes](https://docs.docker.com/desktop/kubernetes/) bundled within Docker Desktop. However, to me - it wasn't clear on a number of important factors. How do I upgrade the Kubernetes version on the nodes? How many nodes are there? For that reason, I decided against using Docker Desktop for the time being (but feel free to explore it if you wish!)

Instead, I chose to use a project called kind. Kind is an abbreviation for Kubernetes in Docker. That quite literally explains the project, you're running a Kubernetes Cluster within docker. Yes, a full cluster. You could choose to have several nodes, each appearing as their own container running in the Docker Engine on your machine. To get started, follow the appropriate setup instructions for your machine as found on the [kind docs](https://docs.docker.com/desktop/kubernetes/). Rather than installing kind directly into my Windows 10 environment, I opted to open an Ubuntu shell (within WSL) in my Windows Terminal.

> **Tip:** kind is a "sig" (Special Interest Group) of the Kubernetes project. These groups have existed since around the 1.0 release of Kubernetes, and are there to support the community of developers and operators in specific areas of the Kubernetes project.

All being well, you should have successfully installed kind on your machine. The simplest way to create a new Kubernetes cluster is by using ``kind create cluster``, which I believe creates a single-node cluster for you.

What if you want to have a multi-node cluster experience? Well, kind has you covered. You can go ahead and define a YAML file (of course, just like most objects in the world of Kubernetes) which defines how your cluster should be configured. You can find an example for a multi-node cluster in the snippet below.

> **Tip:** Note in the snippet below that I have one control-plane role, and three worker roles. I originally tried deploying using multiple control-plane nodes, simulating a highly available control plane (after all, it's all running on one physical machine, so not very highly available...). However, I encountered an issue when restarting my machine. I simply couldn't connect to the cluster. After doing some investigation, it turns out that it's a [well-known issue](https://github.com/kubernetes-sigs/kind/issues/1689) relating to IP address allocation of kind clusters that have multiple control-plane roles configured. This is why you see the two control-plane lines commented out in the snippet below. Hopefully at some point in the future, this issue will be resolved. But, for the time being - I'll leave this note and the commented lines within the snippet below.

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
  # Don't use a multi-control plane cluster, per https://github.com/kubernetes-sigs/kind/issues/1689
  # - role: control-plane
  # - role: control-plane
  - role: worker
  - role: worker
  - role: worker
```

You can create a kind cluster by passing in a configuration file (e.g. the one above) by using the syntax ``kind create cluster --config path-to/my-config-file.yaml``. Once you run the command, your cluster will begin being created by kind, and you should see an output similar to the below.

```bash
kind create cluster --config kind-3nodes.yaml
Creating cluster "kind" ...
 ✓ Ensuring node image (kindest/node:v1.21.1) 🖼
 ✓ Preparing nodes 📦 📦 📦 📦
 ✓ Writing configuration 📜
 ✓ Starting control-plane 🕹️
 ✓ Installing CNI 🔌
 ✓ Installing StorageClass 💾
 ✓ Joining worker nodes 🚜
Set kubectl context to "kind-kind"
You can now use your cluster with:

kubectl cluster-info --context kind-kind

Have a nice day! 👋
```

## Creating an Azure Kubernetes Service Cluster

Fortunately, this experience is very intuitive and incredibly well-documented. For the purposes of this blog post, I don't plan to cover this in too much depth. Instead, I'll sign-post you to a couple of options -

* [Azure Docs on creating an AKS Cluster through the Azure Portal](https://docs.microsoft.com/en-us/azure/aks/kubernetes-walkthrough-portal)
* [Azure Docs on creating an AKS cluster through the Azure CLI](https://docs.microsoft.com/en-us/azure/aks/kubernetes-walkthrough)
* [Azure Docs on creating an AKS cluster through Azure PowerShell](https://docs.microsoft.com/en-us/azure/aks/kubernetes-walkthrough-powershell)

> **Note:** Each of these docs also demonstrate how to run and test an application on the cluster. That will not be needed when working through this blog. Instead, work your way through to (and including) the **Connect to the cluster** step.

## Enabling Azure Arc on your Kubernetes Cluster

At this point, we now have a Kubernetes cluster created. It's time for us to begin installing Azure Arc.

> **Comment:** Regardless of whether you have used a Kubernetes Cluster set up using kind, Azure Kubernetes Service or another approach, the following steps should now be consistent. If you do have any issues along the way, please don't hesitate to [drop me a tweet](https://twitter.com/reddobowen).

Before installing any software or enabling any service, it's a good practice to first review the pre-requisites. I have included these (at time of writing) below, though these could change over time. [The Azure Docs](https://docs.microsoft.com/en-gb/azure/azure-arc/kubernetes/quickstart-connect-cluster#prerequisites) should act as the source of truth for these, in case of any issues.

### Pre-requisites

* A kubeconfig file and context pointing to your cluster.
* 'Read' and 'Write' permissions on the Azure Arc enabled Kubernetes resource type (Microsoft.Kubernetes/connectedClusters).
* Install the latest release of Helm 3.
* Install or upgrade Azure CLI to version >= 2.16.0
* Install the connectedk8s Azure CLI extension of version >= 1.0.0 by using ``az extension add --name connectedk8s``

> **Tip:** There are a couple of additional tips that I picked up along the way, which I wanted to include ahead of time -
> * The cluster needs to have at least one node of operating system and architecture type linux/amd64. Clusters with only linux/arm64 nodes aren't yet supported.
> * The Azure Arc agent has a number of networking requirements. You can find those [here](https://docs.microsoft.com/en-us/azure/azure-arc/kubernetes/quickstart-connect-cluster#meet-network-requirements)

### Setting up Azure Arc

If this is your first time setting up an Azure Arc enabled Kubernetes cluster, then you may need to register several Microsoft Resource Provider endpoints.

> **Note:** Whenever you deploy or interact with resources, you are typically retrieving or sending information to the Azure APIs about that resource. For example, creating a Network Interface Card, or retrieving details about a Public IP resource. These APIs are commonly known as Azure Resource Providers. If you have written any Azure Resource Manager (ARM) templates, Bicep Templates or Terraform Templates, you may have noticed some of these resource provider (e.g. Microsoft.Web, Microsoft.Compute, Microsoft.Kubernetes, etc.).
>
> Before you use an Azure Resource Provider, your subscription must be registered to use it. This registration doesn't cost anything, but effectively 'enables' the functionality on your subscription. There are a number of resource providers that are configured by default, [as described here](https://docs.microsoft.com/en-us/azure/azure-resource-manager/management/azure-services-resource-providers).
>
> You can learn more about Azure Resource Providers [here](https://docs.microsoft.com/en-us/azure/azure-resource-manager/management/resource-providers-and-types).

Let's first register the needed providers. You'll notice that the commands below are using the Azure CLI (hence the pre-requisite mentioned earlier on).

```bash
az provider register --namespace Microsoft.Kubernetes
az provider register --namespace Microsoft.KubernetesConfiguration
az provider register --namespace Microsoft.ExtendedLocation
```

The amount of time it takes to register a Resource Provider can vary. However, you won't be able to progress until the registration is complete. You can go ahead and monitor the registration of these providers by using the below:
```bash
az provider show -n Microsoft.Kubernetes -o table
az provider show -n Microsoft.KubernetesConfiguration -o table
az provider show -n Microsoft.ExtendedLocation -o table
```

You'll be waiting to see that the Resource Providers are showing as Registered, similar to the below -

```bash
az provider show -n Microsoft.Kubernetes -o table
Namespace             RegistrationPolicy    RegistrationState
--------------------  --------------------  -------------------
Microsoft.Kubernetes  RegistrationRequired  Registered

az provider show -n Microsoft.KubernetesConfiguration -o table
Namespace                          RegistrationPolicy    RegistrationState
---------------------------------  --------------------  -------------------
Microsoft.KubernetesConfiguration  RegistrationRequired  Registered

 az provider show -n Microsoft.ExtendedLocation -o table
Namespace                   RegistrationPolicy    RegistrationState
--------------------------  --------------------  -------------------
Microsoft.ExtendedLocation  RegistrationRequired  Registered
```

Once registered, we're now ready to start setting up our Azure Arc enabled Kubernetes cluster! Firstly, you'll want to create an Azure Resource Group to hold the Azure Arc Resource. It's not a "real" resource like an Azure Virtual Machine which is compute spun up for you to use in Azure. It will be the representation of your Kubernetes Cluster in the Azure Portal, so that you can assign Azure Policy, deploy to the cluster using GitOps techniques or install Azure Arc extensions (spoiler: we'll be using those in the future blog posts).

```bash
arcResourceGroupName="rb-arc-rg"
arcResourceGroupLocation="westeurope"
az group create --name $arcResourceGroupName --location $arcResourceGroupLocation --output table

Location         Name
----------       ------------
northeurope      rb-arc-rg
```
Okay, now for the big moment! We're going to be transforming the Kubernetes Cluster that we had earlier into an Azure Arc enabled Kubernetes cluster! Sounds exciting, doesn't it? It's actually not a complex process at all - The Azure CLI makes it very easy for us to complete this process. Before you run through the process, I highly encourage you to reach the tip in the box below, so that you have the appropriate pre-requisites and understand what is happening.


> **Tip:** Before executing the below bash script -
>
> * Make sure that you have the latest helm version installed before progressing. Learn why below the snippet!
> * In the environment where you'll be executing the Azure CLI command, make sure that your kubectl context is set to the correct kubernetes cluster. The az connectedk8s connect command will be using the current kubeconfig context. It will create a Helm Deployment for you, deploying the required components to enable Azure Arc enabled Kubernetes on your cluster.
> * Be aware that Azure Arc for Kubernetes is supported in numerous regions. However, if you plan to follow the additional posts in this series, then you may need to give some thought about where you deploy your Azure Arc enabled Kubernetes resource. For example, in [part 2](/blog/azure-arc-for-apps-part-2), we discuss that (at time of writing) the App Service Kubernetes environment [is only available in West Europe and East US](https://docs.microsoft.com/en-gb/azure/app-service/overview-arc-integration#public-preview-limitations).

```bash
arcClusterName="rb-arc-aks"
az connectedk8s connect --name $arcClusterName --resource-group $arcResourceGroupName
```

> **Tip:** You can specify a location in the above Azure CLI command. However, if you don't - it will simply use the same location as the Azure Resource Group that you're deploying into.

Now for our final trick - you can go ahead and verify that the Azure Arc resource has been created successfully, and that there is connectivity between Azure and the cluster by using the below:

```bash
az connectedk8s list --resource-group $arcResourceGroupName --output table

Name           Location     ResourceGroup
-------------  -----------  ---------------
rb-arc-aks     northeurope  rb-arc-rg
```

> **Tip:** If you're interested, you can go ahead and execute the ``kubectl --namespace azure-arc get deployments,pods`` command to inspect what was deployed into your cluster by the Azure CLI command. If you're comfortable with using kubectl and exploring the commandline, feel free to go ahead and explore!
>
> After onboarding your cluster to Azure Arc, the cluster metadata may not be available immediately. The Azure Docs suggest that it may take 5 to 10 mins for this to appear in the Azure Portal.

And there you go, you are the proud new owner of an Azure Arc enabled Kubernetes Cluster! You have a new world of possibilities. So at this point, you could -
* Start applying [Azure Policy across your Kubernetes clusters)](https://docs.microsoft.com/en-us/azure/governance/policy/concepts/policy-for-kubernetes?toc=/azure/azure-arc/kubernetes/toc.json) to ensure they adhere to certain standards.
* Use [GitOps ensure certain configuration/deployments are in place](https://docs.microsoft.com/en-us/azure/azure-arc/kubernetes/tutorial-use-gitops-connected-cluster) across your clusters.
* Configure [Azure Monitor for Containers](https://docs.microsoft.com/en-us/azure/azure-monitor/containers/container-insights-enable-arc-enabled-clusters) to gain insight into your clusters.

That is out of scope for this particular blog series, so we won't be running through those items. If you're interested, please feel free to explore those topics further using the Azure Docs above. We now have the pre-requisites (A Kubernetes Cluster with Azure Arc configured) to deploy a number of Azure Services onto our Azure Kubernetes cluster. These are split into several different posts, so I'd encourage you to read these separate posts!

* [Part 2 - Deploying App Services to Kubernetes](/blog/azure-arc-for-apps-part-2)
* [Part 3 - Deploying Azure Functions into an App Service Kubernetes Environment](/blog/azure-arc-for-apps-part-3)
* [Part 4 - Deploying Logic Apps into your App Services Kubernetes Environment](/blog/azure-arc-for-apps-part-4)
* [Part 5 - Deploying an Azure API Management gateway to an Azure Arc enabled Kubernetes Cluster](/blog/azure-arc-for-apps-part-5)
* [Part 6 - Setting up Event Grid on Kubernetes with Azure Arc](/blog/azure-arc-for-apps-part-6)

With that, thank you for reading. I'd love to hear if this content was useful. Please let me know over on [Twitter, @reddobowen](https://twitter.com/reddobowen). I hope that you'll continue on with the series, in which case - read on! Otherwise, until the next blog post - Thanks for reading, and bye for now!