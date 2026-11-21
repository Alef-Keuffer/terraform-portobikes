---
theme: seriph
title: Infrastructure as Code with Terraform
info: DCN (DevOps e Computação na Nuvem), FEUP MESW. The PortoBikes story, from ClickOps to AI-written infrastructure.
# The deck must run offline on the presenter's laptop, so don't fetch web fonts.
fonts:
  provider: none
# The seriph cover layout otherwise loads a remote Unsplash image.
background: ''
favicon: /favicon.svg
transition: fade
---

# Infrastructure as Code with Terraform

The PortoBikes story

<p class="opacity-70 pt-8">
PortoBikes is invented. Every incident in this talk really happened somewhere.
</p>

<!--
Meet PortoBikes: a bike-rental startup here in Porto. It's invented, but everything that happens to it in this talk has happened to a real company, and we'll show you which one.
-->

---
layout: center
class: text-center bg-black text-white
---

# Friday, 18:00.

## The booking server is down.

<!--
It's Friday, 18:00, peak rental time, and the booking server just died. It was set up by hand three years ago, by someone who has since left.

So: how long would it take *you* to rebuild it?

[pause]

Hold that number. We'll come back to it.
-->

---

# PortoBikes, 2015

Two founders. One AWS account. The console.

<v-click>

<p class="text-5xl pt-12 text-center">"It works!"</p>

</v-click>

<!--
[S1] Let's rewind to how that server was born. 2015. PortoBikes is two founders, a few bikes and an AWS account. One of them opens the AWS console, clicks "launch instance", picks a size, opens a port, and installs the booking app by hand.

[click] It works! And honestly, for two people, that was the right call. The console is fast, it's visual, and you can learn it in an afternoon.

We call this ClickOps: managing infrastructure by hand, through web consoles. The cost is hidden, and it arrives later. Because nothing was written down. There's no file you can read, no change anyone can review, nothing you can repeat.
-->

---

# What goes wrong

<v-clicks>

- **Snowflake servers**: hand-tuned until each one is unique.<br>*"Good for a ski resort, bad for a data center."*
- **Drift**: staging and production quietly stop matching
- **Only one person** knows how to rebuild it

</v-clicks>

<p class="absolute bottom-4 left-14 right-14 text-xs opacity-60">Quote: Martin Fowler, "SnowflakeServer" (2012), martinfowler.com</p>

<!--
[S1] Here's how it goes wrong.

[click] First, snowflake servers. That's Martin Fowler's name, from 2012, for a server hand-tuned through command lines, GUI screens and text-file edits until it's unique. His line: good for a ski resort, bad for a data center. You can't reproduce it, and soon nobody understands it well enough to change it.

[click] Second, staging and production drift apart. Someone fixes production at midnight and forgets staging. Now a bug shows up in one and not the other, and nobody can say which difference caused it.

[click] And third, the one we opened with: only one person knows how to rebuild it. When that machine dies on a Friday at 18:00, the only documentation is the dead machine.
-->

---

# Pets vs cattle

<div class="grid grid-cols-2 gap-8 pt-6">
<div>

### Pets 🐶

*"indispensable or unique systems that can never be down"*

Named, nursed back to health.

</div>
<div>

### Cattle 🐄

*"built using automated tools, and … designed for failure"*

Replaced, not repaired.

</div>
</div>

<p class="text-2xl pt-10 text-center">Stop nursing servers. Make them replaceable.</p>

<p class="absolute bottom-4 left-14 right-14 text-xs opacity-60">Quotes: Randy Bias, "The History of Pets vs Cattle" (2016), cloudscaling.com</p>

<!--
[S1] There's a well-known way to put the fix: pets versus cattle.

A pet is a server you treat as indispensable and unique. It has a name, and when it gets sick, you nurse it back to health. Cattle are built with automated tools and designed for failure. When one gets sick, you replace it.

Randy Bias spread this framing for the cloud, and he credits the metaphor to Bill Baker at Microsoft.

PortoBikes' booking server is a pet with a name. Friday at 18:00 is the moment the pet dies. So the goal from here on is replaceable servers.
-->

---

# 📍 Knight Capital, 2012

A deployment to **8 servers**. One was missed. Nobody double-checked.

<v-click>

<p class="text-6xl font-bold pt-6 pb-6">$460M lost in ~45 minutes</p>

</v-click>

<v-click>

> *"A written procedure requiring a simple double-check of the deployment … could have identified that a server had been missed."*

</v-click>

<p class="absolute bottom-4 left-14 right-14 text-xs opacity-60">Source: SEC, In the Matter of Knight Capital Americas LLC, Release No. 34-70694 (2013), ¶15–17, ¶41</p>

