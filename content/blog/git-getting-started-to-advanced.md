---
Author: chrisreddington
Description: "I've recently released a few [Cloud Drops](./series/cloud-drops) episodes on Git related content. The ['Git Behind the Scenes'](./episode/cloud-drops-git-behind-scenes) video was incredibly well received. I'm also aware from my day-to-day discussions that there's a mix of experiences with Git, so also made a [Git 101 Video](./episode/cloud-drops-git-101). In this Cloud World that we live in, version control is an important concept beyond the 'traditional' developers. Infrastructure Engineers can now version control their Infrastructure as Code, or maintenance scripts. Data Scientists can version control their experiments and tests. And of course, developers can version control the code for their software. I also consider version control as a gateway or first step into the world of DevOps. Typically when you think about build and release pipelines, you are triggering based upon some version control event (e.g. a commit to a particular branch, a merge of a pull request, etc.). Over the past few years, I've seen a trend where organisations are looking to automate quickly, rather than relying on the traditional hands-on-keyboard approach which can be error-prone and time consuming. Whether we're talking in this context about Infrastructure as Code, Application Code, database schemas as code, data science experiments or any other representation as code, it doesn't matter. Typically the roads lead back to the same place, to version control. So in this blog post, I'll be covering the fundamentals of Git and how to get started. For anyone that is particularly inclined, there will also be some information on what's happening behind the scenes when you work through these fundamental concepts."
PublishDate: "2021-04-01T12:00:00Z"
image: img/cloudwithchrislogo.png
categories:
- Announcement
date: "2021-04-01T12:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Technology
- DevOps
- Git
title: Why use Git, How it Works and what's going on behind the scenes?
---
## Introduction

I've recently released a few [Cloud Drops](./series/cloud-drops) episodes on Git related content. The ['Git Behind the Scenes'](./episode/cloud-drops-git-behind-scenes) video was incredibly well received. I'm also aware from my day-to-day discussions that there's a mix of experiences with Git, so also made a [Git 101 Video](./episode/cloud-drops-git-101). In this Cloud World that we live in, version control is an important concept beyond the 'traditional' developers. Infrastructure Engineers can now version control their Infrastructure as Code, or maintenance scripts. Data Scientists can version control their experiments and tests. And of course, developers can version control the code for their software.

I also consider version control as a gateway or first step into the world of DevOps. Typically when you think about build and release pipelines, you are triggering based upon some version control event (e.g. a commit to a particular branch, a merge of a pull request, etc.). Over the past few years, I've seen a trend where organisations are looking to automate quickly, rather than relying on the traditional hands-on-keyboard approach which can be error-prone and time consuming. Whether we're talking in this context about Infrastructure as Code, Application Code, database schemas as code, data science experiments or any other representation as code, it doesn't matter. Typically the roads lead back to the same place, to version control. So in this blog post, I'll be covering the fundamentals of Git and how to get started. For anyone that is particularly inclined, there will also be some information on what's happening behind the scenes when you work through these fundamental concepts.

## Setting some context

So, first thing's first. How are things working today? In some scenarios, I've seen teams using services like FTP Servers or File Shares to collaborate amongst each other. While it **can** work, there are going to be challenges with this approach. What if several team members want to work on a file at the same time? How do you make sure that you can easily rollback to an earlier version if a change is made which causes the code to fail? I'm sure we've all been in this position at some stage before, where we'll name a file v1. Then we'll have a copy and name it v2. Then appears a v2-final, and a v2-final-FINAL. Is that really the cleanest approach, and easiest to understand for new team members joining? Unfortunately not, and that's where version control systems such as Git can really help.

