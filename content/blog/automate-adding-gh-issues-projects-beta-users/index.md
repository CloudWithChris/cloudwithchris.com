---
# Default hugo properties
title: "Automate adding GitHub Issues to GitHub Projects (Beta) in a repository owned by a user"                   # Name of the blog
description: "I recently wrote a blog post about using GitHub Actions to automatically add a GitHub Issue to a GitHub project (Beta) when the issue is opened. I received a question from my colleague and maintainer of the promitor and KEDA Open Source (OSS) Projects, Tom Kerkhove on doing the same with a user-owned GitHub repository, rather than organisation-owned."             # Used for SEO optimisation
publishDate: "2022-02-10T20:00:00Z"             # TODO: Differentiate between date
date: "2022-02-10T20:00:00Z"                            # TODO: Differentiate between PublishDate

# Site-wide [required properties]
image: "img/cloudwithchrislogo.png"                   # Displayed when referenced in listing pages
images:                     # An array of images used in Social Sharing
- "img/cloudwithchrislogo.png"
tags:                       # Used for SEO optimisation and browsing across the site.
- "GitHub"
- "DevOps"
- "Agile"
- "Project Management"
- "Automation"
- "GitHub Actions"
- "GitHub Projects"
- "GitHub Issues"

# Site-wide [optional properties]
externalLink: ""            # Full URL to override listing links to an external page

# Content-specific properties
authors:
-  "chrisreddington"                       # An array of authors of the post (filenames in person).
banner: "images/banner.jpg"
---
**Update: This information is now outdated. Please see my post since [GitHub Projects Went Generally Available](/blog/github-projects-ga-automation-updates), as there are some APIs used in this example which [will be deprecated in October 2022](https://github.blog/changelog/2022-06-23-the-new-github-issues-june-23rd-update/#%F0%9F%A4%96-graphql-api-improvements).**

I recently [wrote a blog post](/blog/automate-adding-gh-issues-projects-beta) on using GitHub Actions to automatically add a GitHub Issue to a [GitHub Projects (beta)](https://github.com/features/issues) when an issue is opened. I received a question from my colleague and maintainer of the [promitor](https://promitor.io/) and [KEDA](https://keda.sh/) Open Source (OSS) Projects, [Tom Kerkhove](https://twitter.com/TomKerkhove) on using the sample with a user-owned GitHub repository, rather than an organisation-owned one.

Fortunately, there were relatively few tweaks needed to adjust the sample from the previous blog post to meet this requirement. I'm pleased on the response to the blog post so far. Particularly as I [indirectly helped on a contribution to the KEDA project](https://github.com/kedacore/keda/pull/2622#pullrequestreview-878828492). KEDA is a project that I'm very fond of, and will have to write a post as part of the [CNCF Projects series](/series/cncf-projects/). I'm looking forward to using KEDA as a part of Azure Container Apps in the future.

Rather than repeating the entire blog post here, I'll detail the tweaks that have been made to make it work against repositories and projects which are owned by a GitHub user.

## Getting the project data

As highlighted in the previous post, the [GitHub CLI Doc](https://cli.github.com/manual/gh_help_environment) shows that an authentication token (set as the ``GH_TOKEN`` or ``GITHUB_TOKEN`` environment variable) bypasses the need for an interactive login.

At the start of a workflow, GitHub Actions automatically creates a unique token for you. This token is set as the ``GITHUB_TOKEN`` environment variable and has a limited lifetime, with a default set of permissions. You can generate a Personal Access Token, assign the scope of the permissions needed and set that as a GitHub Secret ``GITHUB_TOKEN`` for use within your GitHub Action workflows.

> **Note:** I mentioned in my previous blog that that the default ``GITHUB_TOKEN`` did not have sufficient permissions to get the needed information. I had to [create a Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) and provide it with the **repo** and **read:org** scopes.
>
> Even though there is a permission which relates to orgs, it seems as though it is also required for user-owned repositories as well.

The ``gh api graphql`` command from the GitHub CLI can be used to query the GitHub API.

```bash
gh api graphql -f query='
  query($user: String!, $number: Int!) {
    user(login: $user){
      projectNext(number: $number) {
        id
        fields(first:20) {
          nodes {
            id
            name
            settings
          }
        }
      }
    }
  }' -f user=$USER -F number=$PROJECT_NUMBER > project_data.json
```

> **Note:** When comparing the sample from [the prior blog post](/blog/automate-adding-gh-issues-projects-beta), you will notice a couple of slight changes.
>
> To make the script more easily readable, I changed the parameter name from org to user. More importantly, the organization field is changed to user (within the query type) to query the projects under a user profile instead of an GitHub Organisation.

## Pulling it all together

The rest of the GitHub Action workflow file does not need to change. The end result will look a little like this:

```yaml
name: Add issue to project
on:
  issues:
    types:
      - opened
jobs:
  track_issue:
    runs-on: ubuntu-latest
    steps:
      - name: Get project data
        env:
          GITHUB_TOKEN: ${{ secrets.GH_TOKEN_PROJECT_ACCESS }}
          USER: chrisreddington
          PROJECT_NUMBER: 2
        run: |
          gh api graphql -f query='
            query($user: String!, $number: Int!) {
              user(login: $user){
                projectNext(number: $number) {
                  id
                  fields(first:20) {
                    nodes {
                      id
                      name
                      settings
                    }
                  }
                }
              }
            }' -f user=$USER -F number=$PROJECT_NUMBER > project_data.json

          echo 'PROJECT_ID='$(jq '.data.organization.projectNext.id' project_data.json) >> $GITHUB_ENV
          
      - name: Add issue to project
        env:
          GITHUB_TOKEN: ${{ secrets.GH_TOKEN_PROJECT_ACCESS }}
          ISSUE_ID: ${{ github.event.issue.node_id }}
        run: |
          item_id="$( gh api graphql -f query='
            mutation($project:ID!, $issue:ID!) {
              addProjectNextItem(input: {projectId: $project, contentId: $issue}) {
                projectNextItem {
                  id
                }
              }
            }' -f project=$PROJECT_ID -f issue=$ISSUE_ID --jq '.data.addProjectNextItem.projectNextItem.id')"
```

So there you have it. If you haven't read it already, I recommend taking a look at [my previous blog post](/blog/automate-adding-gh-issues-projects-beta) so that you have the full picture. This once again shows the power of GitHub issues, not just focusing on Continuous Integration/Deployment, but also automating activities based upon GitHub events.

Are you using GitHub Actions to help with project management? Let me know in the comments below!
