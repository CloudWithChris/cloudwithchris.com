---
Author: chrisreddington
Description: "In case you haven't heard, I'm planning to do some livestreams in the near future which are focused on live development / building in the cloud. I'm working on a few ideas, but if you have any suggestions - please throw them my way! To prepare for this, I've recently spent some time making sure my local development environment is in order. Windows Terminal and Windows Subsystem for Linux are a couple of the key tools in my local development environment. Windows Subsystem for Linux is the focus for this post."
PublishDate: "2021-09-06T07:00:00Z"
image: img/cloudwithchrislogo.png
date: "2021-09-06T07:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Linux
- Developer
- Windows Terminal
- Command-Line
title: Fix for .bashrc not executing on startup in Ubuntu on Windows Subsystem for Linux
---
In case you haven't heard, I'm planning to do some livestreams in the near future which are focused on live development / building in the cloud. I'm working on a few ideas, but if you have any suggestions - please throw them my way! To prepare for this, I've recently spent some time making sure my local development environment is in order. Windows Terminal and Windows Subsystem for Linux (WSL) are a couple of the key tools in my local development environment. Windows Subsystem for Linux is the focus for this post.

Windows Terminal is an awesome tool. I've written [another blog post](/blog/windows-terminal-productive-azure) on how it can make you productive with Azure. If you aren't familiar with it, or want some productivity tips - I definitely recommend checking out the post!

For my local development, I typically use Ubuntu in Windows Subsystem for Linux. From my university days, the computer terminals were all Linux-based (I think a flavour of Debian?), and I used a MacBook Pro throughout my time at university as well. I've built up a bit of a natural preference for the Linux command-line over that time, so it now comes more naturally to me. Hence why Windows Subsystem for Linux, Windows Terminal and Ubuntu are my go-to local command-line tools.

As you'll have guest from the title of this post, I've been having some issues with my Ubuntu environment. Nothing significant, but several papercuts that kept getting in the way of my productivity. I'll talk about other issues that I've been working on fixing in separate blog posts.