Why Git? Before we address that point, let's make sure that you and I are on the same page! When I talk about Git, I am talking about the version control system. I'm not talking about a hosting provider such as GitHub, GitLab, Azure DevOps or Bitbucket. There is a difference between the two. Consider an analogy like a car park (or garage, depending on where you're from!). A car park/garage is the generic implementation/theme behind the scenes, but there are different car parks (or instances) where you could host/store your car. We're focusing on Git (the generic car park/garage in this case), as opposed to a specific hosting/service provider. There is the concept of multiple car parks in the town/city that you live (Remotes), and you likely have your own driveway / space to park your car when at home (local).

## About Git

With that context, let's move on. Firstly, Git is not new. It was initially released back in 2005 - but over recent years has picked up a lot of traction and interest. It was originally created by Linus Torvalds (yes, the same Linus Torvalds that created Linux). You may have heard about other version control systems before like SVN (Subversion), TFVC (Team Foundation Version Control) and others. These version control systems don't all work the same though. Some work in a centralized model, some work in a de-centralized model and some work in a distributed model.

Git works in a distributed model. What does this mean for you as an end-user? You have a copy of the full source code and history of changes on the local machine where you're working. It also then impacts the way in which you collaborate with other users. A centralised system may lock files, so that other users can't edit and make changes on the central server while you're working on them. Git deals with these changes by comparing the diffs of files, merging them where it can, and asking you as an end-user for assistance when it cannot do it automatically (We'll likely cover this in another blog post at some point!).

Git is optimised to be light-weight and performant. For those of you interested in the 'behind-the-scenes' view, you'll be able to glean a bit of insight into this from the **Behind the scenes (Not essential to the Git Foundations)** callouts as you read this blog. One of these considerations though, is how to deal with separation of concerns in your codebase. What if you're working on a certain set of features, and don't want to impact the main codebase? Surely the answer is that you'll need to take another copy of the codebase and work on that in isolation? Not quite. Git has a concept called 'branching' where you can work in an isolated area, or environment. We'll touch upon branching and what it is in this article, but won't be exploring it in depth. It is at least worth being aware of the concept here, and that this is one of the features that makes Git so powerful and as popular as it is today.

## Getting started with Git

Now we've set the scene, where do we start? First, we'll need to install the Git client on our local machine. The exact approach that you'll need to take will depend on which Operating System you're using. For example, in Windows - it's as simple as navigating to the [Git Homepage](https://git-scm.com/), downloading and using the installer to install Git onto your system. On Linux and MacOS based systems, you'll be able to use your local package management options (either apt-get or brew respectively) to install Git onto your system. Once you've done that, go ahead and run ``git --version`` and you should receive a message on the version of Git that is now installed on your system.

```bash
git --version
git version 2.31.1.windows.1
```

Next up, let's create a new folder. To begin with, this will just be a standard directory within the filesystem.

```bash
mkdir mynewfolder
cd mynewfolder

pwd

Path
----
D:\temp\mynewfolder

chris@reddobowen-home
❯ ls
```
To transform this folder into a Git repository, we have to Initialise the folder as a Git repository. Inside that new folder, we can use the command ``git init``.

