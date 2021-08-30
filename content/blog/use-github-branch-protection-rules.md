---
Author: chrisreddington
Description: "If you're using GitHub as your source control provider, then I'd encourage you to using Branch Protection Rules if you're not already doing so! In this blog post, we'll cover what Branch Protection Rules are and how they can increase your code quality."
PublishDate: "2021-08-30T07:00:00Z"
image: img/cloudwithchrislogo.png
date: "2021-08-30T07:00:00Z"
images:
- img/cloudwithchrislogo.png
tags:
- DevOps
- GitHub
- Developer
- DevSecOps
- Cloud
title: Shift Left and Increase your Code Quality with GitHub Branch Protection Rules
---
## What are Branch Protection Rules?

If you're using GitHub as your source control provider, then I'd encourage you to using Branch Protection Rules if you're not already doing so! In this blog post, we'll cover what Branch Protection Rules are and how they can increase your code quality.

In the world of DevOps, there is a term known as Shift Left. This term effectively means 'find and prevent issues early'. There are several studies that have shown that the most effective way to prevent issues is to find them early in the software delivery lifecycle. This is because the more issues you find early, the more likely it is that they will be identifiable, and therefore fixed.

Let me play devil's advocate for a moment. What happens if you have no barriers to push your code into the main line of development? If there are no quality checks, then you could be pushing code to your production codebase that isn't up to scratch. If you have no automated tests, or code review process, then you don't have the ability to identify and fix issues early. This means you're going to have to wait until the end of the software delivery cycle to find the first issue, which is a waste of time and money. Wouldn't it be better if you could find the first issue as soon as possible?

This is where Branch Protection Rules come in. GitHub Branch Protection Rules are used to enforce workflows for one or more branches in your Git repository hosted on GitHub. These rules are enforced by GitHub and can be configured by the organization or individual repository owner.

![Screenshot showing the Branch Protection Rules overview page for cloudwithchris.com. It contains a Branch Protection Rule for the main branch and the dev branch](/img/blog/use-github-branch-protection-rules/branch-protection-overview.png)

In essence, before you commit to a certain branch (or a set of branches), you need to fulfil a set of conditions. If you don't, then you won't be able to commit to that branch. These conditions include:

