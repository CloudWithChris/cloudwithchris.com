---
Author: chrisreddington
Description: "For some time now, I've been using Windows Terminal as my local terminal for interacting with my command-line tools for quite some time now. Whenever I'm demonstrating Kubernetes concepts or working with the Azure CLI, I'll likely have had the Windows Terminal open at some point. I always get questioned about which terminal that is, and how people can get access to it. I recently put together a Cloud Drop on How Windows Terminal can make YOU productive with Azure, so I figured it's time to also write up a blog post on the same! Whether you're a Developer, DevOps Engineer, Infrastructure Operations or Data Scientist, you've probably had to interact with a command-line terminal / shell at some point, so I hope this will be useful for you!"
PublishDate: "2021-04-07T08:00:00Z"
image: img/cloudwithchrislogo.png
date: "2021-04-08T08:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Technology
- DevOps
- Productivity
- Command-Line
- How To
- Windows Terminal
- Azure
- Azure Storage
title: Windows Terminal - What is it, and how can it make you productive with Azure?
---
For some time now, I've been using Windows Terminal as my local terminal for interacting with my command-line tools for quite some time now. Whenever I'm demonstrating Kubernetes concepts or working with the Azure CLI, I'll likely have had the Windows Terminal open at some point. I always get questioned about which terminal that is, and how people can get access to it. I recently put together a [Cloud Drop on How Windows Terminal can make YOU productive with Azure](/episode/cloud-drops-windows-terminal-productive-azure), so I figured it's time to also write up a blog post on the same! Whether you're a Developer, DevOps Engineer, Infrastructure Operations or Data Scientist, you've probably had to interact with a command-line terminal / shell at some point, so I hope this will be useful for you!

