---
Author: chrisreddington
Description: ""
PublishDate: "2021-06-18T12:00:00Z"
image: img/cloudwithchrislogo.png
date: "2021-06-18T12:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Infrastructure as Code
- Project Bicep
- ARM Templates
- Terraform
- DevOps
- DevSecOps
title: 'Introduction to Project Bicep - The evolution of ARM Templates'
---
## Introducing Azure Resource Manager (ARM) and ARM templates

Whether you've been working with Azure for some time, or only recently started - You will have likely heard of Azure Resource Manager (ARM) Templates.

Let's do a brief level-set, just in case you haven't heard of ARM templates! ARM Templates are a type of Infrastructure as Code. They allow you to define your Azure Infrastructure using code in a declarative way. Rather than saying *how* you want things to be created (e.g. Azure CLI/PowerShell), you specify *what* you want to be created. Azure then 'makes it happen'.

Azure Resource Manager hasn't always been a part of Azure though. Azure (originally known as project Red Dog) was first announced in October 2008, and initially released on in February 2010. Fast forward to //Build 2014 (as explained in this [blog post](https://azure.microsoft.com/en-gb/blog/azure-resource-manager-tools-preview/)), Microsoft announced the preview Azure Portal (the portal we're all used to now - known as the Ibiza portal at the time), as well as Azure Resource Manager.

Azure Resource Manager [introduced several great benefits](https://docs.microsoft.com/en-us/azure/azure-resource-manager/management/overview#the-benefits-of-using-resource-manager) that we now take for granted, including -

* A consistent management layer across all Azure Resource Providers
* Azure Resource Groups
* Azure Locks
* Azure Policy
* Azure Role-Based Access Control
* And last but not least - The ability to define your resources declaratively in templates rather than imperatively in scripts

Overall, Azure Resource Manager significantly changed the game from a management and governance perspective when working with Azure Resources. (Can anyone else cast their mind back to working with individual resources in the classic portal, without any resource groups?)

> **Tip:** Azure Resource Manager is a **service**. There is an implied benefit of using Azure Resource Manager templates compared with a framework like Terraform. As we're working through a consistent management layer, we're able to leverage the fact that ARM is able to store the current state of our environment as well.
>
> Therefore - unlike Terraform, we don't need to manage the state of our Infrastructure as Code deployments. The state is handled for us by Azure Resource Manager (as it's a service) and reduces the complexity of managing and Infrastructure as Code deployment.

## Why did ARM Templates need to evolve?

ARM Templates have certainly addressed the challenge of deterministic and declarative deployments. We can now write code that is a representation of **what** we want to deploy, rather than **how**. It provides us the benefit of simplified deployment logic and not needing to cover 'all the bases'.

> **Scenario**: Consider that we're creating Azure infrastructure by using a PowerShell or Azure CLI script-based script. We may need to have a series of conditionals scattered throughout the script (e.g. If this resource already exists, do this, else do this...). With ARM templates, we define the desired state and can typically re-run the ARM template to ensure the resource configuration has not drifted away from the expected result.

Chris, that all sounds positive - but you're hinting that ARM templates are evolving. Why did we need something else?

The complexity and verbosity of the ARM Template language was a common area of feedback. ARM Templates are written as JSON templates, and have a ``template language`` that layers on top of that. JSON is typically about representing data (like XML or similar), so it makes sense that we would 'represent' our deployment in a data format, so that we can achieve a desired-state deployment. ARM Templates achieve that goal, at the cost of an easy authoring/usability experience -