My goal was to have a consistent usability experience configured across the PowerShell and Ubuntu environments, considering tools such as [ohmyposh](https://ohmyposh.dev/docs/).

> **Tip:** If you haven't heard of ohmyposh, then it's worth looking into. [Scott Hanselman has done a brilliant write-up](https://www.hanselman.com/blog/my-ultimate-powershell-prompt-with-oh-my-posh-and-the-windows-terminal) on how you can get this setup in your environment.

I was following one of his posts, but couldn't seem to get the prompt working successfully. Scott's guidance and posts are awesome. I've followed the same post before, so I know that it works. There had to be something else going on in my environment. I made the changes to my ``~\.bashrc`` file as suggested throughout several blog posts and docs, but nothing seemed to reflect the modifications to ``~\.bashrc`` when a new shell was created. There was no pretty prompt, and my aliases were not working.

![Windows Terminal not showing any ohmyposh configuration](/img/blog/fix-bashrc-not-executing-wsl/terminal-misconfigured.jpg)

My next troubleshooting step is likely the one that most of you would try next. Clearly, there was something in my ``~\.bashrc`` preventing the full file from executing. It must be failing to execute mid-way through. Let's figure out how far the script is able to execute and debug from there.

The troubleshooting step? It's of course the highly-advanced (sarcasm intended!) use of echo statements throughout the script to identify at what stage the script is failing.

I shut down the WSL environment by using ``wsl.exe --shutdown`` and reopened a new Linux Tab in the Windows Terminal to ensure this was a fresh instance. I was surprised to find that none of my new echo statements were being invoked. This led me to the conclusion that ``~\.bashrc`` wasn't being executed.

![Windows Terminal not showing any ohmyposh configuration](/img/blog/fix-bashrc-not-executing-wsl/terminal-misconfigured.jpg)

I had to test the theory. To achieve this I executed the command ``source ~\.bashrc`` in the Ubuntu tab that had already been opened.

> **Tip:** The ``source`` command reads and executes the commands within a file, so would certainly load the ``~\.bashrc`` file, and set the desired configurations.
>
> Because of its nature,you make sure that you're only using the ``source`` command on a file where you trust the contents!

The series of echo statements printed into the terminal immediately. I was also greeted by a new, prettier looking prompt - ohmyposh! My theory held true. The ``~\.bashrc`` file wasn't being executed when a new Linux Tab was created in Windows Terminal. This was also the case when directly opening Ubuntu in WSL.

![Windows Terminal showing the ohmyposh configuration alongside the printed echo statements](/img/blog/fix-bashrc-not-executing-wsl/terminal-configured.jpg)

This led onto the next line of investigation. Why was it not executing on start up? As it turns out, there's a fairly simple explanation. The summary on the [man pages for bash](https://www.man7.org/linux/man-pages/man1/bash.1.html) gives us a clearer understanding of the potential problem (quoted below).

> When bash is invoked as an interactive login shell, or as a non-interactive shell with the ``--login`` option, it first reads and executes commands from the file ``/etc/profile``, if that file exists.  After reading that file, it looks for ``~/.bash_profile``, ``~/.bash_login``, and ``~/.profile``, in that order, and reads and executes commands from the first one that exists and is readable. The ``--noprofile`` option may be used when the shell is started to inhibit this behavior.

![Using the list command to view the hidden files within the home directory](/img/blog/fix-bashrc-not-executing-wsl/bash-files.jpg)

So, how is ``~/.bashrc`` being executed in the first place? After looking in my home directory, I could see that I have a file called ``~/.profile``. This file includes the following code snippet, which loads the ``~/.bashrc`` file if it exists.

```bash
# if running bash
if [ -n "$BASH_VERSION" ]; then
    # include .bashrc if it exists
    if [ -f "$HOME/.bashrc" ]; then
        . "$HOME/.bashrc"
    fi
fi
```

As a next step, I investigated the other files available in the home directory. I noticed that a ``~/.bash_profile`` file exists (which would have taken precedence over the other files). At some point, I must have followed a set of instructions to install some software and mistakenly created a .bash_profile file instead of putting it into the ``~/.bashrc`` file, as there was only one line (which was also present in my ``~/.bashrc`` file).

I then removed the ``~/.bash_profile`` file and used the ``wsl.exe --shutdown`` command to shutdown the WSL environment, so that I can determine whether this fixed the execution problem by launching a fresh environment. Guess what? It was the problem! After removing the superfluous ``~/.bash_profile`` file, the ``~/.bashrc`` file executed without any problems - The echo statements, ohmyposh, and all of the aliases that I had expected to be configured.

![After shutting down the WSL environment, relaunching the Windows Terminal gives the expected results](/img/blog/fix-bashrc-not-executing-wsl/terminal-startup-correctly-configured.jpg)

So what's the morale of the story here? Be careful when you're following instructions! Adding a file here or there can seem trivial, but might have some side-effects based upon the wider system. Map the instructions back to your own environment, and what makes sense (i.e. Whenever I made the change previously - rather than creating a ``~/.bash_profile`` and adding the contents, I should have just added them to the ``~/.bashrc`` file).

Now, I have an environment that has all of my aliases, ohmyposh and wider configuration preferences set up correctly. It's a small tweak, but has a big impact on my own productivity.

![Environment setup after removing the echo 'Checkpoint' statements, relaunching the Windows Terminal to give the final result with ohmyposh](/img/blog/fix-bashrc-not-executing-wsl/terminal-clean.jpg)

I hope that you've found this post useful. Have you had your own challenges getting your local Linux Environment setup? Let me know over on [Twitter, @reddobowen](https://twitter.com/reddobowen), perhaps we can share some tips!

In the meantime, thanks for reading this post. Stay tuned for some additional tips in the near future - bye for now!
