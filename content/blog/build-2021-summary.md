---
Author: chrisreddington
Description: "If you follow the news around Microsoft, you've probably found it very hard to miss the fact that the Microsoft //Build conference happened this week. Microsoft //Build is their annual developer-focused conference, where they typically announce new features, updates and share their strategy as they evolve technologies. In this update, I'll provide a summary of the announcements that particularly stood out to me and give you some context around why. Whether that's announcements that excite me, features that I think are crucial to be adopted, etc. It's worth noting that I'll be focusing primarily on the Microsoft Azure Updates here, as that's my typical area of expertise!"
PublishDate: "2021-05-28T12:00:00Z"
image: img/cloudwithchrislogo.png
date: "2021-05-28T12:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Blogging
title: My Microsoft //Build 2021 Highlights
---
If you follow the news around Microsoft, you've probably found it very hard to miss the fact that the Microsoft //Build conference happened this week. Microsoft //Build is their annual developer-focused conference, where they typically announce new features, updates and share their strategy as they evolve technologies.

In this update, I'll provide a summary of the announcements that particularly stood out to me and give you some context around why. Whether that's announcements that excite me, features that I think are crucial to be adopted, etc. It's worth noting that I'll be focusing primarily on the Microsoft Azure Updates here, as that's my typical area of expertise!



The conference itself was split into several key pillars -

* Increase **developer velocity** with Microsoft's end-to-end developer platform
* Deliver new intelligent cloud-native apps by harnessing the power of **data and AI**
* Build cloud native-apps your way and **run them anywhere**
* Build the next generation of **collaborative apps** for hybrid work
* Build **differentiated SaaS apps** with the Microsoft cloud
* Building **digital twins, mixed reality and metaverse** apps

As you can likely gauge, there's something for everyone in the above list of topics! Announcements ranged from GitHub integrations with Azure, through to more Azure technologies being available through Azure Arc, and many enhancements to existing services. Let's walk through some of ones that I found important -

Before we do that though, I want to call out one that was special for me! I held my first presentation at Microsoft //Build, which means I've now presented at Microsoft Inspire, Ignite and Build - a very pleasing achievement. I had the pleasure of presenting alongside Dean Bryen and Carole Rennie Logan, for the [UK Community Session: Create friction-free code across all tools and frameworks](https://mybuild.microsoft.com/sessions/f2f7ecab-9a09-416c-b3c6-f20c8d1556f9).

