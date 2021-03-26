---
Author: chrisreddington
Description: Cloud Governance seems to have come up a few times over the past few
  weeks, so I wanted to post a short, sharp blog about it!
PublishDate: "2017-02-25T12:00:00Z"
image: img/cloudwithchrislogo.png
categories:
- Announcement
date: "2017-02-25T12:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Azure
- Governance
- RBAC
- Resource Tags
- Resource Policies
- Subscription Management
title: Azure Scaffold - Governance Recommendations
---
The topic seems to have come up a few times over the past few weeks, so I wanted to post a short, sharp blog about it!

_How should I structure my Azure Subscription Hierarchy?_  
There is no "one right way" to answer this question. Your best bet is to first familiarise yourself with the [Azure enterprise scaffold - prescriptive subscription governance](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-manager-subscription-governance) documentation.

* How do you currently approach this in your team/organisation?
* Using the Azure enterprise scaffold documentation, what approach would fit best with your team/group?

The Azure Scaffold documentation provides guidance around Subscription Hierarchy, Role Based Access Control, Azure Policies, Resource Tags / Locks and more.

It is worth considering all of these points as part of your cloud governance strategy;

* Efficient use of [Role Based Access Control](https://docs.microsoft.com/en-us/azure/active-directory/role-based-access-control-what-is) and [Resource Locks](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-lock-resources) could help accidental deletion of resources (Yes, this is something that I have seen in the wild!)
* Would you give all of your team unrestricted access to machines in your data centre? No? Then why would you give them administrator access to a subscription in the cloud? Use the principle of least privilege, and use the [Role Based Access Control](https://docs.microsoft.com/en-us/azure/active-directory/role-based-access-control-what-is) functionality built into Azure.
* [Resource Tags](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-using-tags) can help you track ownership of resources. It provides you with a mechanism to tag resources (key/value pair), based upon keys and values of your choosing. Typical examples include the owner, cost centre, environment and more. _Resource tags can also help you in tracking your costs, as you can filter down cost based upon tags._
* [Resource Policies](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-manager-policy) can help you control the deployment of your resources. Rather than focusing on the permissions of a user (i.e. Role Based Access Control), policies determine the rules that govern the deployment of resources. As an example, I could set a policy across a Resource Group or Subscription that [prevents me from deploying resources into North Europe](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-manager-policy#policy-examples). However, this does not retrospectively apply to existing resources - This is only for the deployment of new resources.
* [Resource Policies can be powerful when combined with Resource Tags](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-manager-policy-tags). You can either Deny, Audit or Append actions. For example, you could refuse a deployment from taking place, unless the user has included particular Tags (e.g. owner and cost centre) as part of the deployment.

Are you using these features already? Is there something that works for you that you would like to share? Let me know on Twitter, [@reddobowen](https://www.twitter.com/reddobowen)!