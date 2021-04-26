---
Author: chrisreddington
Description: "For some time, I've been using GitHub actions to update the content of my website (i.e. pages, descriptions, metadata, etc.). Through Hugo, these content updates automatically update the RSS feeds. This then makes the episodes appear in podcast services such as Apple Podcasts, Google Podcasts and Spotify. However, throughout that time I have been manually uploading the podcast files to my storage account. It wasn't a significant overhead, but I kept thinking that there must be a better way to do this. And, there is - I've implemented it! This blog post will walk you through why I've made these changes, how I made them and what the result is."
PublishDate: "2021-03-24T12:00:00Z"
image: img/cloudwithchrislogo.png
categories:
- Announcement
date: "2021-03-24T12:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- Technology
- DevOps
- Git
- Manual Approvals
- GitHub
- GitHub Actions
- Azure Storage
title: Using Git LFS to version Podcast Audio files and trigger releases to production with GitHub Actions
---
For some time, I've been using GitHub actions to update the content of my website (i.e. pages, descriptions, metadata, etc.). Through Hugo, these content updates automatically update the RSS feeds. This then makes the episodes appear in podcast services such as Apple Podcasts, Google Podcasts and Spotify. However, throughout that time I have been manually uploading the podcast files to my storage account. It wasn't a significant overhead, but I kept thinking that there must be a better way to do this. And, there is - I've implemented it! This blog post will walk you through why I've made these changes, how I made them and what the result is.

There are mixed opinions out there on storing large binary files directly within a Git repository. As a new user cloning the repository, I have to bring down every single binary that has been uploaded. So if I wanted to contribute to a repository from my local machine and there are tens or hundreds of podcast audio files, then I have to download all of those just to make my change. That requires more bandwidth, more time to download, and ultimately takes up more space on the end-user's machine, when that's likely not needed.

