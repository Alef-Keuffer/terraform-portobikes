<!--
Narration for the AI-narrated video (npm run narrate). Adapted from the speaker notes in slides.md:
stage directions, live-only cues and presenter warnings are left out, and numbers are spelled the way they should be spoken.

One block per shot. The heading names what is on screen:
  ## 004-02                     a frame from `slidev export --with-clicks` (slide 4, click step 2)
  ## video recording.mp4 0 30   seconds 0–30 of public/recording.mp4
The text under it is read aloud while it is on screen. A frame with no block is left out of the video.
[pause] adds a one-second silence.
-->

## 001-01
Meet PortoBikes: a bike-rental startup here in Porto. It's invented, but everything that happens to it in this talk has happened to a real company, and we'll show you which one.

## 002-01
It's Friday, six in the evening, peak rental time, and the booking server just died. It was set up by hand three years ago, by someone who has since left.
So: how long would it take you to rebuild it?
[pause]
Hold that number. We'll come back to it.

## 003-01
Let's rewind to how that server was born. 2015. PortoBikes is two founders, a few bikes and an AWS account. One of them opens the AWS console, clicks "launch instance", picks a size, opens a port, and installs the booking app by hand.

## 003-02
It works! And honestly, for two people, that was the right call. The console is fast, it's visual, and you can learn it in an afternoon.
We call this ClickOps: managing infrastructure by hand, through web consoles. The cost is hidden, and it arrives later. Because nothing was written down. There's no file you can read, no change anyone can review, nothing you can repeat.

## 004-01
Here's how it goes wrong.

## 004-02
First, snowflake servers. That's Martin Fowler's name, from 2012, for a server hand-tuned through command lines, GUI screens and text-file edits until it's unique. His line: good for a ski resort, bad for a data center.

## 004-03
Second, staging and production quietly stop matching. Someone fixes production at midnight and forgets staging. Now a bug shows up in one and not the other, and nobody can say which difference caused it.

## 004-04
And third, the one we opened with: only one person knows how to rebuild it. When that machine dies on a Friday evening, the only documentation is the dead machine.

## 005-01
There's a well-known way to put the fix: pets versus cattle.
A pet is a server you treat as indispensable and unique. It has a name, and when it gets sick, you nurse it back to health. Cattle are built with automated tools and designed for failure. When one gets sick, you replace it.
Randy Bias spread this framing for the cloud, and he credits the metaphor to Bill Baker at Microsoft.
PortoBikes' booking server is a pet with a name. Friday evening is the moment the pet dies. So the goal from here on is replaceable servers.

## 006-01
Does this happen to real companies? Knight Capital, 2012, a US trading firm. They were deploying new code to eight servers. One technician didn't copy the new code to one of the eight, and no second person reviewed the deployment. That eighth server still had old, unused code on it, and live orders woke it up.

## 006-02
In about 45 minutes it sent four million executions into the market. Knight lost 460 million dollars.

## 006-03
The S E C investigated, and its order says: a written procedure requiring a simple double-check of the deployment could have identified that a server had been missed.
One person did it, and nobody checked. Remember that word: review. It's the thread of this talk.

## 007-01
A second one, from AWS itself. February 2017. An S3 engineer, following an established playbook, runs a command to remove a few servers from a billing system. One input is typed wrong, and a much larger set of servers is removed, including the ones holding S3's index of where every object lives.

## 007-02
S3 in U S East 1 was down for about four hours.
To be fair: this wasn't console clicking. It was a command typed by hand from a written procedure, so call it manual operations. The lesson is the same. A human typing values into a live system, with no preview of what's about to happen.

## 008-01
So what's the alternative? Infrastructure as Code: managing infrastructure through machine-readable definition files kept in version control, instead of clicking in consoles or running ad-hoc scripts.

## 008-02
Where does the term come from? There's no single inventor. Kief Morris, who wrote the O'Reilly book on it, traces its earliest uses to a 2009 conference talk by Andrew Clay Shafer, with the founders of Chef and Puppet using the phrase around the same time.
The idea that matters for us: if infrastructure is a file, a change is a diff. And a diff can be reviewed.