* The authoring tools typically didn't help you author your templates. This got better over time, but the community perception is that it was still 'too hard'
* Using capabilities of the ARM Template language (e.g. ARM Template Functions, Variables and Parameters) was not intuitive. From a readability standpoint, advanced scenarios could easily become complex and verbose
* This meant that overall, ARM templates could become very long and difficult to parse (from a human's perspective)

> **Note:** Visual Studio and Visual Studio Code tooling has kept getting better and better. But sometimes, getting started with ARM templates could be a challenge. This is where the [Azure Quickstart Templates Gallery](https://github.com/Azure/azure-quickstart-templates) comes in. It makes it easier to get started quickly. These templates aren't necessarily production ready (so you'll need to tweak these to your specific scenario), but they give you a great starting point across hundreds (seriously!) of scenarios.

As an example, here is an ARM template that I had written previously. This template is a [Deployment Stamp pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/deployment-stamp) for an admin microservice. The intent is that this template would be re-used across multiple Azure regions and environments.

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {             
        "aadClientId": {
            "type": "string",
            "metadata": {
              "description": "Client ID of the AAD B2C Application linked to the API Auth"
            }
          },            
          "aadB2cIssuer": {
              "type": "string",
              "metadata": {
                "description": "Link to the well known Open ID Configuration for the sign in policy."
              }
            },          
        "environmentName": {
            "type": "string",
            "allowedValues": [
                "dev",
                "test",
                "qa",
                "prod"
            ],
            "defaultValue": "dev",
            "metadata": {
                "description": "Define which environment is being deployed, this will affect naming convention of all resources"
            }
        },            
        "location": {
            "type": "string",
            "defaultValue": "[resourceGroup().location]",
            "metadata": {
                "description": "Location for all resources."
            }
        },   
        "servicePrincipalObjectId": {
            "type": "string",
            "metadata": {
                "description": "Object ID (not application ID) of the Azure DevOps service principal to be granted access to the KeyVault."
            }
        },        
        "tenantId": {
            "type": "string",
            "metadata": {
                "description": "GUID of the Azure AD Tenant associated with the Azure KeyVault"
            }
        },      
        "templateContainerUri": {
            "type": "string",
            "metadata": {
                "description": "URI of the Blob Storage Container containing the ARM Template building blocks"
            }
        },
        "templateContainerSasToken": {
            "type": "string",
            "metadata": {
                "description": "The SAS token of the container containing the ARM Template building blocks"
            }
        }
    },
    "variables": {
        "abbreviations": {
            "northeurope": "neu",
            "westeurope": "weu"
        },        
        "coreGlobalCogSvcSearchName": "[concat(variables('coreGlobalNamePrefix'), 'search')]",
        "coreGlobalResourceGroupName": "[concat(variables('coreGlobalNamePrefix'), 'rg')]",
        "coreGlobalNamePrefix": "[concat(variables('organisationPrefix'), '-core-', parameters('environmentName'), '-')]",
        "coreRegionalApimServiceName": "[concat(variables('coreRegionalNamePrefix'),'apim')]",
        "coreRegionalAppinsightsName": "[concat(variables('coreRegionalNamePrefix'), 'ai')]",
        "coreRegionalNamePrefix": "[concat(variables('organisationPrefix'), '-core-', parameters('environmentName'), '-', variables('abbreviations')[parameters('location')], '-')]",
        "coreRegionalResourceGroupName": "[concat(variables('coreRegionalNamePrefix'), 'rg')]",
        "serviceGlobalNamePrefix": "[concat(variables('organisationPrefix'),'-', variables('serviceName'), '-', parameters('environmentName'), '-')]",
        "serviceGlobalResourceGroupName": "[concat(variables('serviceGlobalNamePrefix'), 'rg')]",
        "serviceRegionalFunctionName": "[concat(variables('serviceRegionalNamePrefix'), 'func')]",
        "serviceRegionalKeyvaultName": "[concat(variables('serviceRegionalNamePrefix'), 'kv')]",
        "serviceRegionalNamePrefix": "[concat(variables('organisationPrefix'),'-', variables('serviceName'), '-', parameters('environmentName'),'-', variables('abbreviations')[parameters('location')], '-')]",
        "serviceRegionalNamePrefixWithoutDashes": "[replace(variables('serviceRegionalNamePrefix'), '-', '')]",
        "serviceResourceGroupName": "[concat(variables('serviceRegionalNamePrefix'), 'rg')]",
        "organisationPrefix": "th",
        "serviceName": "admin"
    },
    "resources": [
        {
            "apiVersion": "2017-05-10",
            "name": "functionDeployment",
            "type": "Microsoft.Resources/deployments",
            "properties": {
                "mode": "Incremental",
                "templateLink": {
                    "uri": "[concat(parameters('templateContainerUri'), 'function.json', parameters('templateContainerSasToken'))]",
                    "contentVersion": "1.0.0.0"
                },
                "parameters": {
                    "aadClientId": {
                        "value": "[parameters('aadClientId')]"
                    },
                    "aadB2cIssuer": {
                        "value": "[parameters('aadB2cIssuer')]"
                    },
                    "namePrefix": {
                        "value": "[variables('serviceRegionalNamePrefix')]"
                    },
                    "namePrefixWithoutDashes": {
                        "value": "[variables('serviceRegionalNamePrefixWithoutDashes')]"
                    },
                    "appInsightsResourceGroup": {
                        "value": "[variables('coreRegionalResourceGroupName')]"
                    },
                    "appInsightsName": {
                        "value": "[variables('coreRegionalAppinsightsName')]"
                    },
                    "cogSvcResourceGroup": {
                        "value": "[variables('coreGlobalResourceGroupName')]"
                    },
                    "cogSvcAccountName": {
                        "value": "[variables('coreGlobalCogSvcSearchName')]"
                    }
                }
            },
            "comments": "Downstream template to deploy an Azure Function (Function App, App Serivce Plan) and Storage Account, by using the Theatreers Azure Function Building Block."
        },
        {
            "apiVersion": "2017-05-10",
            "name": "[concat(variables('serviceRegionalFunctionName'), 'ServiceAPIsDeployment')]",
            "type": "Microsoft.Resources/deployments",
            "resourceGroup": "[variables('coreRegionalResourceGroupName')]",
            "properties": {
                "mode": "Incremental",
                "templateLink": {
                    "uri": "[concat(parameters('templateContainerUri'), 'apim-apis.json', parameters('templateContainerSasToken'))]",
                    "contentVersion": "1.0.0.0"
                },
                "parameters": {
                    "apimServiceName": {
                        "value": "[variables('coreRegionalApimServiceName')]"
                    },
                    "functionName": {
                        "value": "[variables('serviceRegionalFunctionName')]"
                    },
                    "serviceName": {
                        "value": "[variables('serviceName')]"
                    }
                }
            },
            "comments": "Downstream template to deploy an APIs for the given Microservice."
        },
        {
            "apiVersion": "2017-05-10",
            "name": "[concat(variables('serviceRegionalFunctionName'), 'BackendDeployment')]",
            "type": "Microsoft.Resources/deployments",
            "resourceGroup": "[variables('coreRegionalResourceGroupName')]",
            "properties": {
                "mode": "Incremental",
                "templateLink": {
                    "uri": "[concat(parameters('templateContainerUri'), 'apim-backend.json', parameters('templateContainerSasToken'))]",
                    "contentVersion": "1.0.0.0"
                },
                "parameters": {
                    "apimServiceName": {
                        "value": "[variables('coreRegionalApimServiceName')]"
                    },
                    "functionName": {
                        "value": "[variables('serviceRegionalFunctionName')]"
                    },
                    "functionResourceGroup": {
                        "value": "[variables('serviceResourceGroupName')]"
                    }
                }
            },
            "comments": "Downstream template to deploy an APIs for the given Microservice."
        },  
        {
            "apiVersion": "2017-05-10",
            "name": "keyVaultDeployment",
            "type": "Microsoft.Resources/deployments",
            "properties": {
                "mode": "Incremental",
                "templateLink": {
                    "uri": "[concat(parameters('templateContainerUri'), 'keyVault.json', parameters('templateContainerSasToken'))]",
                    "contentVersion": "1.0.0.0"
                },
                "parameters": {
                    "vaultName": {
                        "value": "[variables('serviceRegionalKeyvaultName')]"
                    },
                    "tenantId": {
                        "value": "[parameters('tenantId')]"
                    },
                    "objectId": {
                        "value": "[parameters('servicePrincipalObjectId')]"
                    }
                }
            },
            "comments": "Downstream template to deploy Azure KeyVault, associate it with a gievn tenant and assign a Service Principal Object with access to secrets. This uses the Theatreers Azure KeyVault Building Block."
        }
    ],
    "outputs": {}
}
```

Starting to understand? Perfect. Let's go ahead and introduce Project Bicep to the story!

## Introducing Project Bicep

You may have already heard about [Project Bicep](https://github.com/Azure/bicep) before reading this post. It's been around for some time (I believe since around Ignite 2020, or a little before). It's currently in version 0.4, but has been confirmed as ready for production-use since version 0.3. According to the GitHub repository, all resource types, apiVersions, and properties that are valid in an ARM template are equally valid in Bicep on day one (even if Bicep warns that type information is not available for a resource, it can still be deployed).

> **Note:** Here is the exact wording from the [Project Bicep GitHub repository](https://github.com/Azure/bicep) -
>
> As of v0.3, Bicep is now supported by Microsoft Support Plans and Bicep has 100% parity with what can be accomplished with ARM Templates. As of this writing, there are no breaking changes currently planned, but it is still possible they will need to be made in the future.

The beauty of the Project Bicep approach is that it **builds upon** the existing ARM investments that you will have.

For example, you may have deployed your ARM templates using the ``az deployment group create -f {{templatefile}} -g {{resourcegroup}}`` command. Rather than passing a reference to your ARM template (.json file), you pass in a reference to a Bicep Template (.bicep file).

> **Tip:** Hopefully by now you've noticed the play on words of ``ARM`` (Azure Resource Manager) and ``Bicep``. That's where the name comes from :)

But wait - You're probably wondering at this point - "Do I have to choose either or?" No! Bicep Templates actually decompile to ARM Templates.

> **Thought:** What about your existing ARM templates? I don't believe there's any transpiling functionality right now, so that you can easily move across from ARM Templates to Bicep. ARM Templates aren't going anywhere though! Here is some additional context from the team from the [Project Bicep GitHub repository](https://github.com/Azure/bicep).
>
> Note that while we want to make it easy to transition to Bicep, we will continue to support and enhance the underlying ARM Template JSON language. As mentioned in What is Bicep?, ARM Template JSON remains the wire format that will be sent to Azure to carry out a deployment.

So, don't worry - ARM templates are still going to be around! Project Bicep is a Domain Specific Language (DSL) layered over the top of the ARM Template JSON Language. This makes it easier for us as humans to author and read these templates.

> **Tip:** You don't need to start from scratch either! The Azure Quickstart Templates Gallery is continuously growing, and doesn't just have ARM Templates (JSON), but also contains Bicep files as well. [See an example here](https://github.com/Azure/azure-quickstart-templates/search?p=5&q=bicep).

## Comparing ARM Templates (JSON) and Bicep

We won't compare and contrast the template languages in a significant amount of depth, as the [Azure Docs](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/compare-template-syntax) have some excellent documentation comparing the JSON syntax with Bicep syntax.

However, to set the scene - Here are a few comparisons on Parameters, Variables and Resources between the ARM Template JSON Language and Bicep DSL.

### Parameters

In JSON you would set a parameter as follows -

```json
"parameters": {          
    "aadClientId": {
        "type": "string",
        "metadata": {
            "description": "Client ID of the AAD B2C Application linked to the API Auth"
        },
        "defaultValue": "DefaultValue",
    }
}
```

Whereas with Bicep -

```javascript
@description('Client ID of the AAD B2C Application linked to the API Auth')
param aadClientId string = 'DefaultValue'
```

### Variables

In JSON you would set a variable as follows -

```json
    "variables": {
        "coreGlobalCogSvcSearchName": "[concat(variables('coreGlobalNamePrefix'), 'search')]"
    }
```

Whereas with Bicep -

```javascript
var coreGlobalCogSvcSearchName = '${coreGlobalNamePrefix}search'
```

### Defining a Resource

In JSON you would define a resource as follows -

```json
"resources": [
    {
        "apiVersion": "2017-05-10",
        "name": "functionDeployment",
        "type": "Microsoft.Resources/deployments",
        ...
    },
````

Whereas in Bicep -

```javascript
resource functionDeployment 'Microsoft.Resources/deployments@2017-05-10' = {
  ...
}
```

Hopefully that gives you a peak into the simplicity of the Project Bicep Domain Specific Language. It's less verbose. For me, it provides a familiar feeling to the likes of Hashicorp Language (HCL) (if you have used Hashicorp Terraform previously).

### Re-working the ARM Template into the Bicep DSL

I've taken some time to re-write the above template as an Azure Bicep template. I used Visual Studio Code and the [VSCode Bicep Extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-bicep). It took me about 20 minutes from start-to-finish, without knowing a great deal of the new template language to get a completed template. This was with thanks to the amazing intellisense functionality that is built-in to the extension.

Here's an example of the template using the Bicep DSL -

```javascript
@description('Client ID of the AAD B2C Application linked to the API Auth')
param aadClientId string 

@description('Link to the well known Open ID Configuration for the sign in policy.')
param aadB2cIssuer string

@description('Define which environment is being deployed, this will affect naming convention of all resources')
@allowed([
  'dev'
  'test'
  'qa'
  'prod'
])
param environmentName string = 'dev'

@description('Location for all resources.')
param location string = resourceGroup().location

@description('Object ID (not application ID) of the Azure DevOps service principal to be granted access to the KeyVault.')
param servicePrincipalObjectId string

@description('GUID of the Azure AD Tenant associated with the Azure KeyVault')
param tenantId string

@description('URI of the Blob Storage Container containing the ARM Template building blocks')
param templateContainerUri string

@description('The SAS token of the container containing the ARM Template building blocks')
param templateContainerSasToken string

var abbreviations = {
  northeurope: 'neu'
  westeurope: 'weu'
}
var coreGlobalCogSvcSearchName = '${coreGlobalNamePrefix}search'
var coreGlobalResourceGroupName = '${coreGlobalNamePrefix}rg'
var coreGlobalNamePrefix = '${organisationPrefix}-core-${environmentName}-'
var coreRegionalApimServiceName = '${coreGlobalNamePrefix}apim'
var coreRegionalAppInsightsName = '${coreGlobalNamePrefix}ai'
var coreRegionalNamePrefix = '${organisationPrefix}-core-${environmentName}-${abbreviations[location]}-'
var coreRegionalResourceGroupName = '${coreRegionalNamePrefix}rg'
var serviceGlobalNamePrefix = '${organisationPrefix}-${serviceName}-${environmentName}-'
var serviceGlobalResourceGroupName = '${serviceGlobalNamePrefix}rg'
var serviceRegionalFunctionName = '${serviceGlobalNamePrefix}func'
var serviceRegionalKeyvaultName = '${serviceGlobalNamePrefix}kv'
var serviceRegionalNamePrefix = '${organisationPrefix}-${serviceName}'
var serviceRegionalNamePrefixWithoutDashes = replace(serviceRegionalNamePrefix, '-', '')
var serviceResourceGroupName ='${serviceRegionalNamePrefix}rg'
var organisationPrefix = 'th'
var serviceName = 'admin'

// Downstream template to deploy an Azure Function (Function App, App Serivce Plan) and Storage Account,
// by using the Theatreers Azure Function Building Block.
resource functionDeployment 'Microsoft.Resources/deployments@2017-05-10' = {
  name: 'functionDeployment'
  properties: {
    mode: 'Incremental'
    templateLink: {
      uri: '${templateContainerUri}function.json${templateContainerSasToken}'
      contentVersion: '1.0.0.0'
    }
    parameters: {
      aadClientId: aadClientId
      aadB2cIssuer: aadB2cIssuer
      namePrefix: serviceRegionalNamePrefix
      namePrefixWithoutDashes: serviceRegionalNamePrefixWithoutDashes
      appInsightsResourceGroup: coreRegionalResourceGroupName
      appInsightsName: coreRegionalAppInsightsName
      cogSvcResourceGroup: coreGlobalResourceGroupName
      cogSvcAccountName: coreGlobalCogSvcSearchName
    }
  }
}

// Downstream template to deploy an APIs for the given Microservice.
resource serviceAPIsDeployment 'Microsoft.Resources/deployments@2017-05-10' = {
  name: 'ServiceAPIsDeployment'
  resourceGroup: coreRegionalResourceGroupName
  properties: {
    mode: 'Incremental'
    templateLink: {
      uri: '${templateContainerUri}apim-apis.json${templateContainerSasToken}'
      contentVersion: '1.0.0.0'
    }
    parameters: {
      apimServiceName: coreRegionalApimServiceName
      functionName: serviceRegionalFunctionName
      serviceName: serviceName
    }
  }
}

// Downstream template to deploy an APIs for the given Microservice.
resource backendDeployment 'Microsoft.Resources/deployments@2017-05-10' = {
  name: 'backendDeployment'
  resourceGroup: coreRegionalResourceGroupName
  properties: {
    mode: 'Incremental'
    templateLink: {
      uri: '${templateContainerUri}apim-backend.json${templateContainerSasToken}'
      contentVersion: '1.0.0.0'
    }
    parameters: {
      apimServiceName: coreRegionalApimServiceName
      functionName: serviceRegionalFunctionName
      functionResourceGroup: serviceResourceGroupName
    }
  }
}

// Downstream template to deploy Azure KeyVault, associate it with a gievn tenant and assign a Service Principal Object with access to secrets. 
// This uses the Theatreers Azure KeyVault Building Block.
resource keyVaultDeployment 'Microsoft.Resources/deployments@2017-05-10' = {
  name: 'keyVaultDeployment'
  properties: {
    mode: 'Incremental'
    templateLink: {
      uri: '${templateContainerUri}keyVault.json${templateContainerSasToken}'
      contentVersion: '1.0.0.0'
    }
    parameters: {
      value: serviceRegionalKeyvaultName
      tenantId: tenantId
      objectId: servicePrincipalObjectId
    }
  }
}
```

That's quite a difference isn't it? I personally find the Bicep approach a lot easier to read. It's much more concise in comparison to the JSON-based ARM template as well. With thanks to the improved tooling, I even discovered that I had one variable that I wasn't using (``serviceGlobalResourceGroupName``) - so could do some further optimisation of my template as well!

## I'm intrigued. How do I continue my journey with Bicep?

Great! Here are a few resources to get you going -

* Some colleagues at Microsoft (including folks from my previous team) have pulled together a [Microsoft Learn Learning Path on Bicep](https://docs.microsoft.com/en-us/learn/paths/bicep-deploy/). This is a great resource to get started on your Bicep learning journey.
* As you start to understand the Bicep DSL, you'll likely want to review the [Bicep documentation](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/) to understand some of the core language features and best practices.
* As you begin to author your own templates using the Bicep DSL, you can use the [Visual Studio Code Bicep Extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-bicep). This gives you intellisense on dot-properties, resource names and property values as well as snippets and other tricks to help you easily author your templates!
* Finally, you may have used the [Azure Templates Reference](https://docs.microsoft.com/en-us/azure/templates/) if you authored Azure Resource Manager (ARM) templates in the past. These reference docs specify the optional/required properties for each Resource Provider and Resource Type. They now include information on the Bicep DSL Schemas for each Resource Type.

## Closing Thoughts

I'm excited at the opportunity that Project Bicep presents. As you can see from the above template, there's a great deal of simplicity compared with ARM Templates - both from a readability and a verbosity perspective. The tools are getting better, and there's a very active and thriving community. If you're interested in taking part, I'd encourage you to review the [Azure Bicep GitHub Repository](https://github.com/Azure/bicep), where you can also find additional references and community projects around Bicep.

So, what are your thoughts on Project Bicep? Will you be using the Bicep DSL in your own deployments? Let's continue the discussion over on [Twitter, @reddobowen](https://twitter.com/reddobowen).

Thanks for reading this one. If you'd like to see more on Project Bicep, and certain implementations / scenarios - Please let me know! Otherwise, until the next post - Thanks for reading and bye for now!
