---
Author: chrisreddington
Description: ""
PublishDate: "2021-06-02T08:00:00Z"
image: img/cloudwithchrislogo.png
date: "2021-06-02T08:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Technology
- DevOps
- Git
- Security
- How To
title: Using Azure Arc for Apps - Part 1
---
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

Now that we have our Kubernetes cluster, we can go ahead and start installing Azure Arc...

> The cluster needs to have at least one node of operating system and architecture type linux/amd64. Clusters with only linux/arm64 nodes aren't yet supported.

Pre-requisites:

* A kubeconfig file and context pointing to your cluster.
* 'Read' and 'Write' permissions on the Azure Arc enabled Kubernetes resource type (Microsoft.Kubernetes/connectedClusters).
* Install the latest release of Helm 3.
* Install or upgrade Azure CLI to version >= 2.16.0
* Install the connectedk8s Azure CLI extension of version >= 1.0.0 by using ``az extension add --name connectedk8s``

> Tip: Be aware that the Azure Arc agent has a number of networking requirements. You can find those [here](https://docs.microsoft.com/en-us/azure/azure-arc/kubernetes/quickstart-connect-cluster#meet-network-requirements)

If this is your first time setting up an Azure Arc enabled Kubernetes cluster, then you'll need to register the Microsoft Resource endpoints (TODO:).

```bash
az provider register --namespace Microsoft.Kubernetes
az provider register --namespace Microsoft.KubernetesConfiguration
az provider register --namespace Microsoft.ExtendedLocation
```

You can go ahead and monitor the registration by using the below:
```bash
az provider show -n Microsoft.Kubernetes -o table
az provider show -n Microsoft.KubernetesConfiguration -o table
az provider show -n Microsoft.ExtendedLocation -o table
```

Go ahead and create a resource group.


> **Tip:** Before executing the below bash script -
> 
> * Make sure that you have the latest helm version installed before progressing. Learn why below the snippet!
> * Make sure that your kubeconfig has the appropriate kubernetes cluster context selected. The az connectedk8s connect command will be using that.

```bash
resourceGroup="rb-arc-rg"
arcClusterName="rb-arc-aks"
azureLocation="westeurope"

az group create --name $resourceGroup --location $azureLocation --output table

az connectedk8s connect --name $arcClusterName --resource-group $resourceGroup
```

The ``az connectedk8s connect`` Azure CLI Command creates a Helm Deployment for you, deploying the necessary components to have the Azure Arc for Kubernetes agent running on your cluster.

Finally, you can go ahead and verify the connectivity by using the below:

```bash
az connectedk8s list --resource-group $resourceGroup --output table
```

At this point, you should see a table listed with the name of the Kubernetes - Azure Arc resource in Azure which represents your cluster.

> **Tip:** If you're interested, you can go ahead and execute the ``kubectl --namespace azure-arc get deployments,pods`` command to understand what was deployed onto the cluster.

At this point, you could -
* Start applying [Azure Policy across your Kubernetes clusters](https://docs.microsoft.com/en-us/azure/governance/policy/concepts/policy-for-kubernetes?toc=/azure/azure-arc/kubernetes/toc.json) to ensure they adhere to certain standards. 
* Use [GitOps ensure certain configuration/deployments are in place](https://docs.microsoft.com/en-us/azure/azure-arc/kubernetes/tutorial-use-gitops-connected-cluster) across your clusters.
* Configure [Azure Monitor for Containers](https://docs.microsoft.com/en-us/azure/azure-monitor/containers/container-insights-enable-arc-enabled-clusters) to gain insight into your clusters.

However, we won't be doing that. If you're interested, I'll leave you to follow along with the appropriate Azure Docs. Instead, we have the pre-requisites (A Kubernetes Cluster with Azure Arc configured) to deploy Azure App Service onto our Kubernetes cluster.