Enter Git LFS. [Git Large File Storage (LFS)](https://git-lfs.github.com/) is an open source extension to Git which focuses on the versioning of large files. How does it work? It's actually quite simple. Rather than storing the binary file directly in the Git repository, it stores a text file containing a pointer to a remote location. What's the remote location? The binary file that you originally wanted to version! (By the way, if you preferred something more visual - I have a brief 5 minute intro [available here](https://www.youtube.com/watch?v=4WftZfn9L_I)!)

Okay dear, user - how do you get set up with Git LFS? The Git LFS site I linked to above explains this really well, but I'll explain this in the context of my use case a little further. First off, I downloaded the extension [shown on the Git LFS site](https://git-lfs.github.com/) and followed the appropriate installation steps (e.g. for windows there is an .exe file, for my Ubuntu WSL environment I had to add a new repository and use apt-get to download the binaries). Once installed, you can go ahead and run the command ``git lfs install``. This is a one-time step that is needed for your local user account.

Great, now at this point - Git LFS is installed on your local machine. But how do you ensure that your repository is actually using Git LFS? **These next steps will need to be completed on a per-repository basis**. In other words, for each repository where you'd like to use Git LFS. In your local Git repository, use the command below:

```bash
git lfs track "*.mp3"
```

The above command allows us to track all mp3 files that are committed to the repository from this point onwards using Git LFS. Meaning, once they are pushed up to the remote location, they will not be stored directly in the Git repository but will be offloaded to a remote store /remote server and will be replaced in Git with a text pointer file. Before you do push the changes up, you'll need to make sure that you have added the .gitattributes folder to your repository using ``git add .gitattributes``. Why is this important? Take a look at the contents of my cloudwithchris.com .gitattributes folder below, and you'll see why. This is what is used to store the details of what Git LFS is tracking.

```bash
*.mp3 filter=lfs diff=lfs merge=lfs -text
```

Before we move on, let's also observe one important nuance in my wording above. The above command allows us to track all mp3 files that are committed to the repository **from this point onwards** using Git LFS. So, what about our historic commits/files that may match the file type we want to track (in this case mp3s)? Fortunately, there is a [git lfs migrate](https://github.com/git-lfs/git-lfs/blob/main/docs/man/git-lfs-migrate.1.ronn?utm_source=gitlfs_site&utm_medium=doc_man_migrate_link&utm_campaign=gitlfs) command available for this purpose, and there are [plenty of similar discussions over on Stack Overflow](https://stackoverflow.com/questions/47199828/how-to-convert-a-file-tracked-by-git-to-git-lfs).

After my research into how it all works, I was comfortable that the mp3 files would be tracked appropriately. This was the point where I brought the [podcast_audio folder](https://github.com/chrisreddington/cloudwithchris.com/tree/master/podcast_audio) into my local Git repository and added the contents of the folder to be staged / committed. The workflow is no different to adding or committing any other Git file, thanks to the metadata in the .gitattributes folder.

```bash
git add podcast_audio
git commit -m "Add Podcast Audio to repository"
git push origin main
```

As you'll likely know already - my [remote repository is hosted on GitHub](https://github.com/chrisreddington/cloudwithchris.com/). You'll be able to see an example of what this looks like [here](https://github.com/chrisreddington/cloudwithchris.com/blob/master/podcast_audio/31%20-%20Deploying%20to%20Azure%20through%20Terraform%20Cloud.mp3), but also including an example image below for readability. Notice that the file in GitHub now states **Stored with Git LFS**? That's how we know we've set it up appropriately!

![GitHub Page showing that the file is Stored with Git LFS](/img/blog/git-lfs-for-podcast-audio/git-lfs-in-github.jpg)

Great, that's step 1 done - getting the files into the repository. Now what about the process of uploading those to my storage account, for [www.cloudwithchris.com](https://www.cloudwithchris.com)? Well, once again - this is quite an easy problem to solve. We can use the usual approach that we have with GitHub actions, e.g. a push or pull rrquest trigger into a branch of our choice. After all, as we talked through earlier - we'll be able to detect that there are file changes in the repository (the text pointer files).

Originally, I had put together a naïve implementation to address this -

```yaml
name: "Podcast Audio Upload"
on: 
  push:
      branches:
        - master
      paths:
        - "podcast_audio/**"
jobs:
  publish:    
    environment:
      name: production.azure
      url: https://www.cloudwithchris.com  
    runs-on: ubuntu-latest
    env:
      PODCAST_AUDIO_LOCATION: $GITHUB_WORKSPACE/podcast_audio
    steps:    
    - uses: actions/checkout@v2
      with:
        lfs: true
        fetch-depth: 1
    - name: Azure Login
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}     
    - name: "Upload podcast files to storage that don't yet exist"
      uses: azure/CLI@v1
      with:
        azcliversion: 2.20.0
        inlineScript: |
          az storage blob upload-batch --account-name cloudwithchrisprod -d 'podcasts' -s ${{ env.PODCAST_AUDIO_LOCATION }} --if-unmodified-since 2020-01-01T00:00Z
```

Chris, that looks to do the job. You're triggering the workflow run when there is a change in the podcast_audio folder pushed to the master branch. You've also enabled the lfs flag, so that the runner will go ahead and pull down the binary files as needed. Why is that a naïve implementation? I'm glad you asked! As a GitHub user you have a storage and bandwidth quota for Git LFS data. You can find this in the [billing section](https://github.com/settings/billing) of your GitHub account.

![Example of the Git LFS Data Quota in GitHub Billing](/img/blog/git-lfs-for-podcast-audio/git-lfs-quota-github.jpg)

After my initial push, I pretty much wiped out my entire quota from a storage and bandwidth perspective. As you'll notice from the screenshot - I pay $5 a month for 1 data pack. For me, the benefit of streamlining my process and added cost is worth the extra time investment of dealing with manual uploads. I actually missed uploading quite a few episodes mp3 files over time! Remember, that I also have YouTube and other platforms to take care of, and this is all done in my spare time and community effort!

So going back to the point, why was that workflow naïve? Every time that the workflow runs, it's going to download all of the mp3 files held in the repository. Not a subset. Not only those that have changed since the last commit. All mp3 files. What does that mean? I have a growing problem. As I upload more and more mp3 files over time, I'm going to be eating away at that quota. You'll notice that the screenshot said I used 18.28GB of my 50GB data pack. My mp3 files aren't **that** big, as you'll see from the storage volume in the line above in the screenshot. Through testing this workflow with test MP3s, it became clear that this isn't going to scale. Each time I trigger the workflow, I'm going to consume an amount of bandwidth equal to the Git LFS storage size of the repository at the time. I needed a way to optimise this workflow, to only pull the files that had changed and ignore the rest. I had made a false assumption that the GitHub Checkout action would deal with this problem, and only pull the delta of the LFS changes.

At this point, what does any good technologist do? Consult others for guidance and learn from their experiences! I posted about this on Twitter, but didn't get much of a response back. I thought this was intriguing, which encouraged me to look into the problem even further.

{{< tweet 1368959935636267008 >}}

After digging into the [checkout action from GitHub](https://github.com/actions/checkout), it seemed that there weren't a set of properties that I could change to do exactly what I wanted. Fortunately, GitHub Actions allows you to use a set of composite run steps (a fancy way of saying run several steps from the command-line). I then broke the problem down into a series of steps, a bit like pseudocode.

1. First, download a copy of the repository but without fetching the large binary files - just fetch the pointers.
2. Identify which audio files changed in the commit that triggered the workflow to run.
3. Remove those audio files from the local repository, and checkout the repository again without any excludes (i.e. download the mp3 files and not the pointers). This is one of the crucial steps. I check out the repository once again. This time, Git detects that there are several files in place already and will only download the missing files. Prior to this checkout, we have removed the exclusion / filter of Git LFS files, so it will download the large files instead of the text pointers.
4. Remove the audio files in the local repository that have not changed. This serves a couple of purposes -
     1. Preventing the workflow from accidentally overwriting the previously uploaded mp3 files with pointer files as a replacement
     2. Optimising the step to upload podcast files to Azure Storage. In the naïve implementation, I found that this was taking a lot of time to run the condition evaluation on each file (in some cases the workflow took 10+ minutes to run across the 50 or so files, which would again be a growing problem). As a comparison, I recently uploaded two episodes of Cloud Drops content. The Podcast Audio MP3 workflow took less than 50 seconds to fully execute.

So let's get to the good part! What does that workflow look like now? You can [take a look over on the GitHub repository](https://github.com/chrisreddington/cloudwithchris.com/blob/master/.github/workflows/podcast-audio.yaml) for the latest and greatest, but here is a snapshot of it at time of writing -

```yaml
name: "Podcast Audio Upload"
on: 
  push:
      branches:
        - master
      paths:
        - "podcast_audio/**"
jobs:
  publish:    
    environment:
      name: production.azure
      url: https://www.cloudwithchris.com  
    runs-on: ubuntu-latest
    steps:    
    - name: Download Podcast files that are different from prior commit
      run: |
        git clone --config lfs.fetchexclude="/podcast_audio" https://github.com/chrisreddington/cloudwithchris.com.git ./
        fileschanged=$(git diff --name-only HEAD^ HEAD -- '*.mp3')
        echo "$fileschanged" > files.txt
        xargs -a files.txt -d'\n' rm
        git config --unset lfs.fetchexclude
        git checkout . 
        cd podcast_audio
        sed -i -e 's/podcast_audio\///g' ../files.txt
        for i in *; do
            if ! grep -qxFe "$i" ../files.txt
            then
                echo "Deleting: $i"
                rm "$i"
            fi
        done
    - name: Azure Login
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}     
    - name: "Upload podcast files to storage that don't yet exist"
      uses: azure/CLI@v1
      with:
        azcliversion: 2.20.0
        inlineScript: |
          az storage blob upload-batch --account-name cloudwithchrisprod -d 'podcasts' -s '/github/workspace/podcast_audio' --if-unmodified-since 2020-01-01T00:00Z  --auth-mode login
```

And with that, I have a workflow that will automatically upload the changed mp3 files to my Azure Storage Account. For good measure, I always have a manual approval condition in place. I also took the opportunity to upgrade to the latest and greatest version of the Azure CLI, which also allowed me to take advantage of the [Azure Storage Data-Plane Role Based Access Control functionality](https://docs.microsoft.com/en-us/azure/storage/common/storage-auth-aad-rbac-portal) which has recently been introduced. I appreciate that I can probably take this even further, but this addresses the main concern that I had - Building an automated workflow not just for my website content, but also for the mp3 files that are a tightly coupled part of that deployment process for podcast content. I've been able to optimise for the Git LFS Bandwidth / Storage, as well as decreasing the time that it takes to run that GitHub action overall.

So what do you think? Is this a challenge that you need to solve as well? Can you see this applying in other scenarios? I know that folks in the community have mixed opinions on Git LFS (e.g. [here](https://www.reddit.com/r/git/comments/mbndam/introducing_and_setting_up_git_lfs_large_file/) and [here](https://www.reddit.com/r/AZURE/comments/mbnce5/introducing_and_setting_up_git_lfs_large_file/)), but it certainly works for my scenario. Let me know your thoughts and experiences over [on Twitter](https://twitter.com/reddobowen) - I'd love to discuss further!

That's it for this week's blog. Until the next one, bye for now!