* You need to have a certain number of approvals from the approvers list.
* You need to have status checks to pass before you can commit.
* All conversations on code must be resolved before a Pull Request can be merged.
* Commits must be signed.
* Require a linear history (i.e. commits can't be pushed out of order. This could be caused by merging a feature branch based on an old version of master, for example). There is a good write-up on linear vs non-linear history [here](https://www.bitsnbites.eu/a-tidy-linear-git-history/).
* Ensure that all restrictions also apply to administrators.
* Restrict which people, teams or apps can push to any branches which match the convention you've set.

![Screenshot showing the Branch Protection Rules configured for the main branch of the cloudwithchris.com repository. It shows that signed commits are required. It showed that require pull request reviews before merging, require status checks to pass before merging, require conversation resolution before merging, require linear history and include administrators are not required.](/img/blog/use-github-branch-protection-rules/branch-protection-rules-main.png)

So, in summary - you need to have a set of conditions that you can fulfil before you can commit to a branch. If you don't, then you won't be able to commit to that branch.

## Setting up Branch Protection Rules

1. Navigate to a GitHub Repository that you own. For example, I am the organization owner of [CloudWithChris](https://github.com/CloudWithChris/), so will navigate to [my cloudwithchris.com repository](https://github.com/CloudWithChris/cloudwithchris.com).

2. Click on the **Settings** tab.

  ![Arrow pointing to the settings option in the menu of the cloudwithchris.com GitHub Repository](/img/blog/use-github-branch-protection-rules/step-1.png)

3. Click on the **Branches** tab.

  ![Arrow pointing to the Branches option in the settings page of the cloudwithchris.com GitHub Repository](/img/blog/use-github-branch-protection-rules/step-2.png)

4. Click on the **Add Rule** button.

  ![Arrow pointing to the Add rule button on the Branch settings page of the cloudwithchris.com GitHub repository](/img/blog/use-github-branch-protection-rules/step-3.png)

5. You will now see a form to create a new Branch Protection Rule. The first thing you need to do is complete a Branch name pattern. This pattern is used to match branches in your repository. For example, if you have a branch called `master`, then you would enter `master` in the pattern field. If you had several branches that start with preview, e.g. `preview/mynewfeature` or `preview/myothernewfeature`, then you would enter `preview/*` in the pattern field.

  ![Arrow pointing to the Branch name pattern input box on the Add new Branch Protection Rules Page](/img/blog/use-github-branch-protection-rules/step-4.png)

6. Configure the rules as appropriate for your branch. I typically configure some variation of the following: ``Require pull request reviews before merging``, ``Require status checks to pass before merging``, ``Require conversation resolution before merging``, ``Require signed commits`` and ``Require all restrictions to apply to administrators``.

  > **Tip:** Here are some extra insights when setting these rules -
  >
  > * **Require pull request reviews before merging** - You will need to specify the needed number of reviews to allow the Pull Request to be merged. This ensures that you have had a minimum number of peer reviews. Careful not to set this too high, as otherwise you'll be waiting on others to review your Pull Request. And potentially continually reviewing other people's requests!
  > * **Require status checks to pass before merging** - If you have setup [status checks](https://docs.github.com/en/github/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks) on your repository, then you can configure the Branch Protection Rule to require that specific status checks pass before the Pull Request can be merged. Great for additional external validation if you depend on external services for verifying your code quality.
  > * **Require conversation resolution before merging*** - If there is an ongoing discussion on code around implementation details, you may not want the Pull Request to be merged until the discussion is resolved. This is a good way to ensure that you don't accidentally merge a Pull Request that has not been fully resolved.
  > * **Require signed commits** - This enforces that all commits on the branch must be signed. This may be required under certain Software Licenses, or if you wish to prove that someone committing is indeed who they say they are. You can find extra detail on [commit signature verification on the GitHub docs](https://docs.github.com/en/github/authenticating-to-github/managing-commit-signature-verification/about-commit-signature-verification), or a [walkthrough that I put together on setting this up for your own commits](/blog/gpg-git-part-1).
  > * **Require all restrictions to apply to administrators** - This helps you ensure that Administrators are not 'above the law', and have to follow the same rules as any other contributor (i.e. not able to override).

7. Click on the **Save changes** button.

  ![Arrow pointing to the Save changes button on the Add new Branch Protection Rules Page](/img/blog/use-github-branch-protection-rules/step-5.png)

8. You should now see that an additional rule has been added to your Branch Protection Rules list. Repeat this as many times as you need to, so that you can set up the workflow that best suits your branching strategy.

  ![Box highlighting the branch protection rules (One for master, one for dev, and one for preview/*) on the Branch Protection Rules pages](/img/blog/use-github-branch-protection-rules/step-6.png)

As an example, I made some changes to my master branch protection policy. I now have the ``Require pull request reviews before merging`` set to 1 (which means I just need one review on the PR), and ``Require signed commits`` set to true. I also have the ``Require all restrictions to apply to administrators`` set to true.

After navigating to my readme.md, and wanting to make a dummy change - You will notice that I am prevented from making the change.

![Arrow pointing to the line item that shows 'You can't commit to master because it is a protected branch'](/img/blog/use-github-branch-protection-rules/branch-protection-rules-main.png)

> **Tip:** A word of warning. If you're working on a pet project where it's mainly yourself contributing (e.g. Cloud With Chris). If you enable the require pull requests before merging, **and** apply restrictions to all administrators, then you will have to wait for someone else to review your Pull Request. There is no ability for a Pull Request author to approve their own changes. If you disable the ``Require all restrictions to apply to administrators``, then you will be able to merge the pull request (though this would be true for any other administrators of your repository as well).

![Arrow pointing to the popup that shows users cannot approve their own changes in a Pull Request](/img/blog/use-github-branch-protection-rules/cant-approve-own.png)

## Summary

There we go! Throughout this blog post, we have begun our journey of shifting left. We are no longer allowing any code to be directly committed to our production codebase. Instead, we are enforcing a set of rules so that a consistent workflow is maintained. That workflow may include peer reviews, status checks, and other validation. This is only one part of the journey in shifting left. GitHub Actions is incredibly powerful, and could be used to automate your builds, tests and more. Why not create a GitHub Action that triggers on a Pull Request to a target branch? I hope that you can see how this wider story may continue. But, of course - that's for another day!

Are Branch Protection Rules something that you are already using? Perhaps in GitHub, or with another tool? I'd love to hear how you're using them, and some of the practices that you may have picked up along the way. Drop me a message over on [Twitter, @reddobowen](https://twitter.com/reddobowen). In the meantime, I hope this has been useful! Thanks for reading, and bye for now.
