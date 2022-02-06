<!-- omit in toc -->
# Contributing

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution. It will make it a lot easier for us maintainers and smooth out the experience for all involved. The community looks forward to your contributions. 🎉

> And if you like the project, but just don't have time to contribute, that's fine. There are other easy ways to support the project and show your appreciation, which we would also be very happy about:
> - Star the CloudWithChris.com GitHub repository
> - Share our content on your favourite social media channels
> - Refer this project in your project's readme
> - Mention the project at local meetups and tell your friends/colleagues
> - Contribute ideas to the content backlog in [GitHub Issues](https://github.com/CloudWithChris/cloudwithchris.com/issues/new/choose).
> - Submit a topic proposal to be a guest, using the guidance in the Readme.

<!-- omit in toc -->
## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Your First Code Contribution](#your-first-code-contribution)
- [Improving The Documentation](#improving-the-documentation)
- [Styleguides](#styleguides)
- [Commit Messages](#commit-messages)
- [Join The Project Team](#join-the-project-team)


## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behaviour by private messaged on Twitter to @reddobowen.

## I Have a Question

> If you want to ask a question, we assume that you have read the available Documentation in the README file.

Before you ask a question, it is best to search for existing [Issues](../../issues) that might help you. In case you have found a suitable issue and still need clarification, you can write your question in this issue. It is also advisable to search the internet for answers first.

If you then still feel the need to ask a question and need clarification, we recommend the following:

- Open an [Issue](../../issues/new).
- Provide as much context as you can about what you're running into using the helpful form.

We will then take care of the issue as soon as possible.

## I Want To Contribute

When contributing to this repository, please first discuss the change you wish to make via a GitHub Issue. Please note we have a code of conduct, please follow it in all your interactions with the project.

> ### Legal Notice <!-- omit in toc -->
> When contributing to this project, you must agree that you have authored 100% of the content, that you have the necessary rights to the content and that the content you contribute may be provided under the project license.

### Reporting Bugs

<!-- omit in toc -->
#### Before Submitting a Bug Report

A good bug report shouldn't leave others needing to chase you up for more information. Therefore, we ask you to investigate carefully, collect information and describe the issue in detail in your report. Please complete the following steps in advance to help us fix any potential bug as fast as possible.

- Make sure that you are using the latest version.
- Determine if your bug is really a bug and not an error on your side e.g. using incompatible environment components/versions (Make sure that you have read the documentation (coming soon). If you are looking for support, you might want to check [this section](#i-have-a-question)).
- To see if other users have experienced (and potentially already solved) the same issue you are having, check if there is not already a bug report existing for your bug or error in the [bug tracker](../../issues?q=label%3Abug).
- Also make sure to search the internet (including Stack Overflow) to see if users outside of the GitHub community have discussed the issue.
- Collect information about the bug:
- Stack trace (Traceback)
- OS, Platform and Version (Windows, Linux, macOS, x86, ARM)
- Version of the interpreter, compiler, SDK, runtime environment, package manager, depending on what seems relevant.
- Possibly your input and the output
- Can you reliably reproduce the issue? And can you also reproduce it with older versions?

<!-- omit in toc -->
#### How Do I Submit a Good Bug Report?

> You must never report security related issues, vulnerabilities or bugs to the issue tracker, or elsewhere in public. Instead sensitive bugs may be privately messaged on Twitter to @reddobowen.

We use GitHub issues to track bugs and errors. If you run into an issue with the project:

- Open an [Issue](../../issues/new). (Since we can't be sure at this point whether it is a bug or not, we ask you not to talk about a bug yet and not to label the issue.)
- Explain the behaviour you would expect and the actual behaviour.
- Please provide as much context as possible and describe the *reproduction steps* that someone else can follow to recreate the issue on their own. This usually includes your code. For good bug reports you should isolate the problem and create a reduced test case.
- Provide the information you collected in the previous section.

Once it's filed:

- The project team will label the issue accordingly.
- A team member will try to reproduce the issue with your provided steps. If there are no reproduction steps or no obvious way to reproduce the issue, the team will ask you for those steps and mark the issue as `needs-repro`. Bugs with the `needs-repro` tag will not be addressed until they are reproduced.
- If the team is able to reproduce the issue, it will be marked `needs-fix`, as well as possibly other tags (such as `critical`), and the issue will be left to be [implemented by someone](#your-first-code-contribution).

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for the Hugo Creator theme, **including completely new features and minor improvements to existing functionality**. Following these guidelines will help maintainers and the community to understand your suggestion and find related suggestions.

<!-- omit in toc -->
#### Before Submitting an Enhancement

- Make sure that you are using the latest version.
- Read the documentation carefully and find out if the functionality is already covered, maybe by an individual configuration.
- Perform a [search](../../issues) to see if the enhancement has already been suggested. If it has, add a comment to the existing issue instead of opening a new one.
- Find out whether your idea fits with the scope and aims of the project. It's up to you to make a strong case to convince the project's developers of the merits of this feature. Keep in mind that we want features that will be useful to the majority of our users and not just a small subset. If you're just targeting a minority of users, consider writing an add-on/plugin library.

<!-- omit in toc -->
#### How Do I Submit a Good Enhancement Suggestion?

Enhancement suggestions are tracked as [GitHub issues](../../issues).

- Use a **clear and descriptive title** for the issue to identify the suggestion.
- Provide a **step-by-step description of the suggested enhancement** in as many details as possible.
- **Describe the current behavior** and **explain which behavior you expected to see instead** and why. At this point you can also tell which alternatives do not work for you.
- You may want to **include screenshots and animated GIFs** which help you demonstrate the steps or point out the part which the suggestion is related to. You can use [this tool](https://www.cockos.com/licecap/) to record GIFs on macOS and Windows, and [this tool](https://github.com/colinkeenan/silentcast) or [this tool](https://github.com/GNOME/byzanz) on Linux. <!-- this should only be included if the project has a GUI -->
- **Explain why this enhancement would be useful** to most Hugo Creator users. You may also want to point out the other projects that solved it better and which could serve as inspiration.

### We Use [Github Flow](https://guides.github.com/introduction/flow/index.html), So All Code Changes Happen Through Pull Requests
Pull requests are the best way to propose changes to the codebase (we use [Github Flow](https://guides.github.com/introduction/flow/index.html)). We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed functionality, update the documentation (in-line comments and appropriate method documentation).
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!
7. Identify any code smells via the Sonar Cloud Scanning.

#### Some additional Pull Request good practices - 

* Make sure that you name your Pull Request as something meaningful. The names of the PRs will be pulled as-is into the changelog/release notes, so should be descriptive and clear.
* Make sure that you appropriately label your Pull Requests using the GitHub issue Labels. These are once again used by the changelog/release notes to determine the appropriate category as-is.
* If you are contributing a Pull Request, please be clear about any GitHub Issues that this PR fixes, so that we can maintain the GitHub issues easily. GitHub will automatically close linked issues when the PR is merged if you have "Fixes #xyz" in a Commit Message of the PR / Initial PR description.
* If you are looking to get an update from someone in particular, please tag them in the discussion so that they can get notified.
* Ensure any install or build dependencies are removed before the end of the layer when doing a build.
* Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
* Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent. The versioning scheme we use is [SemVer](http://semver.org/).

### Setting up your development environment

To make contributing to the project easier, we have included the [necessary files](.devcontainer) to use **Dev Containers** within Visual Studio Code or GitHub Codespaces.

You can find more about Dev Containers [here](https://code.visualstudio.com/docs/remote/containers). If you already have docker and Visual Studio Code installed on your machine, then this will mean that you don't need to install Hugo and any additional project pre-requisites directly onto your machine, but can use the "Visual Studio Code Remote - Containers" extension to develop locally.

Pre-Requisites:
* Either - 
  * Visual Studio Code installed on your machine ([Link](https://code.visualstudio.com/download))
  * Visual Studio Code's Remote - Containers extension installed on your machine ([Link](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers))
  * Docker installed on your machine ([Link](https://docs.docker.com/get-docker/))
* Or - 
  * Access to GitHub Codespaces ([Link](https://github.com/features/codespaces))

If you do not wish to use Visual Studio Code / Docker and want to understand the necessary steps to get your local development environment configured, please get in touch. We will continue to update this contributing document over time with additional details. Additions to this guide based on your own experiences are welcome!

### Any contributions you make will be under the MIT Software License
In short, when you submit code changes, your submissions will be understood under the same [MIT License](LICENSE) that covers the project. Feel free to contact the maintainers if that's a concern.

#### We require a Developer Certificate of Origin (DCO)
What is a DCO? As explained over at [GitHub's probot site](https://probot.github.io/apps/dco/), the Developer Certificate of Origin (DCO) is a lightweight way for contributors to certify that they wrote or otherwise have the right to submit the code they are contributing to the project. Contributors sign-off that they adhere to these requirements by adding a Signed-off-by line to commit messages.

The DCO (copied below for convenience) can be found at [https://developercertificate.org/](https://developercertificate.org/).

```
Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the
    best of my knowledge, is covered under an appropriate open
    source license and I have the right under that license to   
    submit that work with modifications, whether created in whole
    or in part by me, under the same open source license (unless
    I am permitted to submit under a different license), as
    Indicated in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including
    all personal information I submit with it, including my
    sign-off) is maintained indefinitely and may be redistributed
    consistent with this project or the open source license(s)
    involved.
```

We have added a GitHub application to automatically check that a DCO is present on commits which are made into the repository. To have a Pull Request merged into the repository, you **must** complete this. Don't worry if you forgot in advance! The GitHub Checks experience will flag the DCO failure, and provide steps to help you remediate that!