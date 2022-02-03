---
Authors: 
- chrisreddington
Description: "As I'm using GitHub Actions to deploy my site to Azure, it made sense for me to build a GitHub action that I can use within my GitHub Actions workflow to cross-post content. That's exactly what I'll be talking about in this blog post!"
PublishDate: "2021-05-24T09:00:00Z"
image: img/cloudwithchrislogo.png
date: "2021-05-24T09:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- GitHub
- Blogging
- DevOps
title: Making a GitHub Action with Docker and .NET Core
---
As you may have read previously, my site [cloudwithchris.com](http://cloudchris.ws/2x) is hosted using Azure Storage Static sites. A common pattern when building static sites is to version control the assets and use Continuous Integration and Continuous Delivery to deliver the rendered compiled site to Azure. I've recently started creating an open source .NET Core command-line application which can take Hugo YAML files an input, convert the file contents to the appropriate Markdown for supported third-party services (currently [dev.to](http://cloudchris.ws/2y) and [medium.com](http://cloudchris.ws/2z)) by replacing local URLs, adding appropriate YouTube/Tweet rendering shortcodes and then posting directly to the API.

You may be able to see where this is going. As I have a Continuous Integration (CI) and Continuous Deployment (CD) process to deploy my production site to Azure, I also want to integrate cross-posting to third party blogging services into that process. That's why I decided on a .NET Core command-line application, so that the resulting executable can run cross-platform. It also means that I could feasibly run that executable within a deployment pipeline, whether that is in Azure Pipelines, GitHub Actions, Jenkins, GitLab, etc. As I'm using GitHub Actions to deploy my site to Azure, it made sense for me to build a GitHub action that I can use within my GitHub Actions workflow. That's exactly what I'll be talking about in this blog post!

In case you didn't already know, each GitHub Action is effectively just another GitHub repository. So whenever you use the actions/checkout action, you're actually referring to the [github.com/actions/checkout](http://cloudchris.ws/20) repository. Each of these "action repositories" will have an action.yml file at the repository root, to inform GitHub that it represents a GitHub action - more on that later though!

Let's first consider the options around [Creating an action GitHub Actions](http://cloudchris.ws/21). We can either -

* [Create a JavaScript action](http://cloudchris.ws/22 )
* [Create a composite run step action](http://cloudchris.ws/23)
* [Create a Docker container action](http://cloudchris.ws/24)

The ``JavaScript action`` could potentially work, though I had already begun building the command-line application so had taken a dependency on .NET Core. These JavaScript actions run by executing the JavaScript files in the "action repository" in the context of your codebase. So, if I wanted to cross-post my Cloud with Chris content, a JavaScript action downloaded from another repository would be executed in my [chrisreddington/cloudwithchris.com](http://cloudchris.ws/25) repository. That means that I would need to reinvent the wheel, as I already begun my implementation with .NET Core. For this reason, the JavaScript action approach was ruled out. The JavaScript action approach is beneficial though, as it can be run across the different GitHub Action runner platforms. Keep that in mind when we talk about the Docker container actions later.

Next up, the ``Composite run action``. This is a fancy way of saying "run a series of steps on the command-line". This could be an option as .NET Core applications can be executed on the command-line. The challenge with this approach is that we're at the mercy of whichever dependencies are installed on the GitHub Action Runner at a given point in time, not least if someone is running a self-hosted runner which would have a different set of dependencies and versions. I want the maintenance of this project to be as simple as possible. So, for that reason - I had ruled out the composite run action.

Finally, the ``Docker container action``. This is the option that I ultimately chose. If you're familiar with containers as a technology, you'll be aware that they can in consistent execution (rather than shipping just the application, or application delta, you also ship the container dependencies in the container image, which provides the consistency). A key point to note - the Docker Container action only works on a Linux GitHub Action runner as [documented here](http://cloudchris.ws/26). This isn't a significant problem, as I wanted to ensure the program executable is able to run cross-platform, not the GitHub action necessarily. So, this gives end users an option to run the command-line application on any platform manually. Alternatively, they can use the GitHub action in a job that uses a Linux runner. If an end user's GitHub action workflow is primarily Windows or Mac based, that's not a problem. They can define a new job specifically for the cross-posting aspects.

Great, so we have a decision on how to orchestrate the command-line application. What's next? For the Docker container action, we need two files - a ``Dockerfile`` and an ``Action metadata file``, also known as the ``action.yml`` file.

If you have built Docker images in the past, then this process will be no different to any others that you have built. For those new to Docker - A Dockerfile is effectively a set of instructions for building a Docker image. You specify a base image (another Docker image) to build on top of, and then specify a series of steps to be added on top of that image. Each instruction is another image layer, so when you look at the output of a Docker build step, you'll see lots of hashes relating to a new image for each layer.

As is usual good practice, the example below uses a multi-stage build to ensure that the final resulting image is lightweight and only contains the needed dependencies to run effectively. The main build step will use an image which contains the necessary tools to compile the source code into the needed application binary.

In summary, the following Dockerfile will run a multi-stage build -
* The first stage will:
  * Use the .NET Core SDK Docker Image as a base (This image will have all of the necessary tools needed to build a .NET Core application, so will be larger than the runtime image that will be used later on). An alias of ``build-env`` is provided for ease of reference later in the Dockerfile
  * Copy the files from the local directory into the work-in-progress container image.
  * Run the ``dotnet publish`` command
  * Label the container with appropriate metadata (Which is a [best practice for writing Dockerfiles](http://cloudchris.ws/27))
* The second stage will:
  * Use the .NET Core runtime image (This gives a couple of benefits, including reducing the size of the resulting image as it is not bloated with build tools, and also provides a smaller potential attack surface)
  * Copy the contents of the /out folder from the previous stage (``build-env``) to the current directory in the runtime image being created.
  * Set the container entry point as ``dotnet /HugoCrossPoster.dll``. This means, the container will only run for as long as the command-line application takes to run.

```Dockerfile
# Set the base image as the .NET 5.0 SDK (this includes the runtime)
FROM mcr.microsoft.com/dotnet/sdk:5.0 as build-env

# Copy everything and publish the release (publish implicitly restores and builds)
COPY . ./
RUN dotnet publish ./src/HugoCrossPoster.csproj -c Release -o out --no-self-contained

# Label the container
LABEL maintainer="Chris Reddington <chris@cloudwithchris.com>"
LABEL repository="https://github.com/chrisreddington/HugoCrossPoster"
LABEL homepage="https://github.com/chrisreddington/HugoCrossPoster"

# Label as GitHub action
LABEL com.github.actions.name="Hugo Cross Poster"
# Limit to 160 characters
LABEL com.github.actions.description="This is a work in progress .NET Core Console App to ease cross posting from Hugo to alternate formats."
# See branding:
# https://docs.github.com/actions/creating-actions/metadata-syntax-for-github-actions#branding
LABEL com.github.actions.icon="activity"
LABEL com.github.actions.color="orange"

# Relayer the .NET SDK, anew with the build output
FROM mcr.microsoft.com/dotnet/sdk:5.0
COPY --from=build-env /out .
ENTRYPOINT [ "dotnet", "/HugoCrossPoster.dll" ]
```

This is by no means intended to be a tutorial on how to write a Dockerfile. However, this is a well-trodden path and there are plenty of brilliant examples that exist in the community. Go ahead and check those out if you're interested!

Next up, the ``Action metadata file`` also known as the ``action.yml`` file. This defines the inputs, outputs and main entrypoint for your action. The schema of this file is well-defined in the [GitHub Actions docs](http://cloudchris.ws/28). To make it easier, I have included the ``action.yml`` file for my Hugo Cross Poster GitHub Action. It has a few main components -

* A series of metadata about the action. For example, the name, description and branding.
* A set of expected ``inputs`` that are required for the GitHub Action.
* It is possible to have a set of ``outputs``, if you plan to expose information to be passed to other GitHub Actions. I don't use this in my action.
* A ``runs`` property, which specifies:
  * The type of GitHub action that we are defining (i.e. Docker, JavaScript etc.)
  * The entry-point of our action (in our case ``Dockerfile`` is in the same directory as ``action.yml`` so this is simply ``Dockerfile``)
  * A set of arguments to be passed in to the Docker container. In this case, these are the arguments that are passed in to the .NET Core Command-Line application. If you look at the [source code for the application](http://cloudchris.ws/29), you'll notice that the flags match up.

```yaml
name: 'Hugo Crossposter'
description: 'This is a work in progress .NET Core Console App to ease cross posting from Hugo to alternate formats.'
branding:
  icon: activity
  color: orange
inputs:
  directoryPath:
    description:
      'Directory path of the content to be converted and crossposted.'
    required: true
  recursiveSubdirectories:
    description:
      'Boolean (True/False) on whether Recursive Subdirectories should be used for file access'
    required: true
    default: 'false'
  originalPostInformation:
    description:
      'Boolean (True/False) on whether the details of the original post (date/time, and canonical URL) should be included in the rendered Markdown.'
    required: false
    default: 'false'
  logPayloadOutput:
    description:
      'Boolean (True/False) on whether the output of the payload should also be outputted in the logs.'
    required: false
    default: 'false'
  searchPattern:
    description:
      'The search string to match against the names of files in path. This parameter can contain a combination of valid literal path and wildcard (* and ?) characters, but it doesnt support regular expressions. Defaults to *.md.'
    required: false
    default: '*.md'
  baseUrl:
    description:
      'Base URL of the site, not including protocol. e.g. www.cloudwithchris.com. This is used for converting any relative links to the original source, including the canonical URL.'
    required: true
    default: 'www.cloudwithchris.com'
  devtoToken:
    description:
      'DevTo Integration Token. This is required if crossposting to DevTo, as it forms part of the URL for the API Call.'
    required: false
  devtoOrganization:
    description:
      'DevTo Organization. This is not required. If you are posting as a user and want to associate the post with an organization, enter the organization ID (not username) here.'
    required: false
  mediumAuthorId:
    description:
      'Medium Author ID. This is required if crossposting to medium, as it forms part of the URL for the API Call.'
    required: false
  mediumToken:
    description:
      'Medium Integration Token. This is required to authorize to the Medium API.'
    required: false
  protocol:
    description:
      'Protocol used on the site. Options are either HTTP or HTTPS. This is used for converting any relative links to the original source, including the canonical URL.'
    required: false
runs:
  using: 'docker'
  image: 'Dockerfile'
  args:
  - "-f"
  - "${{ inputs.directoryPath }}"
  - "-r"
  - "${{ inputs.recursiveSubdirectories }}"
  - "-o"
  - "${{ inputs.originalPostInformation }}"
  - "-l"
  - "${{ inputs.logPayloadOutput }}"
  - "-s"
  - "${{ inputs.searchPattern }}"
  - "-u"
  - "${{ inputs.baseUrl }}"
  - "-d"
  - "${{ inputs.devtoToken }}"
  - "-g"
  - "${{ inputs.devtoOrganization }}"
  - "-a"
  - "${{ inputs.mediumAuthorId }}"
  - "-i"
  - "${{ inputs.mediumToken }}"
  - "-p"
  - "${{ inputs.protocol }}"
  ```

And that is ultimately the magic behind creating your own GitHub action. You need the source code for your action (i.e. JavaScript if using a JavaScript based GitHub action, a Dockerfile and associated application code if you're using a Docker-based GitHub action, any necessary dependencies if you're using a composite run step).

There are a couple of things to keep in mind as an author of a GitHub Action. I have no doubt that you plan to be a great open source citizen and want to maintain your open sourced GitHub Action. What happens if you update your GitHub Action and make some breaking changes, how do you make sure you don't break your consumers' workflows? Just like any other dependency, we use versioning. As the changes are being made within a Git repository, we're able to tag the commit hashes with a version number as needed. This is explained thoroughly in the [Using release management for actions](http://cloudchris.ws/3a) section in the GitHub docs.

If you have used any GitHub actions before, you may have noticed that some actions specify a number after the action name. For example, ``uses: actions/checkout@v2`` or ``uses: azure/login@v1``. This simply refers to the Git tag in the repository. You'll be able to see this in the releases section of a repository for a GitHub action (e.g. [actions/checkout releases](http://cloudchris.ws/3b) or [azure/login releases](http://cloudchris.ws/3c)).

Additionally, it's typically recommended to create a new GitHub action in a new GitHub repository. As taken from the GitHub docs - *If you're developing an action for other people to use, we recommend keeping the action in its own repository instead of bundling it with other application code. This allows you to version, track, and release the action just like any other software.*.

This is why the HugoCrossPoster is in its own repository, with the 'application code' for the cross poster. It is all self-contained, and can be versioned as an overall deliverable / unit of deployment. If you plan to use the command-line application in your own local environment, or on a machine elsewhere - that's absolutely fine. If you want to leverage it as a GitHub action within your workflow, that's absolutely fine too!

So there you go - This shows you how easy it is to go ahead and create a GitHub action based upon a .NET Core command-line application with thanks to the Docker container action type. If you're looking for additional guidance, there is a great example over on the [.NET Docs](http://cloudchris.ws/3d) which also helped me on my way to creating my GitHub action for the HugoCrossPoster - so Kudos to the team that wrote that one!

With that, thank you for reading this blog post - and I hope it was useful! I'd love to hear what GitHub actions you plan on building! Will you be using Docker and .NET Core, perhaps a JavaScript action or a composite run step action? Let me know on [Twitter, @reddobowen](http://cloudchris.ws/3e).

Thanks again, and until the next one - bye for now!