## 009-01
What does that buy you? Six things.

## 009-02
Speed. In Fowler's words, creating new servers is just a case of running the script. AWS says environments within minutes.

## 009-03
Consistency. Microsoft: the same environment every time it deploys.

## 009-04
An audit trail. Every change can be logged, so you know who changed what.

## 009-05
Safe rollback. At worst, you go back to the last working configuration.

## 009-06
Disaster recovery. AWS's own guide says you should always deploy using infrastructure as code, so infrastructure can be redeployed quickly without errors. That's our Friday evening problem.

## 009-07
And identical copies: the same environment, in another location, from the same code. That's how staging actually matches production.

## 010-01
So after that Friday, PortoBikes does the sensible thing. It's 2016. They write every step down as Bash scripts using the AWS command line, and put the scripts in Git.

## 010-02
That's real progress. The steps are repeatable, anyone on the team can run them, and Git keeps a history of who changed what. If the server dies on a Friday, you don't need the one person who remembers. You run the script. So, problem solved? Not quite. There's a catch, and it's subtle.

## 011-01
Here's the catch, in code.
On the left, the Bash script. It says: run two instances. That's imperative: you write the steps. Run it once, you have two servers. Run it again, by accident or to fix a half-failed run, and you have four. The script has no idea what already exists. You could add checks: if two servers exist, skip. But every author has to remember that, for every step, in every script.
On the right, Terraform. It doesn't say "create". It says: there should be two of these. That's declarative: you describe the end state, and the tool works out the steps. Run it twice and you still have two. Change the 2 to a 3, and Terraform tells you: one to add.
Scripts describe the steps. Declarative code describes the result. And because the tool knows the result you want, it can tell you what it's about to change before it changes anything. Keep that in mind for the demo.

## 012-01
Around this time you'd also meet configuration management tools: CFEngine from 1993, Puppet from 2005, Chef from 2009, Ansible from 2012. They're good tools, and mostly declarative too. But they answer a different question: what's installed and configured on this machine? Packages, files, services.
Ansible would have helped PortoBikes rebuild the software on the dead server. But someone still has to create the server, the firewall, the DNS record. That half is still ClickOps.
Provisioning tools answer that question: which machines, networks and databases should exist? CloudFormation, from 2011, and Terraform, from 2014.

## 013-01
And CloudFormation had the right idea.

## 013-02
It was declarative, and from 2016 it could even preview a change before running it, with change sets. So Terraform did not invent the preview.

## 013-03
The limit was elsewhere: CloudFormation runs only inside AWS. It can't manage a second cloud.

## 013-04
Since 2021, other vendors can publish resource types for it, so some outside services work. But PortoBikes' DNS at an outside registrar, its monitoring service: all of that stays ClickOps.
What PortoBikes wants is one tool and one workflow for everything. And that's what HashiCorp claims for Terraform: a consistent workflow to provision and manage all of your infrastructure, with a plan you approve first. Which brings us to 2017.

## 014-01
PortoBikes, 2017. The scripts from last time describe the steps. What we want is something that describes the result. That tool existed, but it almost didn't survive.
In July 2014, Terraform zero point one supported exactly two platforms, AWS and DigitalOcean. Two, on purpose: to prove that one workflow could drive several providers. Its creator, Mitchell Hashimoto, says downloads were "mostly stagnant for the first 18 months", and the team talked about "maybe shutting down the project".

## 014-02
Then in 2017, "downloads continued to double every single month". So what did people suddenly see in it?

## 015-01
Three inputs. The code: what we want. The state: Terraform's record of what it manages. And reality: what actually exists right now, which Terraform re-reads every time.
From those three it builds a plan: exactly what it would create, change or destroy. A person reads the plan. Only then does apply change anything.
This is the core idea of the whole talk: the change becomes something you can review.

