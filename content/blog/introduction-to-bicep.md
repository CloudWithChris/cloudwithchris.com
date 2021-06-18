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
- DevsecOps
title: 'Introduction to Project Bicep - The evolution of ARM Templates'
---
# Introducing Azure Resource Manager (ARM) and ARM templates

Whether you've been working with Azure for some time, or only recently started - You will have likely heard of Azure Resource Manager (ARM) Templates. 

If not, let's do a brief level-set. ARM Templates are a type of Infrastructure as Code that allows you to define your Azure Infrastructure in Code in a declarative way. Rather than saying *how* you want things to be created (e.g. Azure CLI/PowerShell), you specify *what* you want to be created. Azure then 'makes it happen'.

Azure Resource Manager did not always exist in Azure though. Azure (known as project Red Dog) was first announced in October 2008, and initially released on in February 2010. Fast forward to //Build 2014 (as explained in this [blog post](https://azure.microsoft.com/en-gb/blog/azure-resource-manager-tools-preview/)), Microsoft announced the preview Azure Portal (the portal we're all used to now), as well as Azure Resource Manager.

Azure Resource Manager introduced several great benefits that we now take for granted, including - 

* A consistent management layer across all Azure Resource Providers
* Azure Resource Groups
* Azure Locks
* Azure Policy
* Azure Role-Based Access Control
* And last but not least, the ability to define your resources declaratively in templates rather than imperatively in scripts.

Overall, Azure Resource Manager significantly changed the game from a management and governance perspective when working with Azure Resources. (Can anyone else cast their mind back to working with individual resources in the classic portal, without any resource groups?)

> **Tip:** Azure Resource Manager is a **service**. You can see that it provides a number of features from the list above. However, there is an implied benefit compared with using a service like Terraform. As we're using a consistent management layer, we're able to tap in to the fact that ARM is able to store the current state of our environment as well. 
>
> So, unlike Terraform, we don't need to manage the state of our Infrastructure as Code deployments. That's handled for us by Azure Resource Manager and reduces the complexity of managing and Infrastructure as Code deployment.

## Why do ARM Templates need to evolve?

ARM Templates have certainly addressed the challenge of deterministic and declarative deployments. We can now write code that is a representation of **what** we want to deploy, rather than **how**. That means, we have simplified deployment logic and don't need to cover 'all the bases'. For example, in a PowerShell or Azure CLI script-based deployment, we'd then need to have a series of conditionals (e.g. If this resource already exists, do this, else do this...). With ARM templates, we define the desired state and can typically re-run the ARM template to ensure the resource configuration has not drifted away from the expected result.

Chris, that all sounds great - but you're hinting that ARM templates are evolving. What's the catch?

One of the common areas of feedback or painpoints was the language for ARM Templates. ARM Templates are written as JSON templates, and have a ``template language`` that can layer on top of that. JSON is typically about representing data (just like XML or similar), so it makes sense that we would 'represent' our deployment in some data format, so that we can achieve the desired-state deployment scenario. It achieves that goal. Though, a common piece of feedback was around ease-of-creating/usability for ARM templates.

* The tool didn't typically help you (e.g. intellisense functionality) author your templates
* Achieving certain scenarios (e.g. using ARM Template Functions, Variables and Parameters) could become a little complex and verbose
* Overall  templates could become very long and verbose very quickly

> **Note:** Visual Studio and Visual Studio Code tooling did improve, but the community still found it challenging to author these templates. If you weren't aware the [Azure Quickstart Templates Gallery](https://github.com/Azure/azure-quickstart-templates) exists to make it easier to get started quickly. These templates aren't necessarily production ready (so you'll need to tweak these to your specific scenario), but give you a great starting point across several scenarios.

As an example, here is an ARM template that I had written previously. This template is a ``Deployment Stamp`` pattern for an admin microservice that could be re-used to deploy across multiple Azure regions and environments.

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

You may have already heard about [Project Bicep](https://github.com/Azure/bicep). It's been around for some time (I believe since around summer of 2020). It's currently in version 0.4, but has been confirmed as ready for production-use since version 0.3. All resource types, apiVersions, and properties that are valid in an ARM template are equally valid in Bicep on day one (Note: even if Bicep warns that type information is not available for a resource, it can still be deployed).

> **Note:** Here is the exact wording from their GitHub repository -
>
> As of v0.3, Bicep is now supported by Microsoft Support Plans and Bicep has 100% parity with what can be accomplished with ARM Templates. As of this writing, there are no breaking changes currently planned, but it is still possible they will need to be made in the future.

The beauty of the Project Bicep implementation is that it builds upon the existing ARM investments that you will have. For example, you may have deployed your ARM templates using the ``az deployment group create -f {{templatefile}} -g {{resourcegroup}}`` command. Rather than passing a reference to your ARM template (.json file), you pass in a reference to a Bicep Template (.bicep file).

> **Tip:** Hopefully by now you've noticed the play on words of ``ARM`` (Azure Resource Manager) and ``Bicep``. That's where the name comes from :)

But wait - You're probably wondering at this point - "Do I have to choose either or?". No :) Bicep Templates actually decompile to ARM Templates.

> **Tip:** And what about your existing ARM templates? I don't believe there's any transpiling functionality right now. However, here is some additional context from the team from their GitHub repository.
>
> Note that while we want to make it easy to transition to Bicep, we will continue to support and enhance the underlying ARM Template JSON language. As mentioned in What is Bicep?, ARM Template JSON remains the wire format that will be sent to Azure to carry out a deployment.

So, don't worry - ARM templates are still going to be around! The idea of Project Bicep is a Domain Specific Language (DSL) layered over the top of an ARM template that makes it easier for us as humans / end-users to create these templates.

> **Tip:** You don't need to start from scratch either! The Azure Quickstart Templates Gallery is continuously growing, and doesn't just have ARM Templates (JSON), but also contains Bicep files as well. [See an example here](https://github.com/Azure/azure-quickstart-templates/search?p=5&q=bicep).

## Comparing ARM Templates (JSON) and Bicep

We won't go into a significant amount of depth, but the [Azure Docs](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/compare-template-syntax) have some excellent documentation comparing the JSON syntax with Bicep syntax.

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

```
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

```
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

```
resource functionTemplateDeployment 'Microsoft.Resources/deployments@2017-05-10' = {
  ...
}
```

Hopefully that gives you an indication of the simplicity of the Project Bicep Domain Specific Language. Less verbose, and a familiar feeling to the likes of Hashicorp Language (HCL) if you have used Hashicorp Terraform previously.

## I'm intrigued. How do I continue my journey?

Great! Some of the teams at Microsoft (including folks from my pervious team) have pulled together to create a [Microsoft Learn Learning Path on Bicep](https://docs.microsoft.com/en-us/learn/paths/bicep-deploy/). 

The above link will be a great resource to get started on your Bicep learning journey. 

As you progress, you'll likely want to review the [Bicep documentation](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/) to understand some of the core language features, best practices, etc.

As you author your own Bicep templates, you can use the [Visual Studio Code Bicep Extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-bicep) to gain intellisense on dot-properties, resource names and property values, snippets and other tricks to help you easily author your templates!

Finally, if you authored Azure Resource Manager (ARM) templates, you may have used the [Azure Templates Reference](https://docs.microsoft.com/en-us/azure/templates/). These references docs specify the optional/required properties for each Resource Provider and Resource Type. Not only do these docs specify the ARM Template Schemas, but also the Bicep schemas as well.

## Closing Thoughts