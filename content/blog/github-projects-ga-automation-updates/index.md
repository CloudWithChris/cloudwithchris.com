---
# Default hugo properties
title: "GitHub Projects is now GA! Automation Upodates"                   # Name of the blog
description: "In a couple of previous blog posts, I provided a writeup on the GitHub Projects Beta. I wrote to posts on automation within GitHub Projects (Adding Issues to GitHub Projects with GitHub Actions for a user profile and Adding Issues to GitHub Projects with GitHub Actions for an Organization profile). I'm pleased to say that the capabilities went Generally Available last week! As a result of the GA announcement and resulting changes, I need to post updates to my older samples."             # Used for SEO optimisation
publishDate: "2022-07-31T20:00:00Z"             # TODO: Differentiate between date
date: "2022-07-31T20:00:00Z"                            # TODO: Differentiate between PublishDate

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
In a couple of previous blog posts, I provided a writeup on the GitHub Projects Beta. I wrote to posts on automation within GitHub Projects ([Adding Issues to GitHub Projects with GitHub Actions for a user profile](/blog/automate-adding-gh-issues-projects-beta-users) and [Adding Issues to GitHub Projects with GitHub Actions for an Organization profile](/blog/automate-adding-gh-issues-projects-beta)). I'm pleased to say that the capabilities went Generally Available last week! As a result of the GA announcement and resulting changes, I need to post updates to my older samples.

The team have had [an incredible cadence of releases](https://github.blog/changelog/label/issues/), posting new updates on the GitHub changelog every few weeks. There have been plenty of feature updates, including -

* Visualise Projects as Tables or Boards
* Custom Fields
* Iterations
* Charts to visualise the progress within projects
* Updates to the Automations
  * GraphQL ProjectsV2 API

It's because of that last point that I'm writing this particular blog post. When looking over the samples in the prior blog posts, you'll notice that it used the  ``ProjectNext`` object. However, the [GitHub Projects Team announced that the ProjectNext object will be deprecated in favour of the ProjectV2 object](https://github.blog/changelog/2022-06-23-the-new-github-issues-june-23rd-update/). As such, my previous GitHub Action workflows will need to be updated. But, fear not - as I've included them for you below!

The example below shows how to add a GitHub Issue to an existing project. 

* The example uses the **ProjectV2** object
* Due to the new schema, the nodes property needs to be updated. Notice that it is now split into ``... on ProjectV2Field`` and ``... on ProjectV2SingleSelectField`` (compared with the simple flat nodes object in the previous blog posts).
* The example still passes in a ``GITHUB_TOKEN``. I have set this at my CloudWithChris organisation level, so it can be used across all repositories in the organisation. 
  * I generated a Personal Access Token (PAT) which has the ``project`` OAuth2 scope. This was also newly introduced as part of the recent GitHub projects updates ([as seen in the team's June update](https://github.blog/changelog/2022-06-23-the-new-github-issues-june-23rd-update/)). This means we can generate a token which either has read, or write access to Projects.
  * Ideally, I would have used the ``permissions`` property in GitHub Actions to leverage the [Automatic Token Authentication capabilities](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token), eliminating the need for Personal Access Tokens altogether. Unfortunately, it doesn't look like there are permissions for GitHub Projects v2 at the moment.

``` yaml
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
          ORGANIZATION: CloudWithChris
          PROJECT_NUMBER: 5
        run: |
          gh api graphql -f query='
            query($org: String!, $number: Int!) {
              organization(login: $org){
                projectV2(number: $number) {
                  id
                  fields(first:20) {
                    nodes {
                      ... on ProjectV2Field {
                        id
                        name
                      }
                      ... on ProjectV2SingleSelectField {
                        id
                        name
                        options {
                          id
                          name
                        }
                      }
                    }
                  }
                }
              }
            }' -f org=$ORGANIZATION -F number=$PROJECT_NUMBER > project_data.json

          echo 'PROJECT_ID='$(jq '.data.organization.projectV2.id' project_data.json) >> $GITHUB_ENV
          
      - name: Add issue to project
        env:
          GITHUB_TOKEN: ${{ secrets.GH_TOKEN_PROJECT_ACCESS }}
          ISSUE_ID: ${{ github.event.issue.node_id }}
        run: |
          item_id="$( gh api graphql -f query='
            mutation($project:ID!, $issue:ID!) {
              addProjectV2ItemById(input: {projectId: $project, contentId: $issue}) {
                item {
                  id
                }
              }
            }' -f project=$PROJECT_ID -f issue=$ISSUE_ID --jq '.data.addProjectV2ItemById.projectV2Item.id')"
```

And the same for Pull Requests -

```yaml
name: Add PR to project
on:
  pull_request:
    types:
      - opened
jobs:
  track_pr:
    runs-on: ubuntu-latest
    steps:
      - name: Get project data
        env:
          GITHUB_TOKEN: ${{ secrets.GH_TOKEN_PROJECT_ACCESS }}
          ORGANIZATION: CloudWithChris
          PROJECT_NUMBER: 5
        run: |
          gh api graphql -f query='
            query($org: String!, $number: Int!) {
              organization(login: $org){
                projectV2(number: $number) {
                  id
                  fields(first:20) {
                    nodes {
                      ... on ProjectV2Field {
                        id
                        name
                      }
                      ... on ProjectV2SingleSelectField {
                        id
                        name
                        options {
                          id
                          name
                        }
                      }
                    }
                  }
                }
              }
            }' -f org=$ORGANIZATION -F number=$PROJECT_NUMBER > project_data.json

          echo 'PROJECT_ID='$(jq '.data.organization.projectV2.id' project_data.json) >> $GITHUB_ENV
          
      - name: Add PR to project
        env:
          GITHUB_TOKEN: ${{ secrets.GH_TOKEN_PROJECT_ACCESS }}
          PR_ID: ${{ github.event.pull_request.node_id }}
        run: |
          item_id="$( gh api graphql -f query='
            mutation($project:ID!, $pr:ID!) {
              addProjectV2ItemById(input: {projectId: $project, contentId: $pr}) {
                item {
                  id
                }
              }
            }' -f project=$PROJECT_ID -f pr=$PR_ID --jq '.data.addProjectV2ItemById.projectV2Item.id')"
```

I'm a fan of GitHub Issues and GitHub Projects. Combined with [GitHub Issues Forms](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms), there is a great level of flexibility in how you can manage your issues in a way that makes sense for your own projects. And it sounds like there are [some exciting things planned for the future of GitHub Projects](https://github.blog/2022-07-27-planning-next-to-your-code-github-projects-is-now-generally-available/#whats-next).

Are you using GitHub Projects? Have any automation tips? Let me know - I'd love to hear more!