<!--
[S1] Does this happen to real companies? Knight Capital, 2012, a US trading firm. They were deploying new code to eight servers. One technician didn't copy the new code to one of the eight, and no second person reviewed the deployment. That eighth server still had old, unused code on it, and live orders woke it up.

[click] In about 45 minutes it sent four million executions into the market. Knight lost 460 million dollars.

[click] And that's not a blogger's opinion. The SEC investigated, and its order says: a written procedure requiring a simple double-check of the deployment could have identified that a server had been missed.

One person did it, and nobody checked. Remember that word: review. It's the thread of this talk.
-->

---

# 📍 AWS S3, 2017

An engineer follows a playbook and types a command by hand.

> *"One of the inputs to the command was entered incorrectly and a larger set of servers was removed than intended."*

<v-click>

<p class="text-5xl font-bold pt-6 pb-6">S3 in us-east-1: offline for ~4 hours</p>

</v-click>

<p class="absolute bottom-4 left-14 right-14 text-xs opacity-60">Source: AWS, "Summary of the Amazon S3 Service Disruption in the Northern Virginia (US-EAST-1) Region" (2017), aws.amazon.com/message/41926</p>

<!--
[S1] A second one, from AWS itself. February 2017. An S3 engineer, following an established playbook, runs a command to remove a few servers from a billing system. One input is typed wrong, and a much larger set of servers is removed, including the ones holding S3's index of where every object lives.

[click] S3 in us-east-1 was down for about four hours. AWS couldn't even update its own status page, because the status page depended on S3.

To be fair: this wasn't console clicking. It was a command typed by hand from a written procedure, so call it manual operations. The lesson is the same. A human typing values into a live system, with no preview of what's about to happen.
-->

---

# Infrastructure as Code

Managing infrastructure through **machine-readable definition files** kept in **version control**, instead of clicking in consoles or running ad-hoc scripts.

<v-click>

The term emerged **around 2009**, in the DevOps, Puppet and Chef community. No single inventor.

</v-click>

<p class="absolute bottom-4 left-14 right-14 text-xs opacity-60">Origin: Kief Morris, infrastructure-as-code.com/book</p>

<!--
[S1] So what's the alternative? Infrastructure as Code: managing infrastructure through machine-readable definition files kept in version control, instead of clicking in consoles or running ad-hoc scripts.

[click] Where does the term come from? There's no single inventor. Kief Morris, who wrote the O'Reilly book on it, traces its earliest uses to a 2009 conference talk by Andrew Clay Shafer, with the founders of Chef and Puppet using the phrase around the same time.

The idea that matters for us: if infrastructure is a file, a change is a diff. And a diff can be reviewed.
-->

---

# What IaC buys you

<v-clicks>

- **Speed**: new servers by *"running the script"*; environments *"within minutes"*
- **Consistency**: *"the same environment every time it deploys"*
- **An audit trail**: *"every change … can be logged"*
- **Safe rollback** to *"the last working configuration"*
- **Disaster recovery**: *"you should always deploy using infrastructure as code"*
- **Identical copies**: *"the same environment … in another location using the same IaC"*

</v-clicks>

<p class="absolute bottom-4 left-14 right-14 text-xs opacity-60">Sources: Martin Fowler, "InfrastructureAsCode" (2016); AWS, "What is IaC?"; Microsoft Learn, "What is infrastructure as code?"; AWS, Disaster Recovery of Workloads on AWS</p>

<!--
[S1] What does that buy you? Six things.

[click] Speed. In Fowler's words, creating new servers is just a case of running the script. AWS says environments within minutes.

[click] Consistency. Microsoft: the same environment every time it deploys.

[click] An audit trail. Every change can be logged, so you know who changed what, and why.

[click] Safe rollback. At worst, you go back to the last working configuration.

[click] Disaster recovery. AWS's own guide says you should always deploy using infrastructure as code, so infrastructure can be redeployed quickly without errors. That's our Friday 18:00 problem.

[click] And identical copies: the same environment, in another location, from the same code. That's how staging actually matches production.
-->

---

# PortoBikes, 2016: scripts in Git

```bash
./create-servers.sh
git commit -m "Write down how we build the servers"
```

<v-click>

The steps are **repeatable**, and they have a **history**. That's progress.

</v-click>

<!--
[S1] So after that Friday, PortoBikes does the sensible thing. It's 2016. They write every step down as Bash scripts using the AWS command line, and put the scripts in Git.

[click] That's real progress. The steps are repeatable, anyone on the team can run them, and Git keeps a history of who changed what. If the server dies on a Friday, you don't need the one person who remembers. You run the script. So, problem solved? Not quite. There's a catch, and it's subtle.
-->

---

# Imperative vs declarative

<div class="grid grid-cols-2 gap-6 pt-2 big-code">
<div>