* [Build cloud-native applications that run anywhere](https://azure.microsoft.com/en-us/blog/build-cloudnative-applications-that-run-anywhere/) is a blog post where Gabe Monroy announces that Azure App Service, Azure Functions, Azure Logic Apps, Azure Event Grid and Azure API Management are all capable of running in a Cloud Native Compute Foundation (CNCF) conformant Kubernetes cluster or Azure Arc deployment. Why is this important? You now have the ability to use all of the investments that have been made on Azure for your development needs in on-premises or even in AWS or GCP. This gives you the ability to have a consistent target environment across several physical environments, making it easier than ever to operate in a hybrid or multi-cloud environment. Of course, there's still a need for the Platform as a Service (PaaS) offerings, as you continue to give up a certain level of management responsibility there. As you use Azure Arc / Kubernetes as a deployment target, you'll be picking up some additional management responsibilities in exchange for the ability to run your cloud-native applications anywhere. This could open up some incredible hybrid scenarios where certain applications are unable to move directly to the cloud. Whether that's for compliance reasons, dependencies or organizational policy - You now have the option to have a consistent development environment on your terms.
  * **Blogs & Azure Updates**
    * [Gain flexibility to run open-source applications your way with Microsoft Azure](https://azure.microsoft.com/en-us/blog/gain-flexibility-to-run-open-source-applications-your-way-with-microsoft-azure/)
    * [Azure is the home for your enterprise Java applications](https://azure.microsoft.com/en-us/blog/azure-is-the-home-for-your-enterprise-java-applications/)
  * **Build Sessions**
    * Join Jeff Hollan, Bec Lyons and Gabe Monroy as they [dive into these announcements further](https://mybuild.microsoft.com/sessions/9134de08-15cc-4874-a9f0-61380adee9a4)
    * [Insights into successful Cloud Native projects (with Azure customers representing different industries)](https://mybuild.microsoft.com/sessions/b57d3743-1536-4993-aeeb-c2c1f103ea7f)
    * [Mark Russinovich on Azure innovation and more!](https://mybuild.microsoft.com/sessions/b7d536c1-515f-476a-83d2-85b6cf14577a)
    * [Hybrid is here to stay](https://mybuild.microsoft.com/sessions/96956597-0a95-43a5-8dd5-6a88fea7a3f8)
    * [How to build cloud-native solutions](https://mybuild.microsoft.com/sessions/7f39ca5d-eaa1-4271-b645-c3fae76e90f4)
    * [Ask the Experts: Learn why Azure is the cloud for Open Source developers](https://mybuild.microsoft.com/sessions/5a20a596-f38f-4eb3-8353-0393606c7c2a)
    * [Ask the Experts: Modernize applications using containers](https://mybuild.microsoft.com/sessions/f3bc100f-4871-4fef-8f61-13d4b8f4f337)
    * [Ask the Java at Microsoft Experts](https://mybuild.microsoft.com/sessions/aded32d6-b9e3-486c-a208-9ebcece1fbdd)
    * [Ask the Experts: Build consistent hybrid and multicloud applications with Azure Arc](https://mybuild.microsoft.com/sessions/9f56bc10-30bd-42e2-afc8-b61b22260c49)
    * [Run Open Source Applications your way with Microsoft Azure](https://mybuild.microsoft.com/sessions/b66c3a65-4d11-4c1b-9b29-4df873a8cf4d)
    * [.NET 6 deep dive; what's new and what's coming](https://mybuild.microsoft.com/sessions/70d379f4-1173-4941-b389-8796152ec7b8)
    * [Ask the Experts: The future of modern application development with .NET](https://mybuild.microsoft.com/sessions/43aba346-543e-4180-9b70-fff940935906)
    * [Modernize applications using containers](https://mybuild.microsoft.com/sessions/fd09c810-26ad-45bd-957b-1a70b74d93ec)
    * [Serverless: Event-driven application development](https://mybuild.microsoft.com/sessions/c52cef38-5c92-4bbd-ae49-f78ded025e04)
    * [Ask the Experts: Serverless: Event-driven application development](https://mybuild.microsoft.com/sessions/b229f07d-ec55-454d-b45c-498be31af648)
    * [Build your first web app with Blazor & Web Assembly](https://mybuild.microsoft.com/sessions/d8cac5a4-6fee-4e30-aa0b-58131f2e03bc)
    * [Accelerating enterprise Java workloads on Azure](https://mybuild.microsoft.com/sessions/2ce6782a-a7e4-4bcf-b4b6-1c9fd5d3e58a)
    * [Azure Kubernetes Service on Azure Stack HCI (AKS-HCI): An Azure Arc enabled turnkey App Platform for modern .NET apps](https://mybuild.microsoft.com/sessions/deb103b0-f892-47eb-9572-01b4ebcf1566)
    * [Building Well-Architected secure applications with Azure](https://mybuild.microsoft.com/sessions/f59a8722-4b5d-48ce-b380-8020d749f3fc)
    * [How to Monitor Your AKS Microservices With Datadog](https://mybuild.microsoft.com/sessions/3e3bfd7a-76e4-446f-b07f-845be8e509bb)
    * [Logic Apps: Powering the future of Integration](https://mybuild.microsoft.com/sessions/92bd3e12-fbf4-4278-b68f-fe776b02adfa)
    * [Microservices made easy with Dapr](https://mybuild.microsoft.com/sessions/a5648d1d-b523-4549-a2bc-a0ad226cfe2a)
    * [Power Fx: the Programming Language for Low Code and what it means for Developers](https://mybuild.microsoft.com/sessions/277e7de0-5d66-4b56-a18e-cfd6d50736e7)
    * [Run Linux web apps easily and securely on Azure App Service](https://mybuild.microsoft.com/sessions/77d6c20f-6b37-4643-9e31-6bcd6da4dad0)
    * [Transforming Minecraft Dungeons into a Great Mobile Cloud Gaming Experience](https://mybuild.microsoft.com/sessions/af56a2e4-bae2-4bfe-bbe2-67724bc4946d)
* [Increase Developer Velocity with Microsoft’s end-to-end developer platform](https://mybuild.microsoft.com/sessions/5ac55e8d-82e5-4b9f-b9bc-d51187761b42) - Join Amanda Silver, Donovan Brown and Julie Strauss as they talk through building productively with tools like Visual Studio, GitHub, Power Apps and Azure.
  * **Blogs & Azure Updates**
    * [New Azure capabilities to simplify deployment and management](https://azure.microsoft.com/en-us/blog/new-azure-capabilities-to-simplify-deployment-and-management/)
  * **Build Sessions**
    * [Supercharging Developer Velocity](https://mybuild.microsoft.com/sessions/01a26e1e-bbcf-4019-b037-3bbe6bace4d5)
    * [Core tools for a dev career: an introduction to Visual Studio Code and GitHub](https://mybuild.microsoft.com/sessions/0c6868e4-6a2c-4749-b3f5-b18ff76609c9)
    * [Empowering developers with powerful tooling and enabling frictionless app adoption](https://mybuild.microsoft.com/sessions/1b7f92ef-71a6-4a64-bece-001f94a2b7b8)
    * [Extending low code platforms with Azure](https://mybuild.microsoft.com/sessions/cf13cc4e-8819-4020-a723-764d6b8ed2cf)
    * [The new Developer experience – Fusion Teams; Low Code tools and more](https://mybuild.microsoft.com/sessions/deb38cba-5a05-4ed5-bee6-902900494c3b)
    * [Scaling DevSecOps with GitHub and Azure](https://mybuild.microsoft.com/sessions/87cc3b82-bc57-483d-90b3-e91e12516352)
    * [Ask the Experts: Scaling DevSecOps with GitHub and Azure](https://mybuild.microsoft.com/sessions/00548099-9850-4fff-9c6c-1eec5b1a8a7a)
    * [Ask the Experts: Infra as Code - Bicep](https://mybuild.microsoft.com/sessions/6967b6ae-4dad-417f-8a94-f3b53fed130e)
    * [You got your Windows on my Linux – Windows Subsystem for Linux](https://mybuild.microsoft.com/sessions/4f18d406-201e-4ed3-84db-9d8039253b7f)
    * [Enhancing the JavaScript Experience in Visual Studio](https://mybuild.microsoft.com/sessions/3536b229-c9e9-4d47-80c2-0420c4b73e5d)
    * [How to get end-to-end visibility across the full application development lifecycle for cloud-native applications in Azure.](https://mybuild.microsoft.com/sessions/d02f79dc-42e7-4719-8960-1e949678c767)
    * [Increase IT efficiency with new Azure Monitor capabilities](https://mybuild.microsoft.com/sessions/047cebf8-ae21-4ee6-930d-807aad3d034d)
    * [Increase your .NET Productivity with Visual Studio](https://mybuild.microsoft.com/sessions/befee7c4-5d8d-4686-bba7-9a38db1f7f90)
    * [Core tools for a dev career: an introduction to Visual Studio Code and GitHub](https://mybuild.microsoft.com/sessions/0c6868e4-6a2c-4749-b3f5-b18ff76609c9)
    * [What's new in Visual Studio Code](https://mybuild.microsoft.com/sessions/2575e7f5-b57b-487d-950f-ab91b7238f00)
    * [The future of modern application development with .NET](https://mybuild.microsoft.com/sessions/76ebac39-517d-44da-a58e-df4193b5efa9)
    * [Fusion Development 101: Professional Developer Essentials](https://mybuild.microsoft.com/sessions/b63f9291-f75a-423d-bff0-3cc26f89561f)
    * [Managing Technical Debt with Feature Flags](https://mybuild.microsoft.com/sessions/629d0a79-ea3f-491d-9221-ad5a1103e40e)
    * [Automated Database Testing: How Flyway, GitHub Actions and Spawn solve Azure migration challenges](https://mybuild.microsoft.com/sessions/38e53d47-616b-483c-b7fe-73a1f0b57d69)
* [Build differentiated SaaS apps with the Microsoft Cloud](https://mybuild.microsoft.com/sessions/3a820fb4-a38f-4bf8-b731-4411ed559807)
  * **Build Sessions**
    * [Application Authentication in the Microsoft Identity platform](https://mybuild.microsoft.com/sessions/9eadeef5-96a2-4fd2-ac9a-2a83deed93df)
    * [Build secure B2C applications​ with Azure AD External Identities](https://mybuild.microsoft.com/sessions/d73c7211-828e-420e-8726-4f3f835c6980)
    * [Ask the Experts: Build secure B2C applications with Azure AD External Identities](https://mybuild.microsoft.com/sessions/0445a624-bf08-4356-bad1-ad93ffa41772)
    * [Ask the Experts: Build cloud native apps of any scale with Azure Cosmos DB](https://mybuild.microsoft.com/sessions/4e027b40-a627-466b-8ad4-2d7a4b5cb634)
    * [Build serverless, full stack applications with Azure Static Web Apps and Azure SQL Database](https://mybuild.microsoft.com/sessions/8ee5d014-2396-48d5-9791-08bd1935388e)
    * [Securely managing cloud applications](https://mybuild.microsoft.com/sessions/2ca33985-4a95-4c48-aaef-742385b3c3f9)
    * [Develop apps with the Microsoft Graph Toolkit](https://mybuild.microsoft.com/sessions/27dbe743-5469-453c-b165-7c7c9250a937)
    * [Build great discovery & collaboration apps for Microsoft 365 with new Microsoft Graph connector & Adaptive Card capabilities.](https://mybuild.microsoft.com/sessions/337ee14e-a234-4c63-95dd-117dbe05d1bc)
    * [Build Zero Trust ready applications starting with the Microsoft identity platform](https://mybuild.microsoft.com/sessions/ae10ba39-53e5-4579-8d09-3d07506262f3)
    * [Three new ways to enrich your productivity apps with Microsoft Graph tools and data](https://mybuild.microsoft.com/sessions/16c9ee53-28a4-4e07-b84b-0cd27e5389f2)
    * [Down with sign-ups, just sign-in!](https://mybuild.microsoft.com/sessions/7d872ce4-ecab-41f7-ab44-7c0a7d498059)
    * [Enlighten your Windows app with Microsoft Graph](https://mybuild.microsoft.com/sessions/dfc5acf1-a877-4dd7-9508-bcd9635c216c)
*  [Build the next generation of collaborative apps for hybrid work](https://mybuild.microsoft.com/sessions/2915b9b6-6b45-430a-9df7-2671318e2161)
  * **Build Sessions**
    * [Azure Communication Services with Microsoft Teams interoperability](https://mybuild.microsoft.com/sessions/6aa74ce2-c5af-4bc0-9fcf-ce83ce6076fc)
    * [Learn how to build exciting apps across meetings, chats, and channels within or outside Microsoft Teams](https://mybuild.microsoft.com/sessions/512470be-15d3-4b50-b180-6532c8153931)
* [Harness the power of data and AI in your applications with Azure](https://azure.microsoft.com/en-us/blog/harness-the-power-of-data-and-ai-in-your-applications-with-azure/) - A blog post from John 'JG' Chirapurath summarising some of the key announcements in this space.
  * **Blogs & Azure Updates**
    * [Power your business applications data with analytical and predictive insights](https://azure.microsoft.com/en-us/blog/power-your-business-applications-data-with-analytical-and-predictive-insights/)
  * **Build Sessions**
    * [Harness the power of data in your applications with Azure](https://mybuild.microsoft.com/sessions/46f12ac0-4d74-4a53-95b1-22e406edd72c)
    * [Broadening Confidential Computing Support across Azure](https://mybuild.microsoft.com/sessions/0673aa81-6608-4bb3-b561-419431a4a506)
    * [Securely managing sensitive data in the cloud](https://mybuild.microsoft.com/sessions/61581ea8-f042-4e32-a088-ca993213f18b)
    * [How to use Azure Confidential Computing using Intel SGX to protect apps and solutions in the cloud](https://mybuild.microsoft.com/sessions/9b302a26-7867-4c83-8e28-d51524e27762)
    * [Signal Customer Story](https://mybuild.microsoft.com/sessions/dafb3b85-c8f8-4fdf-87ce-dc2c49411ea7)
    * [Ask the Experts: Build intelligent applications infused with world-class AI](https://mybuild.microsoft.com/sessions/edc5aef9-dec8-40d4-b704-028117f6350b)
    * [Ask the Experts: Azure Cognitive Search and its semantic capabilities](https://mybuild.microsoft.com/sessions/49af3ea9-d8d8-415b-9b46-f1e4c7c8f9d7)
    * [Add the power of search to your Microsoft Azure environment](https://mybuild.microsoft.com/sessions/e7b38930-7bd8-4d0f-bcbd-0993496c942e)
    * [Azure Maps Creator: Leverage Indoor Mapping Capabilities into your Apps](https://mybuild.microsoft.com/sessions/413dfe83-24f4-4d01-b641-cea89634d836)
* [Converging the physical and digital with digital twins, mixed reality, and metaverse apps](https://azure.microsoft.com/en-us/blog/converging-the-physical-and-digital-with-digital-twins-mixed-reality-and-metaverse-apps/)
  * **Build Sessions**
  * [Mixed Reality Application Development: Uncovering the right tools for the right job to enable MR scenarios](https://mybuild.microsoft.com/sessions/c786cf4d-6cf6-4b62-b720-f97eea919c5f)
    * [Ask the Experts: Welcome to Mixed Reality: Tools & strategies to approach MR development](https://mybuild.microsoft.com/sessions/6e69bf88-10ba-45a2-a2d0-bee591d703d5)
    * [Building Digital Twins, Mixed Reality and Metaverse Apps](https://mybuild.microsoft.com/sessions/f06287c8-8e56-452f-ae2f-e739c2be4870)
    * [Ask the Experts: Building Digital Twins, Mixed Reality and Metaverse Apps](https://mybuild.microsoft.com/sessions/77e93a0c-0354-4676-9fe9-959a54e4a604)
    * [Connect IoT data to HoloLens 2 with Azure Digital Twins and Unity](https://mybuild.microsoft.com/sessions/815a692f-398b-4772-ac18-c021f5116757)
    * [Build Secured IoT Solutions for Azure Sphere with IoT Hub](https://mybuild.microsoft.com/sessions/410f8ceb-4798-46a7-b03b-06e78e95fc9f)
    * [Dataverse for Developers](https://mybuild.microsoft.com/sessions/05e446d5-ca44-4a5d-824e-1f5bfd8e3b11)