## 016-01
Four symbols, and you can read any plan. Plus: create. Tilde: change in place. Minus: destroy. And minus-slash-plus: replace, which means destroy and create again.

## 016-02
At the bottom, a one-line summary. Watch for this exact line in a minute.

## 018-01
Let's see it. Here is the demo, recorded.

## video recording.mp4 0 30
This is our booking server, written down. Terraform plans two resources to add, applies them, and the page answers: five euros per hour.
By the way, this Docker provider is maintained by one volunteer, not by HashiCorp. Remember that when we talk about who controls these tools.

## video recording.mp4 30 55
Now we change the price. Before touching anything, the plan tells us exactly what it will do. And notice: this replaces the server. In production that means downtime, and we found out before pressing enter.
Then we apply that saved plan. What we reviewed is exactly what runs. Nothing gets recalculated.

## video recording.mp4 55 79.9
Now someone deletes the server by hand. Friday evening.
Terraform re-reads reality, sees the server is gone, and wants to put it back. That's drift detection. We apply, and the page is back.

## 019-01
So: what we reviewed is exactly what ran. And when someone deleted the server by hand, the plan noticed and put it back.

## 021-01
How did it change since it started? Zero point one had two providers. Zero point twelve, in 2019, made HCL a real language. Zero point thirteen is why the Docker provider just worked in the demo: providers come from the Registry.
One point zero, in June 2021, is the maturity line: HashiCorp promised that upgrades within one point x keep your configuration working.
After that: one point five lets you import hand-made infrastructure through a reviewed plan. One point six adds terraform test, and it's also the first release under the B S L; keep that in mind for later. One point eleven: S3 locks state by itself, which matters in a minute when the team grows. And last month, one point seventeen: Terraform Policy, rules checked against every plan.

## 021-02
Notice the pattern: after one point zero, new features increasingly work through the plan. Which is exactly what PortoBikes needs next, because the team is about to grow.

## 022-01
Fast-forward to 2019. PortoBikes has grown to ten engineers, and they all run Terraform from their own laptops.
Here's the problem. Terraform keeps its state, its record of what it manages, in a file. If two people run apply at the same moment, both read the same old state, both write, and one of the writes is lost. Now you have infrastructure that exists, but that Terraform no longer knows about.
The fix is to put the state in one shared place, with a lock. Terraform takes the lock automatically on every operation that writes state. If someone else already holds it, Terraform stops instead of writing.
On AWS, the classic setup was an S3 bucket for the state and a DynamoDB table for the lock. Since Terraform one point eleven, in February 2025, S3 can hold the lock itself, and the DynamoDB arguments are deprecated.
One trap: the highlighted setting defaults to false. Forget that line, and you have shared state with no lock at all.

## 023-01
With ten engineers, nobody should be running apply from a laptop anyway. So the change process becomes a pull request.
You open a pull request with your change. C I runs terraform plan and posts the result on the pull request. A colleague reviews it. And here's the important part: they review the plan, not just the code. Only after approval does anything get applied.
Why the plan? Because a three-line change in the code can hide something destructive, like an attribute that forces the database to be replaced. The code diff looks harmless. The plan says "must be replaced". You saw exactly that in the demo, when changing a price replaced our server.
Three tools implement this same loop. Atlantis is open source and self-hosted. You comment "atlantis plan" on the pull request, and it can refuse to apply until someone other than the author has approved. GitHub Actions can run the plan in C I. And H C P Terraform, HashiCorp's hosted service, plans every pull request on its own.
This is where the talk's argument becomes concrete: reviewable code became reviewable change.

## 024-01
So where does all this sit in a DevOps pipeline? Here's the whole picture.
On the top row, a commit goes into a pull request. C I runs terraform init and terraform plan. And then, in yellow, the step this whole talk is about: a human reviews the plan.
On the bottom row, after approval, the change is merged, C I applies a saved plan, so what runs is exactly what that plan showed, and only then does the application get deployed onto that infrastructure.
This isn't our invention. HashiCorp's own guide to running Terraform in automation lists the same four steps: initialize, produce a plan, "have a human operator review that plan", apply.
And DORA, Google's DevOps research programme, says teams should keep their Terraform files in version control, because comprehensive version control "predicts continuous delivery".
So that's the relationship between IaC and DevOps: the infrastructure goes through the same pull request, review and deploy loop as the application, and it comes first.