**Bash**: the steps

```bash
aws ec2 run-instances \
  --image-id ami-0fb653ca2d3203ac1 \
  --instance-type t2.micro \
  --count 2
```

Run it twice → **4 servers**

</div>
<div>

**Terraform**: the result

```hcl
resource "aws_instance" "web" {
  count         = 2
  ami           = "ami-0fb653ca2d3203ac1"
  instance_type = "t2.micro"
}
```

Run it twice → **2 servers**

</div>
</div>

<style>
.big-code .slidev-code { font-size: 0.95rem !important; line-height: 1.6 !important; }
.big-code p { font-size: 1.4rem; }
</style>

<!--
[S1] Here's the catch, in code.

On the left, the Bash script. It says: run two instances. That's imperative: you write the steps. Run it once, you have two servers. Run it again, by accident or to fix a half-failed run, and you have four. The script has no idea what already exists. You could add checks: if two servers exist, skip. But every author has to remember that, for every step, in every script.

On the right, Terraform. It doesn't say "create". It says: there should be two of these. That's declarative: you describe the end state, and the tool works out the steps. Run it twice and you still have two. Change the 2 to a 3, and Terraform tells you: one to add.

Scripts describe the steps. Declarative code describes the result. And because the tool knows the result you want, it can tell you what it's about to change before it changes anything. Keep that in mind for the demo.
-->

---

# Configure vs create

<div class="grid grid-cols-2 gap-8 pt-4">
<div>

### Configuration management

**Configures** machines that already exist

CFEngine (1993) · Puppet (2005)<br>Chef (2009) · Ansible (2012)

</div>
<div>

### Provisioning

**Creates** the infrastructure itself

CloudFormation (2011)<br>Terraform (2014)

</div>
</div>

<!--
[S1] Around this time you'd also meet configuration management tools: CFEngine from 1993, Puppet from 2005, Chef from 2009, Ansible from 2012. They're good tools, and mostly declarative too. But they answer a different question: what's installed and configured on this machine? Packages, files, services.

Ansible would have helped PortoBikes rebuild the software on the dead server. But someone still has to create the server, the firewall, the DNS record. That half is still ClickOps.

Provisioning tools answer that question: which machines, networks and databases should exist? CloudFormation, from 2011, and Terraform, from 2014.

If someone asks: yes, Ansible can create EC2 instances, and some of its modules are declarative. This is about where each tool is strongest, not a hard wall.
-->

---

# CloudFormation had the right idea, inside AWS

<v-clicks>

- **Declarative**, and from 2016 it **previewed changes** (change sets)
- But it runs **only in AWS** and can't manage a second cloud
- Non-AWS services work only where a vendor has published a type (since 2021)

</v-clicks>

<p class="absolute bottom-4 left-14 right-14 text-xs opacity-60">Sources: AWS What's New, change sets (2016-03) and CloudFormation Public Registry (2021-06-21)</p>

<!--
[S1] And CloudFormation had the right idea.

[click] It was declarative, and from 2016 it could even preview a change before running it, with change sets. So Terraform did not invent the preview.

[click] The limit was elsewhere: CloudFormation runs only inside AWS. It can't manage a second cloud.

[click] Since 2021, other vendors can publish resource types for it, so some outside services work. But PortoBikes' DNS at an outside registrar, its monitoring service: all of that stays ClickOps.

What PortoBikes wants is one tool and one workflow for everything. And that's what HashiCorp claims for Terraform: a consistent workflow to provision and manage all of your infrastructure, with a plan you approve first. Which brings us to 2017.
-->

---
layout: center
class: text-center
---

# Friday, 18:00. The booking server is down.

<v-click>

```bash
terraform apply
```

</v-click>

<v-click>

## Back within seconds.

</v-click>

<!--
At the start, we asked how long it would take you to rebuild that server.

[click] terraform apply.

[click] You just watched it take seconds.
-->

---
layout: center
---

<p class="text-3xl leading-relaxed">
Terraform turned infrastructure into reviewable code, and everything since has been about who reviews it: colleagues, policies, and now AI.
</p>

<!--
Terraform turned infrastructure into reviewable code, and everything since has been about who reviews it: colleagues, policies, and now AI.
-->

---
layout: center
class: text-center
---

# Run the demo yourself

<img src="/qr-repo.svg" alt="QR code for github.com/Alef-Keuffer/terraform-portobikes" class="w-56 mx-auto my-6 bg-white p-2" />

[github.com/Alef-Keuffer/terraform-portobikes](https://github.com/Alef-Keuffer/terraform-portobikes)

<!--
Everything you saw, the demo included, is in this repo. Scan the code and run it yourself. Thank you, and now your questions.
-->
