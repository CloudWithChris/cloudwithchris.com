+++
Description = "In case you had not already heard, Logic Apps have now reached general availability on Azure (or read an MSDN article by Jeff Hollan on the topic)."
date = 2016-09-12T12:00:00-00:00
PublishDate = 2016-09-12T12:00:00-00:00 # this is the datetime for the when the epsiode was published. This will default to Date if it is not set. Example is "2016-04-25T04:09:45-05:00"
title = "Integration Platform as a Service: Logic Apps"
images = ["img/cloudwithchrislogo.png"]
Author = "chrisreddington"
# blog_banner = "img/episode/default-banner.jpg"
blog_image = "img/cloudwithchrislogo.png"
categories = ["Announcement"]
tags = ["Blogging"]
#series = ["The Nirvana of DevOps"]
#aliases = ["/##"]
+++
In case you had not already heard, [Logic Apps have now reached general availability on Azure](https://azure.microsoft.com/en-us/blog/announcing-azure-logic-apps-general-availability/) (or read [an MSDN article by Jeff Hollan](https://blogs.msdn.microsoft.com/logicapps/2016/07/27/azure-logic-apps-reaches-general-availability) on the topic).

## What are Logic Apps?

Logic Apps enable integration points primarily between Software as a Service (SaaS) offerings, and can be easily configured through a User Interface, available on the Azure Portal. This integration is facilitated by using [a series of connectors](https://azure.microsoft.com/en-gb/documentation/articles/apis-list/), which are focused around [enterprise integration](https://blogs.msdn.microsoft.com/logicapps/2016/06/30/public-preview-of-logic-apps-enteprise-integration-pack/) (in Public Preview at time of writing) and SaaS applications such as SalesForce, Twilio, Office 365, Twitter and more (though it's worth noting that some of these are in beta!)

By the way, if you have some feedback for the Logic Apps team, there is a great mechanism of feeding it back via [the Logic Apps UserVoice page](https://feedback.azure.com/forums/287593-logic-apps/).

### Let's run through a quick example

The cloud is rapidly evolving, and there is a lot of information to keep up with. In this example, we will build a Logic App that detects a new post on the Azure News RSS feed and texts relevant details to a phone number via Twilio.

_In case you are unaware, Twilio is a great service that provides APIs for Telephony-based interactions, e.g. Voice and SMS. For the purposes of this demo, I have used the [free API key offer provided by Twilio](https://www.twilio.com/try-twilio). However, because you are using this free trial - You are limited to sending messages / calls to only verified numbers._

Firstly, head over to the [Azure Portal](https://portal.azure.com/), and open up the Create logic app blade.

Once you have entered the appropriate details, go ahead and create the resource. When it is created, navigate to it through your Azure Portal. You will be routed to a blade similar to the below. We will opt for the "Blank LogicApp" option, so select that.

The Logic App designer will then load up for you. This is an interactive canvas, that allows you to generate the flow of your Logic App. Let's begin by searching for the RSS connector, and selecting that.

Great. We have added the RSS connector as our trigger point. We can add another step to our flow, and create an action once a new post has been detected on the RSS feed. This feels very much like building up a computer program. In fact, there are a few options that we have here:

* Add an action
* Add a condition
* Add a for each
* Add a do until
* Add a scope

Very much, like a computer program! We're going to keep this simple and click "Add an action", and search for the "Twilio - Send Message" connector.

You should now have a view similar to the below. We have a few options that we need to configure:

**When a new feed item is published**

* RSS Feed: [https://azure.microsoft.com/en-gb/updates/feed/](https://azure.microsoft.com/en-gb/updates/feed/)

**Send Message**

* Connection Name: myTwilioConnector _(This is not related to your Twilio API access, so you can name it something appropriate to your Logic App)_
* Twilio Account ID: In your [Twilio Console](https://www.twilio.com/console), this will be the "Account SID"
* Twilio Access Token: In your [Twilio Console](https://www.twilio.com/console), , this will be the "Auth Token" field which is hidden by default.

Once you have entered these details, click Create.

The Twilio connector details will update, assuming that your authentication credentials were correct. Now you will need to enter some further details:

**Send Message**

* From Phone Number: This is the number that Twilio have provided, and is automatically populated for you in a drop down box.
* To Phone Number: This is the number that you would like to send the message to (Remember, that if you are using the free trial - [You will need to follow the steps on Twilio to validate this number](https://www.twilio.com/help/faq/twilio-basics/how-does-twilios-free-trial-work)).
* Text: Type in the message that you would like to send. Take notice of the Outputs below the message box, that are available from the RSS connector.

Once you are happy, save the Logic App in the top left hand corner of the screen. Congratulations, you have just created your first logic app!

You may be interested to see what is happening in the background. Whilst you are using the UI, a JSON document is being updated, which reflects the template of the Logic App being created.

You will notice a couple of variables relating to connectors, e.g. @parameters('$connections') \['twilio'\] \['connectionId'\]. You will also notice new resources in the same Resource Group as the logic app that you created, which match these references.

This is an **incredibly** basic logic app, serving solely one user. Though it demonstrates the simplicity of the technology. Additionally, we have triggered this Logic App based upon detecting a new post in the RSS feed. We could do this in numerous approaches, as documented [here](https://msdn.microsoft.com/library/azure/mt643939.aspx). However, I hope that this has been useful and that you have created something useful for yourself in the process.

Logic Apps is a topic that I will be exploring further, so stay tuned for further details and more detailed examples!