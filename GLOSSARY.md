# Infrastructure as Code with Terraform

Shared vocabulary for our DCN presentation, so all five of us use the same word for the same thing on slides and when speaking.

## Language

### The talk

**PortoBikes**:
An invented Porto bike-rental startup (founded 2015) whose growth gives the talk its storyline. It's presented as invented from the first slide.
_Avoid_: "the company", "our example" (ambiguous next to real companies)

**Turning point**:
One stage in PortoBikes' growth where its way of managing infrastructure breaks and has to change. The talk has six turning points.
_Avoid_: "act", "chapter", "phase"

**Real anchor**:
A real, sourced event or company shown alongside a turning point to prove that the invented problem actually happens.
_Avoid_: "example" (doesn't say whether it's invented or real)

### The practice

**Infrastructure as Code (IaC)**:
Managing infrastructure through machine-readable definition files kept in version control, instead of by clicking in consoles or running ad-hoc scripts.
_Avoid_: "automation" (too broad), "config management" (a neighbouring practice: Ansible/Chef/Puppet configure existing machines)

**ClickOps**:
Managing infrastructure by hand through web consoles. The "before" state the talk starts from.
_Avoid_: "manual setup" (vague)

**Declarative**:
Describing the desired end state ("there should be 2 servers") and letting the tool work out the steps to get there.
_Avoid_: confusing it with **Imperative**: writing out the steps themselves ("create a server, then another"), as scripts do

**Drift**:
The difference between what the code says and what actually exists, usually caused by someone changing infrastructure by hand.

### The products

**Terraform CLI**:
HashiCorp's command-line IaC tool, which reads HCL configuration files. Licensed under the Business Source License (BSL) since August 2023.
_Avoid_: "Terraform" alone when the license or business model is being discussed; "open-source Terraform" for anything after August 2023

**HCP Terraform**:
HashiCorp's paid, hosted service for running Terraform as a team (remote runs, state, policies). Formerly called Terraform Cloud.
_Avoid_: Terraform Cloud (old name)

**Terraform Enterprise**:
The self-hosted edition of HCP Terraform, for organisations that cannot use the SaaS version.

**OpenTofu**:
The community fork of the Terraform CLI, created in response to the BSL change and governed by the Linux Foundation.
_Avoid_: "open-source Terraform"

**HashiCorp**:
The company that created Terraform. IBM completed its acquisition of HashiCorp in early 2025.

**Business Source License (BSL)**:
A source-available license that forbids using the software to build a competing commercial product. Under the strict OSI definition, it is not open source.
_Avoid_: "open source" when describing it

### Alternatives

**Pulumi**:
An IaC tool where infrastructure is written in general-purpose programming languages (TypeScript, Python, Go…) instead of HCL. Takes the "rewrite" side in the debate.

**AWS CDK**:
Amazon's IaC tool, which uses general-purpose programming languages and generates CloudFormation. Works only with AWS.
_Avoid_: "CDK" alone (could also mean CDK for Terraform)

**CDK for Terraform (CDKTF)**:
HashiCorp's discontinued tool for writing Terraform in general-purpose programming languages. Archived in December 2025.
_Avoid_: "CDK" alone

**Crossplane**:
An IaC tool that manages cloud resources from inside Kubernetes. Mentioned in the talk, but not argued for in the debate.

### The workflow

**Provider**:
A plugin that teaches Terraform how to manage one platform's resources (e.g. AWS, Docker). Moving the same workflow to a different platform means switching providers.

**State**:
Terraform's record of which real-world resources it manages and how they map to the code. Teams store it in a shared place, with locking.

**Plan**:
The preview Terraform produces of exactly what it would create, change or destroy to make reality match the code. The core idea of the talk.
_Avoid_: "dry run" (a plan is a reviewable artifact, not just a rehearsal)

**Apply**:
Carrying out a plan, which changes real infrastructure.
