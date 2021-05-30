---
Author: chrisreddington
Description: ""
PublishDate: "2021-06-02T08:01:00Z"
image: img/cloudwithchrislogo.png
date: "2021-06-02T08:01:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Technology
- DevOps
- Git
- Security
- How To
title: Using Azure Arc for Apps - Part 2
---
You should have already followed part 1. Now, at time of writing - there are some limitations around installing App Service on Kubernetes (per below). To work around those, I'll deploy into an AKS cluster for the time being and will circle back on this article at a later point, to deploy to an "on-premises" cluster.

https://docs.microsoft.com/en-gb/azure/app-service/overview-arc-integration

> **Tip:** Note that the public preview has limitations on which regions that this is supported within. Also note that the Kubernetes cluster must support a LoadBalancer service type and have a publicly addressable static IP.

Are both Windows and Linux apps supported?
Only Linux-based apps are supported, both code and custom containers. Windows apps are not supported.

Which built-in application stacks are supported?
All built-in Linux stacks are supported.

As this is still in an early preview stage, several commands needed in the Azure CLI are not yet part of the Core Azure CLI.

```bash
az extension add --upgrade --yes --name connectedk8s
az extension add --upgrade --yes --name k8s-extension
az extension add --upgrade --yes --name customlocation
```

You'll also need to make sure that you have a number of Microsoft Resource Endpoints enabled -
```bash
az provider register --namespace Microsoft.ExtendedLocation --wait
az provider register --namespace Microsoft.Web --wait
az provider register --namespace Microsoft.KubernetesConfiguration --wait
```

Finally, make sure to install the latest version of the App Service for Kubernetes extension for the Azure CLI.

```bash
az extension remove --name appservice-kube
az extension add --yes --source "https://aka.ms/appsvc/appservice_kube-latest-py2.py3-none-any.whl"
``

As a pre-requisite, let's pre-populate the information about the cluster and our Azure Arc deployment.

```bash
arcResourceGroupName="rb-arc-rg"
arcClusterName="rb-arc-aks"
aksResourceGroupName="rb-aks-rg"
aksClusterName="rb-aks"
appsvcPipName="$aksClusterName-appsvc-pip"

# The below is not needed if you are not using AKS. You will need to populate this in another way, it is effectively being used to obtain a static IP to be used by the App Service on Kubernetes deployment.

aksComponentsResourceGroupName=$(az aks show --resource-group $aksResourceGroupName --name $aksClusterName --output tsv --query nodeResourceGroup)


az network public-ip create --resource-group $aksComponentsResourceGroupName --name $appsvcPipName --sku STANDARD
staticIp=$(az network public-ip show --resource-group $aksComponentsResourceGroupName --name $appsvcPipName --output tsv --query ipAddress)
```

Next up, the documentation explains that you can create a Log Analytics Workspace. It is not a required step to run App Service in Azure Arc, but it is difficult to set this up later (at time of writing, at least).

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

Now that you've created the Log Analytics Workspace, you can go ahead and install the App Service Extension to Azure Arc.

```bash
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

    # Now save the id property of the App Service Extension in Azure Arc, so that it can be used when we actually create the environment in Kubernetes.

    extensionId=$(az k8s-extension show \
    --cluster-type connectedClusters \
    --cluster-name $arcClusterName \
    --resource-group $arcResourceGroupName \
    --name $extensionName \
    --query id \
    --output tsv)

    # The Azure Docs recommend waiting until the extension is fully created before proceeding. The below command can help with that.
  az resource wait --ids $extensionId --custom "properties.installState!='Pending'" --api-version "2020-07-01-preview"

  # Now when you check the pods in the namespace, you'll see the stamp for the core app service resources are now there.
  kubectl get pods -n $namespace
```

Next up, you need to create a custom location so that you can tell Azure where any App Service deployments (e.g. Web Apps) can be routed to your cluster.

```bash
customLocationName="$arcClusterName-appsvc" # Name of the custom location

# Find the cluster ID
connectedClusterId=$(az connectedk8s show --resource-group $arcResourceGroupName --name $arcClusterName --query id --output tsv)

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

Okay, you've reached the milestone! Now we need to create the App Service Kubernetes Environment. But wait, what's the difference here compared to the extension you installed earlier?