## 025-01
Once a plan is something a person can review, it's also something a machine can check. That's policy as code.
You write rules, like "no storage bucket open to the internet" or "nothing outside our region", and they're checked against every plan before apply. In HashiCorp's own words, H C P Terraform "checks the Terraform plan against the policy set during each run". If a policy fails, it can stop the run.
There are three main options. Sentinel is HashiCorp's own policy language. O P A, the Open Policy Agent, is open source and uses a language called Rego. And since Terraform one point seventeen, last month, there's Terraform Policy, written in HCL itself and built into the C L I, so policy checks no longer need the paid platform.
The reviewer is no longer only a colleague. It's a colleague plus a set of rules. Keep that in mind for the last part of the talk, when the one writing the code is an AI.

## 026-01
So who pays for all this? The Terraform C L I is free. Even H C P Terraform, HashiCorp's hosted service, has a free tier, and it already includes remote runs and single sign-on.
Teams pay for the things that only matter once you're a team. More applies running at the same time. Drift detection, which tells you when someone clicked something in the console in production. Audit logs, for when someone asks who changed what. H C P Terraform charges per managed resource per month: ten cents, forty-seven cents or ninety-nine cents, depending on the tier. Those are the prices on HashiCorp's pricing page as of the fourth of November; the two higher tiers go through sales, so treat them as list prices.
So people don't pay for the C L I. They pay for running it as a team: coordination and governance. And those needs grow with headcount, which is exactly what happened to PortoBikes.
For scale: in its last quarterly report before IBM bought it, HashiCorp had 4,856 customers, and 946 of them paid more than a hundred thousand dollars a year. That's all HashiCorp products, not just H C P Terraform.

## 027-01
This is also why so many job ads ask for Terraform.
In the 2025 Stack Overflow survey, 18.4 percent of respondents said they had done extensive work with Terraform in the past year. That measures usage, not jobs.
For jobs: in the U K, IT Jobs Watch counted about 2,300 permanent job ads mentioning Terraform in the six months to the twenty-first of November, with a median salary of seventy-five thousand pounds.
And what do those jobs actually want? Our reading, not a measured fact: not someone who can type terraform apply on a laptop. They want the team workflow we just walked through: remote state, modules, C I C D, policy. Every company at this stage needs someone who knows it.

## 028-01
And if you want proof that you know this workflow, HashiCorp sells three certifications.
The Associate is the entry point: seventy dollars fifty, one hour, multiple choice. Almost every term in this talk, state, locking, drift, plan, is one of its exam objectives.
The Professional costs two hundred dollars and takes ninety minutes. It covers exactly this turning point: C I C D, policy as code, and even using the Terraform M C P server with AI coding agents.
The Advanced exam is two hundred and ninety-five dollars, four hours, with hands-on labs on AWS or Azure.
These are three separate, current exams. None replaced another. Each is valid for two years, and only the Advanced one includes a free retake.
[pause]
So PortoBikes now has a team, a pipeline, policies, and maybe a certified engineer or two. Everything depends on one tool, and one vendor: HashiCorp. In 2023, HashiCorp changed the rules.

## 029-01
So PortoBikes must decide. Stay on Terraform, move to OpenTofu, or rewrite in Pulumi? In the live talk, the room votes here, hears all three sides argued, and votes again.

## 033-01
At the start, we asked how long it would take you to rebuild that server.

## 033-02
terraform apply.

## 033-03
You just watched it take seconds.

## 034-01
Terraform turned infrastructure into reviewable code, and everything since has been about who reviews it: colleagues, policies, and now AI.

## 035-01
Everything you saw, the demo included, is in this repo. Scan the code and run it yourself. Thank you for watching.
