+++
Description = "When designing a solution, you want to be sure that your communications are secure and that your users can trust your application. Typically, SSL certificates can be useful for this purpose.That is well and good from a design and development perspective, but there may some management headaches when operating and governing the solution. How do you keep track of the certificates? How do you guarantee that they are kept secure? How do you ensure that certificates renew on time?"
date = 2016-09-12T12:00:00-00:00
PublishDate = 2016-09-12T12:00:00-00:00 # this is the datetime for the when the epsiode was published. This will default to Date if it is not set. Example is "2016-04-25T04:09:45-05:00"
title = "DigiCert Certificate Management through Azure Key Vault"
images = ["img/cloudwithchrislogo.png"]
Author = "chrisreddington"
# blog_banner = "img/episode/default-banner.jpg"
blog_image = "img/cloudwithchrislogo.png"
categories = ["Announcement"]
tags = ["Blogging"]
#series = ["The Nirvana of DevOps"]
#aliases = ["/##"]
+++
Azure Key Vault helps safeguard cryptographic keys and secrets used by cloud applications and services.  It streamlines the key management process, enabling you to maintain control of keys that access and encrypt your data.  Developers can create keys for development and testing in minutes, and then seamlessly migrate them to production keys.  Security administrators can grant (and revoke) permission to keys, as needed.

When designing a solution, you want to be sure that your communications are secure and that your users can trust your application. Typically, SSL certificates can be useful for this purpose.

That is well and good from a design and development perspective, but there may some management headaches when operating and governing the solution. How do you keep track of the certificates? How do you guarantee that they are kept secure? How do you ensure that certificates renew on time?

Azure’s Key Vault can help in this area. Recently, at Microsoft Ignite 2016– The team announced that Azure Key Vault supports management of certificates from supported Certificate Authorities (so far, this includes DigiCert, GlobalSign and WoSign). The process is well-documented. My personal domain name has an SSL validated by DigiCert, so I am going to use the previously linked blog process, and step through the process – showing the output along the way.

**1.** Firstly, log in to your Azure Account via the Resource Management PowerShell cmdlets. Double check which subscriptions you have access to, and that you have set a default subscription context.

![Step 1](/img/blog/digicert-certificate-management-through-azure-keyvault/step-1.jpg "Log into your Azure Account")]

**2.** Set variables for $vaultName, $resourceGroupName and $Location and use the command **New-AzureRmKeyVault -VaultName $vaultName -ResourceGroupName $resourceGroupName -Location $location** to create an Azure Key Vault, if you do not have one. As you can see in the screenshot below, my key vault already exists.

![Step 2](/img/blog/digicert-certificate-management-through-azure-keyvault/step-2.jpg "Set the variable names appropriately")

**3.** Now that you have an Azure Key Vault, you need to link this to your organisation for your Certificate Authority issuer. There are a few pieces of information needed to get this going. Specifically, for DigiCert, you can find this [here](https://www.digicert.com/azure-key-vault/connect-to-certcentral-quick-start-guide.htm).

**a.**  $orgIdentifier – The organisation ID associated with your CertCentral account on DigiCert.

**b.**  $apiKey – You need to create an API Key through DigiCert CertCentral interface. The API key is a relatively long alphanumeric string.

**c.**  $accountId – This is the id of your DigiCert account.

**d.**  $issuerName – Something that makes sense to you, for the issuer of your certificate with the Certificate Authority. In my case, I have used DigiCert and my initials, as it relates to my personal domain.

Finally, use the **Set-AzureKeyVaultCertificateIssuer** cmdlet with the associated parameters in the image below to ensure the Certificate Issuer is associated with your KeyVault account.  
**NOTE: These steps differ depending on your certificate authority. You should check these out on the Key Vault blog** [here](javascript:;)**, for either GlobalSign or WoSign.**

![Step 3](/img/blog/digicert-certificate-management-through-azure-keyvault/step-2.jpg "use the Set-AzureKeyVaultCertificateIssuer cmdlet")

**4.** Now that we have created the link to the issuer, we should create a certificate policy. The policy focuses on the information included in the certificate, when to renew it, and details on the Certificate Authority where the renewal takes place. Below, you can see that I have provided details for a wildcard to my personal domain name, that the certificate should be valid for 12 months and should be renewed 60 days before expiry.

**5.** Now use the details from the above policy, to create a certificate in the Key Vault. The CertificateName parameter (in my case, $certificateName) is the name of the certificate object as held in the Key Vault, not the name of the certificate with your Certificate Authority.

![Step 5](/img/blog/digicert-certificate-management-through-azure-keyvault/step-5.jpg "Use the details from the policy to create a certificate in KeyValt")

**6.** Once you have completed this step, you have submitted a request to DigiCert for the certificate, containing the details of the policy that you created earlier. You can check on the progress by using the cmdlet **Get-AzureKeyVaultCertificateOperation**, passing in a parameter for VaultName and CertificateName (e.g. as shown below). You can also see that the request has appeared in your DigiCert CertCentral account.

![Step 6](/img/blog/digicert-certificate-management-through-azure-keyvault/step-6.jpg "You have sent a signing request to DigiCert")


![Step 6-2](/img/blog/digicert-certificate-management-through-azure-keyvault/step-6-2.jpg "You have sent a signing request to DigiCert")

**7.** You may be contacted by the Certificate Authority to validate details of the organisation requesting the certificate or may need additional details for the Certificate Signing Request. Once complete, you can use the **Get-AzureKeyVaultCertificate** command, passing in the $vaultName and $certificateName parameters, to find the details needed to access the certificate from Key Vault.

![Step 6-2](/img/blog/digicert-certificate-management-through-azure-keyvault/step-6-2.jpg "Use the Get-AzureKeyVaultCertificate cmdlet to find details about your certificate")

**Congratulations**, you have now generated a certificate, which has been signed by DigiCert via Azure Key Vault. You can now go and use one of the documented ARM templates, to import Key Vault certificates into your resources. For example, see [here on using a certificate within Azure Web App](https://docs.microsoft.com/en-us/azure/app-service/configure-ssl-certificate).

However, if you are using the Resource Manager API to deploy your certificates from Key Vault to your resources, you need to ensure that the Key Vault Access Policy allows this;

**Set-AzureRmKeyVaultAccessPolicy -VaultName $vaultName -ServicePrincipalName <YourServicePrincipal> -PermissionsToSecrets get**

_**PS** – If you had not spotted it previously, the Azure Key Vault team have an official blog_ [_here_](https://azure.microsoft.com/en-gb/blog/tag/azure-key-vault/)

_**PPS** – This post bases itself on the blog written by the Key Vault team, [here](https://docs.microsoft.com/en-gb/archive/blogs/kv/manage-certificates-via-azure-key-vault). The aim of this post is to provide a few extra screenshots and focus on the process specifically for DigiCert. I have missed out a few details that are covered by the Key Vault team on certificate renewal. I have also missed out using Key Vault for SSL on Web apps, which are again worth checking out in the blog post referenced above._