+++
Description = "Consider this scenario. You are managing a software project using Azure DevOps, and you have multiple teams working towards a common cadence. Perhaps that cadence is managed by a central team. To gain the most value from your sprint planning, you would need to associate the iterations from the project level with each individual team. This is a scenario that I have for my fictitious Theatreers project, but also a scenario I encountered recently with a colleague. I have been helping them setup an Azure DevOps project to track the development of IP and collateral, so that they can more accurately forecast what they expect to land and show the value being delivered by the team."
date = 2019-06-16T19:00:00-00:00
PublishDate = 2019-06-16T19:00:00-00:00 # this is the datetime for the when the epsiode was published. This will default to Date if it is not set. Example is "2016-04-25T04:09:45-05:00"
title = "Using Azure DevOps REST APIs to automatically create Team Iterations"
images = ["img/cloudwithchrislogo.png"]
Author = "chrisreddington"
# blog_banner = "img/episode/default-banner.jpg"
blog_image = "img/cloudwithchrislogo.png"
categories = ["Azure DevOps", "DevOps"]
tags = ["Azure DevOps", "DevOps", "Automation"]
#series = ["The Nirvana of DevOps"]
#aliases = ["/##"]
+++

Consider this scenario. You are managing a software project using Azure DevOps, and you have multiple teams working towards a common cadence. Perhaps that cadence is managed by a central team. To gain the most value from your sprint planning, you would need to associate the iterations from the project level with each individual team.

This is a scenario that I have for my fictitious Theatreers project, but also a scenario I encountered recently with a colleague. I have been helping them setup an Azure DevOps project to track the development of IP and collateral, so that they can more accurately forecast what they expect to land and show the value being delivered by the team.

As we continue planning for the project to be piloted, I realise that the iterations at the project level have not yet been associated with the individual teams. Furthermore, at this point, I also realise that this is something that would need to be setup across all of those teams.

This project has about 18 teams, and started with about 6 iterations. I could have manually added the iterations one-by-one for each team, but where's the fun in that? Instead, I opted for a scripted approach.

You can find a Gist below showing the example script.

<script src="https://gist.github.com/christianreddington/649c472a058385a01308348c756f4b26.js"></script>

I realise that the above can of course be improved further, such as more robust error checking, looking through multiple depths of iterations in the project configuration, etc. However, This solves my immediate need. Why over-engineer if it solves my problem? Re-architect as the need arises.

That being said, if you think this script could be useful but needs some modifications, please do contribute to it. I have a 'permanent' copy of the script available in my [Useful Scripts GitHub Repository](https://github.com/christianreddington/useful-scripts/blob/master/AzureDevOps-AddProjectIterationsToTeams.ps1).