I'm amazed that as I'm writing this, that Windows Terminal is almost two years old now! [Windows Terminal was first announced in May 2019](https://devblogs.microsoft.com/commandline/introducing-windows-terminal/) in an early release stage, and later available in preview that Summer through the Microsoft Store. Windows Terminal is a modern app, decoupling the concept of a terminal and a shell, allowing you to spin up the shell that you prefer to use in a friendly, fast and productive terminal environment.

  > It's come a **long** way since the early days. To get an idea into the progress, scroll through the [release notes](https://github.com/microsoft/terminal/releases) and you'll get an idea! Speaking of which, the project is open source and available on GitHub. You can either raise an issue directly in the GitHub repository, or if you're more inclined to make a contribution, then you can [submit a pull request](https://github.com/microsoft/terminal/pulls), though make sure to read the [Contributor's Guide](https://github.com/microsoft/terminal/blob/main/CONTRIBUTING.md) first!

As the name implies, Windows Terminal is only available on Windows. From [this GitHub issue](https://github.com/microsoft/terminal/issues/563), it appears as though there is a dependency on components that are only available in Windows, hence no support on Linux/macOS at this time. So, pre-requisite number one is that you are running a machine with the Windows Operating System!

The preferred / recommended way of installing is by using the [Microsoft Store](https://aka.ms/terminal), as you will be able to update to the latest version of Windows Terminal through the Microsoft Store updates mechanism. However, it's also available through the Windows Package Manager CLI (winget), Chocolatey (unofficial), Scoop (unofficial). If you're so inclined, you can even build it manually from the GitHub Source code - all of these options are [detailed in the GitHub repository](https://github.com/microsoft/terminal#installing-and-running-windows-terminal).

When you launch the Windows Terminal, you should see a view similar to the below:

![Initial View of the Windows Terminal](/img/blog/windows-terminal-productive-azure/windows-terminal-initial.jpg)

  > **TIP**: Remember that Windows Terminal is just that - a terminal. You can interact with shells through this application (e.g. Windows PowerShell, PowerShell Core, Windows Subsystem for Linux, Azure Cloud Shell). So, for example - if you don't yet have Windows Subsystem for Linux (WSL) installed or PowerShell Core installed on your system, then you won't see those as profile options within Windows Terminal.
  >
  > I'll likely put together a separate blog post at a later point on installing and using WSL, as I'm a **big** fan of the feature. I find myself using Ubuntu as my primary command-line environment for most activities these days. Given that I have an M1 MacBook Pro arriving this week, I'll likely continuing working in the Linux environment for my own sanity!

For me, the magic behind Windows Terminal is the profiles. You can have multiple tabs open at the same time, and switch between those views. So, easily cycling between PowerShell and Ubuntu or Azure Cloud Shell and a local Windows Command Prompt.

  > **TIP**: If you hold ALT while clicking on one of the profiles, then the alternate profile will open within the **same** tab. See an example below.
  >
  > ![Multiple Profiles/Shells within a Tab](/img/blog/windows-terminal-productive-azure/windows-terminal-multishell-tab.jpg)

I'm writing this blog post using Windows Terminal Preview, Version 1.7.572.0, so you may see some slight differences depending upon which version of Windows Terminal you're using. The recent versions of Windows Terminal has shipped with a User Interface to edit the Windows Terminal Settings. If you don't see this, you may need to update this directly in JSON. Even with the User Interface option, you're still able to directly edit the JSON for the profiles as well if you prefer.

This setting area allows you to customise the appearance, the colour schemes and more of your Windows Terminal. More importantly (from my perspective), it allows you to create, update and delete profiles (Though I don't believe the UI allows you to delete the pre-made profiles). Why do I think the profiles settings are the most important? Well, did you notice something interesting in the first screenshot of this blogpost? There are two profiles relating to Virtual Machines!

When you create a profile, you can go ahead and specify a command-line activity to run. For example, Windows PowerShell runs ``powershell.exe``, Ubuntu runs ``wsl.exe -d Ubuntu-20.04``. But what about SSH?

  > **TIP**: Did you know that there is an OpenSSH Client available as an optional feature in Windows 10? You can find out more in [this article](https://www.howtogeek.com/336775/how-to-enable-and-use-windows-10s-built-in-ssh-commands/) on how to get this setup. This will allow you to use SSH directly within Windows, rather than needing to use Windows Subsystem for Linux.

Now, if you read the tip above - You'll now be realising that you in fact have a couple of ways that you can use SSH within Windows Terminal. Either by using Windows Subsystem for Linux, or directly within Windows if you have the OpenSSH optional feature installed. For you eagled eyed readers, you may have noticed in the first screenshot that I have both options configured!

![Configuring a profile to connect to an Azure Virtual Machine](/img/blog/windows-terminal-productive-azure/windows-terminal-ssh-connections.jpg)

You'll notice from the above image, that it's actually a fairly simple configuration -
* If we have the OpenSSH optional feature on Windows 10 installed, we can just use ``ssh username@virtualmachine``
* If we have Windows Subsystem for Linux installed, we can run SSH through the default configured WSL distro by using ``wsl.exe ssh user@virtualmachine``

The experience will work exactly as you expect. If you have a private key held in your .ssh folder, then you'll be able to use this in the respective environment. So for example, as I have both OpenSSH on Windows 10 installed, as well as Windows Subsystem for Linux, I have to have my keys available in the appropriate environment (either WSL, or Windows 10). From the screenshot below, you'll notice that I have different keys available in the different environments to illustrate the point.

![Listing of .ssh directories in WSL and Windows, showing different keys](/img/blog/windows-terminal-productive-azure/windows-terminal-ssh-keys.jpg)

Finally, you will also notice that [Azure Cloud Shell is available for you as a profile in Windows Terminal](https://devblogs.microsoft.com/commandline/the-azure-cloud-shell-connector-in-windows-terminal/).This is the same Azure Cloud Shell that you would connect to if you were in the Azure Portal, or if you connected directly to [https://shell.azure.com/](https://shell.azure.com/). The Azure Cloud Shell has [several tools installed by default](https://docs.microsoft.com/en-gb/azure/cloud-shell/features#tools) (including Git, Terraform, the Azure CLI and Kubectl).

Another great feature of Azure Cloud Shell is the ability to persist your files across sessions. When you first create an Azure Cloud Shell instance, you'll be prompted to either create or attach it to an existing Azure File Share in Azure Storage. The home directory is persisted in the file share (as an .img rather than as individual files), but beware - files outside of home are **not** persisted across sessions.

So let's just recap - In Windows Terminal, you can have a wealth of options available to you at your fingertips - Linux Environments, PowerShell, PowerShell Core, Windows Command Prompt, Access to Azure Cloud Shell with several common tools already installed, or easily running commands such as SSH by simply opening a profile, to connect to a Virtual Machine. I'm a huge fan of Windows Terminal, and would say I have it open on a daily basis appearing somewhere on my desktop. I'd encourage you to try it out, and have it as a friendly companion on your desktop too!

So, what are your next steps after installing it and setting up some profiles? I'd certainly suggest taking a look at the [Azure Docs, particularly on using Powerline](https://docs.microsoft.com/en-us/windows/terminal/custom-terminal-gallery/powerline-in-powershell) for example. [Scott Hanselman also wrote a brilliant blogpost](https://www.hanselman.com/blog/how-to-make-a-pretty-prompt-in-windows-terminal-with-powerline-nerd-fonts-cascadia-code-wsl-and-ohmyposh) on this, which is a common reference article that I use.

Are you a Windows Terminal Fan? How are you finding it? Any tips? Let's continue the discussion over on [Twitter @reddobowen](https://twitter.com/reddobowen), for all to join in and participate! So until the next blog post, thanks for reading - and bye for now!