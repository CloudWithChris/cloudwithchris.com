---
Author: chrisreddington
Description: ""
PublishDate: "2021-06-02T08:02:00Z"
image: img/cloudwithchrislogo.png
date: "2021-06-02T08:02:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Technology
- DevOps
- Git
- Security
- How To
title: Using Azure Arc for Apps - Part 3
---
You should have already followed part 2. 

![Screenshot showing the Logic App Create Experience on Arc-Enabled Kubernetes Cluster through Azure Portal](/img/blog/azure-arc-for-apps-part-3/app-service-on-kubernetes-logic-apps-standard.jpg)
![Screenshot showing the Logic App Docker / Zip Deployment Requirements on Arc-Enabled Kubernetes Cluster through Azure Portal](/img/blog/azure-arc-for-apps-part-3/app-service-on-kubernetes-logic-apps-container-or-zip.jpg)

```bash
kubectl get po -n appservice --watch
NAME                                                            READY   STATUS    RESTARTS   AGE
christest-559548c65f-ncmkz                                      2/2     Running   0          55m
christest-559548c65f-wmv7p                                      2/2     Running   0          55m
christest-559548c65f-zf22d                                      2/2     Running   0          61m
christest-55d5-5f775bbdd-sdnpd                                  1/1     Running   0          42m
logic-app-k8s-7cc75474-xmxdd                                    2/2     Running   0          26m
rb-arc-aks-appsvc-k8se-activator-56f59bbb9f-h57q7               1/1     Running   0          75m
rb-arc-aks-appsvc-k8se-app-controller-86656c54cf-f8fmm          1/1     Running   0          75m
rb-arc-aks-appsvc-k8se-build-service-568b9d8d7-5pldl            1/1     Running   0          84m
rb-arc-aks-appsvc-k8se-envoy-586565cdbd-4qzvn                   1/1     Running   0          84m
rb-arc-aks-appsvc-k8se-envoy-586565cdbd-9hb5g                   1/1     Running   0          84m
rb-arc-aks-appsvc-k8se-envoy-586565cdbd-xpp7h                   1/1     Running   0          84m
rb-arc-aks-appsvc-k8se-http-scaler-569b995bb-2csvc              1/1     Running   0          84m
rb-arc-aks-appsvc-k8se-img-cacher-xc47s                         1/1     Running   0          84m
rb-arc-aks-appsvc-k8se-keda-metrics-apiserver-678946464-hvf67   1/1     Running   0          84m
rb-arc-aks-appsvc-k8se-keda-operator-b7488958-5h4t8             1/1     Running   0          84m
rb-arc-aks-appsvc-k8se-log-processor-jpt2m                      0/1     Error     15         84m
```

How does the App Service Plan come into all of this?

```bash
kubectl get deployment -n appservice
NAME                                            READY   UP-TO-DATE   AVAILABLE   AGE
christest                                       3/3     3            3           16h
christest-55d5                                  1/1     1            1           15h
logic-app-k8s                                   1/1     1            1           15h
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
appservice   logic-app-k8s    15h
```

```bash
kubectl describe apps.k8se.microsoft.com logic-app-k8s -n appservice
Name:         logic-app-k8s
Namespace:    appservice
Labels:       k8se.microsoft.com/environmentName=production
Annotations:  <none>
API Version:  k8se.microsoft.com/v1alpha1
Kind:         App
Metadata:
  Creation Timestamp:  2021-05-29T17:37:48Z
  Finalizers:
    app.finalizer.k8se.io
  Generation:  2
  Managed Fields:
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
            f:hostingFramework:
        f:config:
          .:
          f:appSettings:
            .:
            f:name:
          f:slotName:
        f:httpOptions:
          .:
          f:hostnames:
          f:port:
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
    Time:         2021-05-29T17:37:48Z
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
    Manager:         appcontroller
    Operation:       Update
    Time:            2021-05-29T17:40:10Z
  Resource Version:  25178
  UID:               2e3e0d08-5883-4782-b40f-502243d93f81
Spec:
  App Type:  functionapp,kubernetes,linux
  Code:
    Package Ref:
      Framework:          Node|12
      Hosting Framework:  azure-functions|3
  Config:
    App Settings:
      Name:     logic-app-k8s-secrets
    Slot Name:  production
  Http Options:
    Hostnames:
      Domain:                               logic-app-k8s.rb-arc-aks-appsv-gdcume5.westeurope.k4apps.io
    Port:                                   80
    Scm Ip Security Restrictions Use Main:  false
  Scale Options:
    Max Replica Count:  2
    Min Replica Count:  1
    Sku:                Kubernetes
    Stopped:            false
  Trigger Options:
Status:
  App Health Status:       Healthy
  App Provisioning State:  Provisioned
  Observed Generation:     2
Events:                    <none>
```

```bash
kubectl get approutes.k8se.microsoft.com -n appservice
NAME            AGE
christest       16h
logic-app-k8s   15h
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

Enter something here about jumping around all Azure Arc for App Services when I've been writing up this post, but here's what the resource group looks like.


![Screenshot showing the resources created in the Azure Portal](/img/blog/azure-arc-for-apps-part-3/app-service-on-kubernetes-apps-resource-group.jpg)