---
Author: chrisreddington
Description: ""
PublishDate: "2021-06-02T08:03:00Z"
image: img/cloudwithchrislogo.png
date: "2021-06-02T08:03:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Technology
- DevOps
- Git
- Security
- How To
title: Using Azure Arc for Apps - Part 4
---
You should have already followed part 2. You don't necessarilly need to have reviewed part 3 in order.


![Screenshot showing the Azure Functions create experience on an Arc-Enabled Kubernetes Cluster through Azure Portal](/img/blog/azure-arc-for-apps-part-4/app-service-on-kubernetes-functions-create.jpg)
![Screenshot showing the Azure Functions create experience on an Arc-Enabled Kubernetes Cluster through Azure Portal](/img/blog/azure-arc-for-apps-part-4/app-service-on-kubernetes-functions-create2.jpg)
![Screenshot showing the Azure Functions create experience on an Arc-Enabled Kubernetes Cluster through Azure Portal](/img/blog/azure-arc-for-apps-part-4/app-service-on-kubernetes-functions-create3.jpg)
![Screenshot showing the Azure Functions create experience on an Arc-Enabled Kubernetes Cluster through Azure Portal](/img/blog/azure-arc-for-apps-part-4/app-service-on-kubernetes-functions-createfinal.jpg)


![Screenshot showing the Azure Functions create experience on an Arc-Enabled Kubernetes Cluster through Azure Portal](/img/blog/azure-arc-for-apps-part-4/app-service-on-kubernetes-functions-creating.jpg)

```bash
kubectl get po -n appservice --watch
NAME                                                            READY   STATUS    RESTARTS   AGE
christest-55d5-5f775bbdd-sdnpd                                  1/1     Running   0          16h
christest-79944ffd49-5tzxt                                      2/2     Running   0          59m
christest-79944ffd49-7n5bs                                      2/2     Running   0          59m
christest-79944ffd49-ksb96                                      2/2     Running   0          59m
logic-app-k8s-7cc75474-xmxdd                                    2/2     Running   0          15h
rb-arc-aks-appsvc-k8se-activator-56f59bbb9f-h57q7               1/1     Running   0          16h
rb-arc-aks-appsvc-k8se-app-controller-86656c54cf-f8fmm          1/1     Running   0          16h
rb-arc-aks-appsvc-k8se-build-service-568b9d8d7-5pldl            1/1     Running   0          16h
rb-arc-aks-appsvc-k8se-envoy-586565cdbd-4qzvn                   1/1     Running   0          16h
rb-arc-aks-appsvc-k8se-envoy-586565cdbd-9hb5g                   1/1     Running   0          16h
rb-arc-aks-appsvc-k8se-envoy-586565cdbd-xpp7h                   1/1     Running   0          16h
rb-arc-aks-appsvc-k8se-http-scaler-569b995bb-2csvc              1/1     Running   0          16h
rb-arc-aks-appsvc-k8se-img-cacher-xc47s                         1/1     Running   0          16h
rb-arc-aks-appsvc-k8se-keda-metrics-apiserver-678946464-hvf67   1/1     Running   0          16h
rb-arc-aks-appsvc-k8se-keda-operator-b7488958-5h4t8             1/1     Running   0          16h
rb-arc-aks-appsvc-k8se-log-processor-jpt2m                      1/1     Running   193        16h
arc-aks-func-demo-6cd899c4bf-7sz22                              0/2     Pending   0          0s
arc-aks-func-demo-6cd899c4bf-7sz22                              0/2     Pending   0          0s
arc-aks-func-demo-6cd899c4bf-7sz22                              0/2     ContainerCreating   0          0s
rb-arc-aks-appsvc-k8se-log-processor-jpt2m                      0/1     Error               193        16h
rb-arc-aks-appsvc-k8se-log-processor-jpt2m                      0/1     CrashLoopBackOff    193        16h
arc-aks-func-demo-6cd899c4bf-7sz22                              1/2     Running             0          42s
arc-aks-func-demo-6cd899c4bf-7sz22                              2/2     Running             0          44s
```

![Screenshot showing the Azure Functions create experience on an Arc-Enabled Kubernetes Cluster through Azure Portal](/img/blog/azure-arc-for-apps-part-4/app-service-on-kubernetes-apps-resource-group.jpg)

```bash
kubectl get deployment -n appservice
NAME                                            READY   UP-TO-DATE   AVAILABLE   AGE
arc-aks-func-demo                               1/1     1            1           17m
christest                                       3/3     3            3           16h
christest-55d5                                  1/1     1            1           16h
logic-app-k8s                                   1/1     1            1           16h
rb-arc-aks-appsvc-k8se-activator                1/1     1            1           17h
rb-arc-aks-appsvc-k8se-app-controller           1/1     1            1           17h
rb-arc-aks-appsvc-k8se-build-service            1/1     1            1           17h
rb-arc-aks-appsvc-k8se-envoy                    3/3     3            3           17h
rb-arc-aks-appsvc-k8se-http-scaler              1/1     1            1           17h
rb-arc-aks-appsvc-k8se-keda-metrics-apiserver   1/1     1            1           17h
rb-arc-aks-appsvc-k8se-keda-operator            1/1     1            1           17h
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
NAMESPACE    NAME                AGE
appservice   arc-aks-func-demo   17m
appservice   christest           17h
appservice   christest-55d5      16h
appservice   logic-app-k8s       16h
```

```bash
kubectl describe apps.k8se.microsoft.com arc-aks-func-demo --namespace appservice
Name:         arc-aks-func-demo
Namespace:    appservice
Labels:       k8se.microsoft.com/environmentName=production
Annotations:  <none>
API Version:  k8se.microsoft.com/v1alpha1
Kind:         App
Metadata:
  Creation Timestamp:  2021-05-30T09:33:30Z
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
        f:config:
          .:
          f:appSettings:
            .:
            f:name:
          f:appStartupCmd:
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
    Time:         2021-05-30T09:33:30Z
    API Version:  k8se.microsoft.com/v1alpha1
    Fields Type:  FieldsV1
    fieldsV1:
      f:metadata:
        f:finalizers:
      f:spec:
        f:code:
          f:containers:
      f:status:
        .:
        f:appHealthStatus:
        f:appProvisioningState:
        f:observedGeneration:
    Manager:         appcontroller
    Operation:       Update
    Time:            2021-05-30T09:34:15Z
  Resource Version:  334551
  UID:               7bd55973-3bad-4309-9cf7-b9efc494a797
Spec:
  App Type:  functionapp,kubernetes,linux,container
  Code:
    Containers:
      Image:  mcr.microsoft.com/azure-functions/dotnet:3.0-appservice-quickstart
      Name:   http
      Ports:
        Container Port:  80
        Name:            http
        Protocol:        TCP
      Resources:
  Config:
    App Settings:
      Name:           arc-aks-func-demo-secrets
    App Startup Cmd:
    Slot Name:        production
  Http Options:
    Hostnames:
      Domain:                               arc-aks-func-demo.rb-arc-aks-appsv-gdcume5.westeurope.k4apps.io
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