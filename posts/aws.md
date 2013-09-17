# Deploying Node apps to AWS using Grunt

![amazon-web-services.png][1]

The full title should've been something like: _Deploying Node applications to [Amazon Web Services (AWS)](http://aws.amazon.com/ "Amazon Web Services") through their [CLI tools](https://github.com/aws/aws-cli "aws/aws-cli on GitHub") using Grunt_. That was way too long, though.

To summarize, I've been toying with **AWS** for a few days now, and I wanted to share my experience and my approach with you. My goal was to set up a deploy flow in Grunt to enable me to spin up new EC2 instances in the AWS cloud and deploy to them easily. In this post I'll look at being able to do all of the following in my command-line:

- Creating [SSH](http://en.wikipedia.org/wiki/Secure_Shell#Version_2.x "Secure Shell 2") key-pairs and uploading their public key to AWS
- Launching EC2 _micro_ instance with an [_Ubuntu AMI_](http://cloud-images.ubuntu.com/releases/raring/release-20130423/ "Ubuntu 13.04 (Raring Ringtail)")
- `ssh` into the instance using the private key associated with an instance, and get it set up for future deploys:
  - Install Node.js
- Shut down instances with the same ease as we can launch them, deleting key-pairs
- Get a list of EC2 instances
- Get a command to SSH myself to an instance, in case I want to do some heavy lifting myself
- Deploy to our instance using `rsync`, for [blisteringly fast data transfers](https://help.ubuntu.com/community/rsync "rsync, an article by the Ubuntu Community")
- Refer to instances by a name tag like `'bambi'`, rather than an ID such as `i-he11f00ba4`

If this sounds like something you'd be interested in learning about, read on.

  [1]: http://i.imgur.com/Yya9AIy.png "Amazon Web Services"

## Introduction

In the past, I've been using [Heroku](https://www.heroku.com/ "Heroku Cloud Application Platform") to host my Node applications, _(this blog is hosted on Heroku)_. For convenience, and because I didn't really know how to interact with AWS, I'd never even tried it before. Now that **I'm writing a book on build processes and architecture for Node applications**, I deemed it necessary to teach myself _how to use AWS directly_, rather than through a [PaaS](http://en.wikipedia.org/wiki/Platform_as_a_service "Platform as a Service") provider such as Heroku.

However, I didn't want to lose the ability to deploy from my command-line. In fact, I wanted to do one better, and become able to spin up new environments with just a [Grunt](http://gruntjs.com/ "Grunt.js JavaScript Task Runner") command. A little while ago, Amazon [released version 1.0.0](https://github.com/aws/aws-cli/releases/tag/1.0.0 "aws-cli Release 1.0.0 on GitHub") of their CLI tools, my understanding: a huge improvement over their previous command-line tooling, but I never really used their previous version before.

Some of the tasks took a little iterating to get right, but considering AWS gives you free access to their services for a year when you first sign up, this wasn't really an issue. Keeping in mind the fact that _these are automated tasks_, the goal for me was to get it right once, and then be _able to re-use it in any other projects I might want to host on the  AWS platform in the future.

## Requirements

I started off by reading up on the requirements for the **aws-cli** tool. I wanted to do as little manual labor as possible, after researching a little I figured out my requirements to use the `aws` CLI tool unobtrusively.

- Have an **AWS** account
- Get an Access Key, write down `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
- Install `pip`, the Python [package manager](http://www.pip-installer.org/en/latest/installing.html "pip installation instructions"), if it's not present
- Use it to install the CLI: `pip install awscli --upgrade`

I actually created a Grunt task to install `aws` CLI, but that's not required. 