Well, the extension is used to install all the backend components that make App Service run in your Kubernetes environment. You can find a list of these [here](https://docs.microsoft.com/en-us/azure/app-service/overview-arc-integration#pods-created-by-the-app-service-extension), and a write-up more broadly about Azure Arc Extensions [here](https://docs.microsoft.com/en-us/azure/azure-arc/kubernetes/conceptual-extensions). **(Explain the difference between this, and what was configured with the App Service Extension)**

```bash
  # The below step is where I failed when creating App Service on a local cluster. I believe it's down to the Static IP requirement. Will update this guide when there is further information.
  az appservice kube create \
      --resource-group $arcResourceGroupName \
      --name $kubeEnvironmentName \
      --custom-location $customLocationId \
      --static-ip $staticIp

  # Be prepared to wait, this one took me a good few minutes to complete.

  az appservice kube show \
    --resource-group $arcResourceGroupName \
    --name $kubeEnvironmentName
```

Now, when you navigate to the Azure Portal and create a new App 

```bash
chris@reddobowen-home:~/.kube$ kubectl get po -n appservice --watch
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

And navigating to the Azure Portal, we can see that the resource has been created.

![Screenshot showing the App deployed in the Azure Portal](/img/blog/azure-arc-for-apps-part-2/app-service-on-kubernetes-azure-portal.jpg)

Notice that your IP address for the App Service is the same as what you assigned earlier on to the staticIp variable.

Which App Service features are supported?
During the preview period, certain App Service features are being validated. When they're supported, their left navigation options in the Azure portal will be activated. Features that are not yet supported remain grayed out.

![Screenshot showing the Easy Auth setup for Kubernetes on App Service](/img/blog/azure-arc-for-apps-part-2/app-service-on-kubernetes-easyauth.jpg)

Comment showing that like a Kubernetes deployment they kill off the old deployment, replace with new. The new one seems to be a sidecar, which would make sense.

```bash
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
![Screenshot showing Easy Auth AAD Login](/img/blog/azure-arc-for-apps-part-2/app-service-on-kubernetes-aad-login.jpg)

While the option is available for Custom Domain, it didn't seem to want to validate. Need to investigate further.

![Screenshot showing the Custom Domain Validation for the App Service on Kubernetes through Azure Portal](/img/blog/azure-arc-for-apps-part-2/app-service-on-kubernetes-custom-domain-validation.jpg)
![Screenshot showing the Scaling out Functionality for App Service on Kubernetes through Azure Portal](/img/blog/azure-arc-for-apps-part-2/app-service-on-kubernetes-scale-out.jpg)

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


![Screenshot showing the Deployment Slots Functionality for App Service on Kubernetes through Azure Portal](/img/blog/azure-arc-for-apps-part-2/app-service-on-kubernetes-deployment-slots.jpg)
![Screenshot showing the Deployment Slots Functionality for App Service on Kubernetes through Azure Portal](/img/blog/azure-arc-for-apps-part-2/app-service-on-kubernetes-deployment-slots2.jpg)


![Screenshot showing a basic .NET 5 MVC Application in GitHub](/img/blog/azure-arc-for-apps-part-2/github-dummy-mvc.jpg)
![Screenshot showing the Deployment Center Functionality for App Service on Kubernetes through Azure Portal](/img/blog/azure-arc-for-apps-part-2/app-service-on-kubernetes-deployment-center.jpg)
![Screenshot showing a GitHub Action Workflow setup automatically by App Service's Deployment Center functionality](/img/blog/azure-arc-for-apps-part-2/github-automated-workflow-setup.jpg)
![Screenshot showing the Deployment Center Logs Section for App Service on Kubernetes through Azure Portal](/img/blog/azure-arc-for-apps-part-2/app-service-on-kubernetes-deployment-center-logs.jpg)

Are all app deployment types supported?
FTP deployment is not supported. Currently az webapp up is also not supported. Other deployment methods are supported, including Git, ZIP, CI/CD, Visual Studio, and Visual Studio Code.

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


![Screenshot showing the MVC App running on App Service on Kubernetes](/img/blog/azure-arc-for-apps-part-2/app-service-on-kubernetes-deployment-center-result.jpg)

Are networking features supported?
No. Networking features such as hybrid connections, Virtual Network integration, or IP restrictions, are not supported. Networking should be handled directly in the networking rules in the Kubernetes cluster itself.

What logs are collected?
Logs for both system components and your applications are written to standard output. Both log types can be collected for analysis using standard Kubernetes tools. You can also configure the App Service cluster extension with a Log Analytics workspace, and it will send all logs to that workspace.

By default, logs from system components are sent to the Azure team. Application logs are not sent. You can prevent these logs from being transferred by setting logProcessor.enabled=false as an extension configuration setting. This will also disable forwarding of application to your Log Analytics workspace. Disabling the log processor may impact time needed for any support cases, and you will be asked to collect logs from standard output through some other means.
```

How does the App Service Plan come into all of this? We can see app deployments below.

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

```bash
kubectl get apps.k8se.microsoft.com --all-namespaces
NAMESPACE    NAME             AGE
appservice   christest        16h
appservice   christest-55d5   15h
```

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

```bash
kubectl get approutes.k8se.microsoft.com -n appservice
NAME            AGE
christest       16h
```

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
As I've been creating several resources across these blog posts, I've been jumping around - but you can see there are some app services in my resource grup... something or other...

![Screenshot showing the App deployed in the Azure Portal](/img/blog/azure-arc-for-apps-part-2/app-service-on-kubernetes-apps-resource-group.jpg)

Open questions remaining -
* What are the options for deploying this to an on-premises environment? Assume that we need a Static IP and load balancer in front of the cluster?
* Any concept of availability zones for App Services in App Service Plans in App Service Kubernetes Environment? We can deploy AKS Nodes across regions. Assume that'd be too specific of a use case?
* Why didn't custom domain validation work? Should this item be disabled in the menu?