```bash
git init
Initialized empty Git repository in D:/temp/mynewfolder/.git/
```

  > **Behind the scenes (Not essential to the Git Foundations)**
  >
  > The .git folder is the magic behind the Git repository. By default, this folder contains an output similar to the below:
  >
  > ```bash
  > cd .\.git\
  > ❯ ls
  > 
  >     Directory: D:\temp\mynewfolder\.git
  > 
  > Mode                 LastWriteTime         Length Name
  > ----                 -------------         ------ ----
  > d----          31/03/2021    10:12                hooks
  > d----          31/03/2021    10:12                info
  > d----          31/03/2021    10:12                objects
  > d----          31/03/2021    10:12                refs
  > -a---          31/03/2021    10:12            156 config
  > -a---          31/03/2021    10:12             73 description
  > -a---          31/03/2021    10:12             21 HEAD
  > ```
  >
  > * The hooks folder contains a set of scripts that perform actions when a given Git action is performed. There are a series of example scripts in this folder that you can review if interested.
  > * The info folder contains additional information about the repository. This can include information on refs for dumb transports, grafts, attributes, and sparse-checkout patterns. It also contains the exclude file inside it. This is a local file used for excluding some specific patterns in code that you don't want Git to read or execute. **This is different to the .gitignore file, as the .gitignore file is committed to the repository and therefore shared between contributors. The info folder is personal to your local repository.**
  > * The objects folder is likely what you would consider some of the magic behind Git. We'll explore this further in the blog post, but this contains a series of folders named with with two hexadecimal characters. This relates to the first two characters of a Git hash. The remainder of the hash is then a file within the folder. That file may represent either a commit, tree or blob.
  > * The refs folder is used for storing the 'references'. Refs are user-friendly names that point to a commit hash, representing a branch of a tag. The commit contains a hash to a tree, and the tree will contain information about other trees or blobs. (Start seeing how all of this comes together?)
  > * The config file contains any **local** git configuration overrides for this repository. Global configuration will be held elsewhere in the system, which will be different depending upon your OS.
  > * You shouldn't need to worry about the description file according to the [Git Homepage](https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain).
  > * The HEAD branch contains a pointer to the current HEAD of the ..... e.g. after running ``git init``, the HEAD file in my .git folder is ``ref: refs/heads/main``

  Now for the fun to begin! Let's go ahead and create a file in the main folder (For me, this was the mynewfolder. Make sure you're not in the .git folder if you were exploring that earlier). I'm going to create a file called helloworld.php with the following exciting implementation:

  ```php
  <?php
  echo "Helloworld";
  ?>
  ```

  We can run a command called ``git status`` to help us understand the current state of the repository. From the below output, you should notice that Git recognises the file has been created. However, it's not yet formally tracked within the Git version control. To do this, we'll need to take two steps:

  1. **Stage** the changes by using ``git add``. This is effectively saying "Hey Git, these are the files that I want to add to my local repository as part of my next set of updates".
      * You can use ``git add .`` to add the entire contents (and subdirectories) of the folder which you're currently in.
      * Alternatively, you can use ``git add helloworld.php`` to add only the helloworld.php file to the staging area.
      * There are tools such as [Visual Studio Code](https://code.visualstudio.com/) which also have Git integration built in, and take away some of the overhead of working on the command line.
  2. **Commit** the changes by using ``git commit -m "Your Commit Message Here"``. This is the step that adds the staged files to the local Git repository.
      * It is a common practice to make smaller commits often. If you're working on a feature update, make incremental changes with a larger amount of commits. This will give you the opportunity to revert to previous versions of the codebase if needed at a later point. When you combine this with a Continuous Integration (CI) system, this also allows you to get quick feedback through approaches like unit testing.

  ```bash
  git status
  On branch main

  No commits yet

  Untracked files:
    (use "git add <file>..." to include in what will be committed)
          helloworld.php

  nothing added to commit but untracked files present (use "git add" to track)

  git add helloworld.php
  warning: CRLF will be replaced by LF in helloworld.php.
  The file will have its original line endings in your working directory

  git status
  On branch main

  No commits yet

  Changes to be committed:
    (use "git rm --cached <file>..." to unstage)
          new file:   helloworld.php
  
  git commit -m "Initial version of helloworld.php file"
  [main (root-commit) e927bdc] Initial version of helloworld.php file
  1 file changed, 3 insertions(+)
  create mode 100644 helloworld.php
  ```

  Let's break that down one more time. We use ``git status`` to understand the current state of the repository. We then use ``git add`` to stage the files, informing Git which files we intend to formally commit to the repository. Then, to add them to the Git version control we use ``git commit``.

  > **Behind the scenes (Not essential to the Git Foundations)**
  >
  > How did that impact our .git folder? Let's focus in on a few areas.
  >
  > * There is a newly created logs folder. As we create additional commits, those logs are added into the relevant section. So for our commit a moment ago, it will be in logs/refs/heads/main. Yours may be logs/refs/heads/master depending upon what your initial branch is called. As you create additional branches, you will see additional files pop up in logs/refs/heads.
  >
  > ```bash
  > cd .\.git\
  > ❯ ls
  >
  >  Directory: D:\temp\mynewfolder\.git
  >
  > Mode                 LastWriteTime         Length Name
  > ----                 -------------         ------ ----
  > d----          31/03/2021    10:12                hooks
  > d----          31/03/2021    10:12                info
  > d----          31/03/2021    10:57                logs
  > d----          31/03/2021    10:12                objects
  > d----          31/03/2021    10:12                refs
  > -a---          31/03/2021    10:57             39 COMMIT_EDITMSG
  > -a---          31/03/2021    10:57            156 config
  > -a---          31/03/2021    10:12             73 description
  > -a---          31/03/2021    10:12             21 HEAD
  > -a---          31/03/2021    10:57            145 index
  >
  > cd logs
  > ❯ ls
  >
  > Directory: D:\temp\mynewfolder\.git\logs
  > 
  > Mode                 LastWriteTime         Length Name
  > ----                 -------------         ------ ----
  > d----          31/03/2021    10:57                refs
  > -a---          31/03/2021    10:57            223 HEAD
  > 
  > cat HEAD
  > 0000000000000000000000000000000000000000 e927bdcf4408d045c195c3cc4c39c04f94b7835f Chris Reddington <791642+chrisreddington@users.noreply.github.com> 1617184670 +0100   commit (initial): Initial version of helloworld.php file
  > 
  > cd refs
  > ls
  > 
  >  Directory: D:\temp\mynewfolder\.git\logs\refs
  > 
  > Mode                 LastWriteTime         Length Name
  > ----                 -------------         ------ ----
  > d----          31/03/2021    10:57                heads
  > 
  > cd heads
  >
  > ls
  >
  >  Directory: D:\temp\mynewfolder\.git\logs\refs\heads
  >
  > Mode                 LastWriteTime         Length Name
  > ----                 -------------         ------ ----
  > -a---          31/03/2021    10:57            223 main
  > 
  > cat main
  > 0000000000000000000000000000000000000000 e927bdcf4408d045c195c3cc4c39c04f94b7835f Chris Reddington <791642+chrisreddington@users.noreply.github.com> 1617184670 +0100              commit (initial): Initial version of helloworld.php file
  > ```
  >
  > * Next, let's focus on the refs folder. You will see that when you navigate to the refs/heads folder and ``cat`` the branch that you committed into, the output is a hash! How interesting!
  >
  > ```bash
  > cd .\.git\
  > ❯ ls
  >
  >  Directory: D:\temp\mynewfolder\.git
  >
  > Mode                 LastWriteTime         Length Name
  > ----                 -------------         ------ ----
  > d----          31/03/2021    10:12                hooks
  > d----          31/03/2021    10:12                info
  > d----          31/03/2021    10:57                logs
  > d----          31/03/2021    10:12                objects
  > d----          31/03/2021    10:12                refs
  > -a---          31/03/2021    10:57             39 COMMIT_EDITMSG
  > -a---          31/03/2021    10:57            156 config
  > -a---          31/03/2021    10:12             73 description
  > -a---          31/03/2021    10:12             21 HEAD
  > -a---          31/03/2021    10:57            145 index
  >
  > cd refs
  > ❯ ls
  >     Directory: D:\temp\mynewfolder\.git\refs
  > 
  > Mode                 LastWriteTime         Length Name
  > ----                 -------------         ------ ----
  > d----          31/03/2021    10:57                heads
  > d----          31/03/2021    10:12                tags
  >
  > cd heads
  > ❯ ls
  >
  > Directory: D:\temp\mynewfolder\.git\refs\heads
  > 
  > Mode                 LastWriteTime         Length Name
  > ----                 -------------         ------ ----
  > -a---          31/03/2021    10:57             41 main
  >
  > cat main
  > e927bdcf4408d045c195c3cc4c39c04f94b7835f
  > ```
  >
  > * Let's focus on the objects folder. When we navigate into the objects folder, we see multiple folders with two hexadecimal characters as their name. Navigating into the e9 folder, we see that there is a file with additional set of hexadecimal characters. Compare those initial two characters and the file name to the commit from the previous output. Notice anything interesting? That's it! The folder uses the first two characters of the commit hash, and the file name is the remainder of the hash. As you'll see from the output below, you can't just cat that file though. Instead, you need to use the command ``git cat-file`` with the ``-p`` (pretty print) flag passing in the entire commit hash. This allows you to see the contents of the file, which looks similar to a commit message!
  >   * Notice that in the commit file, there is another hash for a tree? If you navigate back to the objects folder, you'll see another subfolder that begins with the first two hexadecimal characters from the tree hash. You can run the ``git cat-file -p`` using the tree hash as well. This time, you should get a directory listing... and you've guessed it! Another hash, but this time relating to a blob.
  >   * You can go ahead and look in the objects folder for another subdirectory with a two hexadecimal character name. When you run ``git cat-file -p`` on the hash for the blob, you'll notice that this is the file that you version controlled a little earlier!
  >   * There are additional flags that you can use with ``git cat-file``. For example, ``-t`` is used to understand the type of file that the hash relates to. I'll leave this as an exercise for you to explore!
  >
  > ```bash
  > cd .\.git\
  > ❯ ls
  >
  >  Directory: D:\temp\mynewfolder\.git
  >
  > Mode                 LastWriteTime         Length Name
  > ----                 -------------         ------ ----
  > d----          31/03/2021    10:12                hooks
  > d----          31/03/2021    10:12                info
  > d----          31/03/2021    10:57                logs
  > d----          31/03/2021    10:12                objects
  > d----          31/03/2021    10:12                refs
  > -a---          31/03/2021    10:57             39 COMMIT_EDITMSG
  > -a---          31/03/2021    10:57            156 config
  > -a---          31/03/2021    10:12             73 description
  > -a---          31/03/2021    10:12             21 HEAD
  > -a---          31/03/2021    10:57            145 index
  >
  > cd objects
  > ❯ ls
  >     Directory: D:\temp\mynewfolder\.git\objects
  >
  > Mode                 LastWriteTime         Length Name
  > ----                 -------------         ------ ----
  > d----          31/03/2021    10:57                4c
  > d----          31/03/2021    10:56                72
  > d----          31/03/2021    10:57                e9
  > d----          31/03/2021    10:12                info
  > d----          31/03/2021    10:12                pack
  >
  > cd e9git l
  > ❯ ls
  > Directory: D:\temp\mynewfolder\.git\objects\e9
  >
  > Mode                 LastWriteTime         Length Name
  > ----                 -------------         ------ ----
  > -ar--          31/03/2021    10:57            169 27bdcf4408d045c195c3cc4c39c04f94b7835f
  >
  > cat .\27bdcf4408d045c195c3cc4c39c04f94b7835f
  > x☺��A♫� ►=�§{oB�▬�&Ƙx��☼(l♂     ��R��↨/���L2↓���↨�¶?�L♦��G�☻�B��� �?↓��∟♠Mh;�F�ť♀7��♠☼��ǹgu�Rt������}����2���f_�>2��♂p�§▼�-򚮴> §�O��G_�♫�C�▲�   ∟��^)�V���♥5▼�↕[�
  >
  > git cat-file -p e927bdcf4408d045c195c3cc4c39c04f94b7835f
  > tree 4c4fc3540401700de06c00ab39c0d3688ae0d200
  > author Chris Reddington <791642+chrisreddington@users.noreply.github.com> 1617184670 +0100
  > committer Chris Reddington <791642+chrisreddington@users.noreply.github.com> 1617184670 +0100
  > 
  > Initial version of helloworld.php file
  >
  > git cat-file -p 4c4fc3540401700de06c00ab39c0d3688ae0d200
  > 100644 blob 72430935d88f3884816e3f9386184baee9649722    helloworld.php
  >
  > git cat-file -p 72430935d88f3884816e3f9386184baee9649722
  > <?php
  > echo "Hello World";
  > ?>
  > ```
  >
  > Hopefully that enlightens you into the magic behind Git. Refs are user-friendly names that point to a commit hash, representing a branch or a tag. The commit contains a hash to a tree, and the tree will contain information hashes of other trees (i.e. subdirectories) or blobs.

Now, let's take stock. We've committed the change to our local repository, but we're not yet able to collaborate with anyone as it's on our local machine. This is where we'll need to use one of those "Garage Instances" or hosting providers that we talked about in the beginning of the blog. In this example, we'll use [GitHub](https://github.com/). If you have a GitHub account already, you can [Create a new repository](https://github.com/new). The repository name does not need to be the same as the folder that you created earlier. You are of course welcome to use an alternate provider if you have access to one, or can create a GitHub account and follow these steps!

![Create a GitHub repository](/img/blog/git-getting-started-to-advanced/create-github-repo.jpg)
  
  > **TIP**: When using these hosting providers, you'll often be asked if you want to initialize the repository with a README file, .gitignore file or potentially other options. If you're pushing an existing repository up (like we are in this instance), then you probably don't want to select those options, otherwise it will cause pain for you to try and merge those two repositories together. Instead, you could consider making those manually in your local repository as needed, and pushing those up to the remote repository.

Once you've hit create, you should be redirected to your newly created repository. You'll notice that you have a couple of options to initialise your repository -

* You can use existing tools like GitHub Desktop
* You can create a new repository on the command line and push that up
* You can push an existing repository from the command line (that's what we'll be doing here!)
* You can import code from another repository, such as Subversion, Mercurial or TFVC.

Fortunately, GitHub makes it very easy for us and provides us the commands needed to push up our local repository to the remote location. The commands below follows a few easy steps (Please don't copy/paste these from this blog post, but instead copy/paste from your GitHub repository - as your Remote Git Repository URL will be different to mine!) -

* Add a remote location to our local repository called origin, with the GitHub Repository URL
  * Origin and Upstream are a couple of standard naming conventions that you may see for the remote repository locations. You don't have to use these names, though they are very commonly used!
* Rename the current working branch to main
  * Main is considered a more friendly name than master due to the connotations of the word, so is now becoming a standard to adopt. For new repositories, GitHub adds in this line to encourage standardisation of the main terminology. When you install the Git client, there is also an option to override the default branch away from master. For my setup, I chose main (as you eagled-eyed readers may have already noticed!).
* Finally, push the main branch to the origin's remote location.
  * You may be challenged by the Git Credential Manager for credentials to authenticate, depending on the remote repository's permissions and whether you already have any cached credentials.

```bash
git remote add origin https://github.com/chrisreddington/potential-garbanzo.git
git branch -M main
git push -u origin main
```

  > **Behind the scenes (Not essential to the Git Foundations)**
  >
> * The logs folder is updated. Under the refs subdirectory of the logs folder, there is now a remotes folder, containing an origin subdirectory. This contains a file called main, which represents the current state of our remote repository.
  >
  > ```bash
  > cd .\.git\
  > ❯ ls
  >
  >  Directory: D:\temp\mynewfolder\.git
  >
  > Mode                 LastWriteTime         Length Name
  > ----                 -------------         ------ ----
  > d----          31/03/2021    10:12                hooks
  > d----          31/03/2021    10:12                info
  > d----          31/03/2021    10:57                logs
  > d----          31/03/2021    10:57                objects
  > d----          31/03/2021    12:11                refs
  > -a---          31/03/2021    10:57             39 COMMIT_EDITMSG
  > -a---          31/03/2021    10:57            156 config
  > -a---          31/03/2021    10:12             73 description
  > -a---          31/03/2021    12:11             21 HEAD
  > -a---          31/03/2021    10:57            145 index
  >
  > cd logs
  > ❯ ls
  >
  > Directory: D:\temp\mynewfolder\.git\logs
  > 
  > Mode                 LastWriteTime         Length Name
  > ----                 -------------         ------ ----
  > d----          31/03/2021    12:11                refs
  > -a---          31/03/2021    12:11            223 HEAD
  > 
  > cat HEAD
  > 0000000000000000000000000000000000000000 e927bdcf4408d045c195c3cc4c39c04f94b7835f Chris Reddington <791642+chrisreddington@users.noreply.github.com> 1617184670 +0100   commit (initial): Initial version of helloworld.php file
  > e927bdcf4408d045c195c3cc4c39c04f94b7835f 0000000000000000000000000000000000000000 Chris Reddington <791642+chrisreddington@users.noreply.github.com> 1617189090 +0100   Branch: renamed refs/heads/main to refs/heads/main
  > e927bdcf4408d045c195c3cc4c39c04f94b7835f e927bdcf4408d045c195c3cc4c39c04f94b7835f Chris Reddington <791642+chrisreddington@users.noreply.github.com> 1617189090 +0100   Branch: renamed refs/heads/main to refs/heads/main
  > 
  > cd refs
  > ❯ ls
  > 
  >  Directory: D:\temp\mynewfolder\.git\logs\refs
  > 
  > Mode                 LastWriteTime         Length Name
  > ----                 -------------         ------ ----
  > d----          31/03/2021    12:11                heads
  > d----          31/03/2021    12:11                remotes
  > 
  > cd remotes
  >
  > ls
  >
  >  Directory: D:\temp\mynewfolder\.git\logs\refs\remotes
  > 
  > Mode                 LastWriteTime         Length Name
  > ----                 -------------         ------ ----
  > d----          31/03/2021    12:11                origin
  >
  > cd origin
  > ❯ ls
  >
  >   Directory: D:\temp\mynewfolder\.git\logs\refs\remotes\origin
  >
  > Mode                 LastWriteTime         Length Name
  > ----                 -------------         ------ ----
  > -a---          31/03/2021    12:11            181 main
  > 
  > cat main
  > 00000000000000000000000000000000000000 e927bdcf4408d045c195c3cc4c39c04f94b7835f Chris Reddington <791642+chrisreddington@users.noreply.github.com> 1617189095 +0100   update by push
  > ```
  >
  > * Now for the refs folder in the .git folder. Once again, we will see a newly created remotes folder, which has an origin subdirectory (as that's what we called our remote location, with thanks to the handy set of commands from GitHub). Inside of that folder, there is a file called main which contains a hash relating to our initial commit once again.
  >
  > ```bash
  > cd .\.git\
  > ❯ ls
  >
  >  Directory: D:\temp\mynewfolder\.git
  >
  > Mode                 LastWriteTime         Length Name
  > ----                 -------------         ------ ----
  > d----          31/03/2021    10:12                hooks
  > d----          31/03/2021    10:12                info
  > d----          31/03/2021    10:57                logs
  > d----          31/03/2021    10:57                objects
  > d----          31/03/2021    12:11                refs
  > -a---          31/03/2021    10:57             39 COMMIT_EDITMSG
  > -a---          31/03/2021    10:57            156 config
  > -a---          31/03/2021    10:12             73 description
  > -a---          31/03/2021    12:11             21 HEAD
  > -a---          31/03/2021    10:57            145 index
  >
  > cd refs
  > ❯ ls
  > 
  >     Directory: D:\temp\mynewfolder\.git\refs
  >
  > Mode                 LastWriteTime         Length Name
  > ----                 -------------         ------ ----
  > d----          31/03/2021    12:11                heads
  > d----          31/03/2021    12:11                remotes
  > d----          31/03/2021    10:12                tags
  >
  > cd remotes
  > ❯ ls
  >
  > Directory: D:\temp\mynewfolder\.git\refs\remotes
  > 
  > Mode                 LastWriteTime         Length Name
  > ----                 -------------         ------ ----
  > d----          31/03/2021    12:11                origin
  >
  > cd origin
  > ❯ ls
  >
  >     Directory: D:\temp\mynewfolder\.git\refs\remotes\origin
  >
  > Mode                 LastWriteTime         Length Name
  > ----                 -------------         ------ ----
  > -a---          31/03/2021    12:11             41 main
  >
  > cat main
  > e927bdcf4408d045c195c3cc4c39c04f94b7835f
  > ```
  >
  > * Because we pushed the existing objects to a remote repository, there were no changes to the objects folder that we need to be concerned about.
  
So now we have managed to **push** the local repository to the remote location. Excellent. But what happens if someone makes a change on their own system and pushes it to the remote repository? How do we keep our local repository in sync with those changes? You've probably guessed... the opposite of push, is... pull!

Let's first simulate a remote change by editing the file on GitHub directly.

![Edit the Hello World File](/img/blog/git-getting-started-to-advanced/helloworld-edit.jpg)

If we first run ``git status``, the local repository doesn't know about the remote repository updates.

```bash
git status
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

If we run the command ``git remote update``, then Git will update the branches being tracked from the remote location without merging the changes in (i.e. helping us understand what may have changed at the remote location). When we run ``git status`` after that, it will now show that our local branch is 1 commit behind the remote location.

```bash
git remote update
Fetching origin
remote: Enumerating objects: 5, done.
remote: Counting objects: 100% (5/5), done.
remote: Total 3 (delta 0), reused 0 (delta 0), pack-reused 0
Unpacking objects: 100% (3/3), 681 bytes | 4.00 KiB/s, done.
From https://github.com/chrisreddington/potential-garbanzo
   e927bdc..609a83f  main       -> origin/main
  
❯ git status
On branch main
Your branch is behind 'origin/main' by 1 commit, and can be fast-forwarded.
  (use "git pull" to update your local branch)

nothing to commit, working tree clean
```

It's typical to use ``git pull`` to bring down the changes from the remote location to the local repository. It also goes ahead and merges them with your current branch. You don't need to run ``git remote update`` before hand though! That was just to help the flow of this blog post and demonstrate that there is not an 'automatic sync' between the local and remote repositories. Your mileage may vary though - Do be aware that some tools such as [Visual Studio Code may periodically fetch the remote changes](https://code.visualstudio.com/docs/editor/versioncontrol#_remotes).

```bash
git pull
Updating e927bdc..609a83f
Fast-forward
 helloworld.php | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)
 ```

> **TIP:**
> As an alternative, you could use ``git fetch`` followed by ``git merge`` instead of ``git pull``. ``git pull`` effectively combines these two commands together, fetching the changes to your local environment and merging them for you, doing some of the needed 'manual' work for you.

Right, so we've initialised a local repository. We've pushed up our changes to the remote repository. We've also managed to pull updates from the remote repository when the remote version has changed. But, what about pulling down an existing repository that doesn't yet exist on our local machine? That's where ``git clone`` comes in.

Let's go ahead and change to a another directory in our filesystem, which has not yet been initialised as a git repository. For me, I'm going to go one level higher than my **mynewfolder** directory, so D:\temp.

```bash
cd D:\temp
git clone https://github.com/chrisreddington/potential-garbanzo
```

> **TIP:**
> Notice that the default command of ``git clone`` creates a new folder with the name of the repository? You can change that behaviour by specifying a name after the URL, e.g.     ``git clone https://github.com/chrisreddington/potential-garbanzo mynewrepo2``

If you change into that newly created directory, you will find that you have the files from the remote Git repository, as well as a .git folder! (I'm using PowerShell as my Command Line for this post, rather than Linux. You may want to use ``ls -la`` if you are using Linux to verify the below.)

```bash
ls -Force

    Directory: D:\temp\potential-garbanzo

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d--h-          31/03/2021    14:59                .git
-a---          31/03/2021    14:57             36 helloworld.php
```

  > **Behind the scenes (Not essential to the Git Foundations)**
  >
  > Let's investigate the .git folder once again. We won't revisit old ground, but let's visit the objects folder.
  >
  > ```bash
  > cd .git
  > ❯ ls
  > 
  >    Directory: D:\temp\potential-garbanzo\.git
  >
  > Mode                 LastWriteTime         Length Name
  > ----                 -------------         ------ ----
  > d----          31/03/2021    14:57                hooks
  > d----          31/03/2021    14:57                info
  > d----          31/03/2021    14:57                logs
  > d----          31/03/2021    14:57                objects
  > d----          31/03/2021    14:57                refs
  > -a---          31/03/2021    14:57            312 config
  > -a---          31/03/2021    14:57             73 description
  > -a---          31/03/2021    14:57             21 HEAD
  > -a---          31/03/2021    14:59            145 index
  > -a---          31/03/2021    14:57            112 packed-refs
  >
  > cd refs
  > ls
  > 
  >    Directory: D:\temp\potential-garbanzo\.git\refs
  >
  > Mode                 LastWriteTime         Length Name
  > ----                 -------------         ------ ----
  > d----          31/03/2021    14:57                heads
  > d----          31/03/2021    14:57                remotes
  > d----          31/03/2021    14:57                tags
  >
  > ls
  > 
  >    Directory: D:\temp\potential-garbanzo\.git\refs\remotes
  >
  > Mode                 LastWriteTime         Length Name
  > ----                 -------------         ------ ----
  > d----          31/03/2021    14:57                origin
  >
  > cd origin
  > ls
  >
  >    Directory: D:\temp\potential-garbanzo\.git\refs\remotes\origin
  >
  > Mode                 LastWriteTime         Length Name
  > ----                 -------------         ------ ----
  > -a---          31/03/2021    14:57             30 HEAD
  > 
  > cat HEAD
  > ref: refs/remotes/origin/main
  > ```
  > Notice that we have the remotes folder, and then a structure of origin/main? This again shows that this recently cloned local repository is aware of the remote repository that exists at the remote location (GitHub in this instance). Feel free to explore the internal objects of this newly cloned Git repository's .git folder.

Now one additional point to consider. Remember that we said Git is decentralised? Notice that we have multiple versions of the repository on our machine now? If you've followed the steps through this blog post, then you will have seen that we originally started with a local repository, pushed it to GitHub, and then pulled it down under a different name. These two Git repositories each have a full copy of the repository contents and history, ultimately point back to the same remote location. This analogy could be similar to two different contributors each having their own machine, and needing to keep the changes in sync as changes continue to be pushed to the remote location.

So, there we go - a whistle stop tour of some of the basic commands that you will use when starting off with Git. We've only just scraped the surface though, we haven't covered topics like branching or merging, which could easily be a blog post in its own right (and probably will be - watch this space)!

So if you've enjoyed this content, please do let me know over on [Twitter (@reddobowen)](https://twitter.com/reddobowen) - so I can make sure to prioritise similar content in the future! Until the next time, thanks for reading - and bye for now!