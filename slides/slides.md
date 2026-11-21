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

# 2019: ten engineers, one state file

- Two people run `terraform apply` at once: both read the same old **state**, and one write is lost
- Fix: shared remote state with **locking**. Terraform locks state on every operation that writes it
- Since Terraform 1.11 (Feb 2025), S3 locks state itself; the DynamoDB lock table is deprecated

```hcl {6}
terraform {
  backend "s3" {
    bucket       = "portobikes-state"
    key          = "prod/terraform.tfstate"
    region       = "eu-west-1"
    use_lockfile = true # defaults to false: forget it, and there is no lock
  }
}
```

<p class="text-sm opacity-80">Terraform docs: state locking; S3 backend; 1.11 changelog.</p>

<!--
[S2]

Fast-forward to 2019. PortoBikes has grown to ten engineers, and they all run Terraform from their own laptops.

Here's the problem. Terraform keeps its state, its record of what it manages, in a file. If two people run apply at the same moment, both read the same old state, both write, and one of the writes is lost. Now you have infrastructure that exists, but that Terraform no longer knows about.

The fix is to put the state in one shared place, with a lock. Terraform takes the lock automatically on every operation that writes state. If someone else already holds it, Terraform stops instead of writing.

On AWS, the classic setup was an S3 bucket for the state and a DynamoDB table for the lock. Since Terraform 1.11, in February 2025, S3 can hold the lock itself, and the DynamoDB arguments are deprecated.

[point at the highlighted line] One trap: this setting defaults to false. Forget that line, and you have shared state with no lock at all.
-->

---

# Every change is a pull request

1. Open a pull request with the HCL change
2. CI runs `terraform plan` and posts it to the pull request
3. A colleague reviews the **plan**, not just the code
4. Approval, then `apply`

<div class="grid grid-cols-3 gap-4 pt-6 text-center">
  <div class="border-2 border-current rounded p-3"><b>Atlantis</b><br>open source, self-hosted</div>
  <div class="border-2 border-current rounded p-3"><b>GitHub Actions</b><br>runs the plan in CI</div>
  <div class="border-2 border-current rounded p-3"><b>HCP Terraform</b><br>HashiCorp's hosted service</div>
</div>

<p class="pt-6">Why review the plan? A three-line diff can hide a replaced database. The plan says <code>must be replaced</code>.</p>

<!--
[S2]

With ten engineers, nobody should be running apply from a laptop anyway. So the change process becomes a pull request.

You open a pull request with your change. CI runs terraform plan and posts the result on the pull request. A colleague reviews it. And here's the important part: they review the *plan*, not just the code. Only after approval does anything get applied.

Why the plan? Because a three-line change in the code can hide something destructive, like an attribute that forces the database to be replaced. The code diff looks harmless. The plan says "must be replaced". You saw exactly that in the demo, when changing a price replaced our server.

Three tools implement this same loop. Atlantis is open source and self-hosted. You comment "atlantis plan" on the pull request, and it can refuse to apply until someone other than the author has approved. GitHub Actions can run the plan in CI. And HCP Terraform, HashiCorp's hosted service, plans every pull request on its own.

This is where the talk's argument becomes concrete: reviewable code became reviewable change.
-->

---

# Where IaC sits in a DevOps pipeline

<div class="flex flex-col gap-6 pt-4 text-xl font-semibold">
  <div>
    <div class="text-sm uppercase tracking-wide opacity-80 pb-2">On the pull request</div>
    <div class="flex items-center gap-3">
      <div class="border-2 border-current rounded px-4 py-3 whitespace-nowrap">commit</div>
      <div class="text-3xl" aria-hidden="true">→</div>
      <div class="border-2 border-current rounded px-4 py-3 whitespace-nowrap">pull request</div>
      <div class="text-3xl" aria-hidden="true">→</div>
      <div class="border-2 border-current rounded px-4 py-3 whitespace-nowrap">CI: <code>init</code> + <code>plan</code></div>
      <div class="text-3xl" aria-hidden="true">→</div>
      <div class="border-4 border-amber-500 bg-amber-300 text-black rounded px-4 py-3">a human reviews the plan</div>
    </div>
  </div>
  <div>
    <div class="text-sm uppercase tracking-wide opacity-80 pb-2">After approval</div>
    <div class="flex items-center gap-3">
      <div class="text-3xl" aria-hidden="true">→</div>
      <div class="border-2 border-current rounded px-4 py-3 whitespace-nowrap">merge</div>
      <div class="text-3xl" aria-hidden="true">→</div>
      <div class="border-2 border-current rounded px-4 py-3 whitespace-nowrap"><code>apply</code> the saved plan</div>
      <div class="text-3xl" aria-hidden="true">→</div>
      <div class="border-2 border-current rounded px-4 py-3 whitespace-nowrap">app deploy</div>
    </div>
  </div>
</div>

<div class="pt-8 text-base">

HashiCorp: initialize, produce a plan, *"have a human operator review that plan"*, apply.<br>
DORA: version your "Terraform files" too; comprehensive version control *"predicts continuous delivery"*.

</div>

<!--
[S2]

So where does all this sit in a DevOps pipeline? Here's the whole picture.

[top row] A commit goes into a pull request. CI runs terraform init and terraform plan. And then, in yellow, the step this whole talk is about: a human reviews the plan.

[bottom row] After approval, the change is merged, CI applies a *saved* plan, so what runs is exactly what that plan showed, and only then does the application get deployed onto that infrastructure.

This isn't our invention. HashiCorp's own guide to running Terraform in automation lists the same four steps: initialize, produce a plan, "have a human operator review that plan", apply.

And DORA, Google's DevOps research programme, says teams should keep their Terraform files in version control, because comprehensive version control "predicts continuous delivery".

So that's the relationship between IaC and DevOps: the infrastructure goes through the same pull request, review and deploy loop as the application, and it comes first.
-->

---

# A plan people can review, machines can check

**Policy as code:** rules checked against every plan, before `apply`

<div class="grid grid-cols-3 gap-4 pt-6 text-center">
  <div class="border-2 border-current rounded p-3"><b>Sentinel</b><br>HashiCorp's own language</div>
  <div class="border-2 border-current rounded p-3"><b>OPA</b><br>open source, Rego</div>
  <div class="border-2 border-current rounded p-3"><b>Terraform Policy</b><br>written in HCL, built into Terraform 1.17 (Oct 2026)</div>
</div>

<p class="pt-6">HCP Terraform <em>"checks the Terraform plan against the policy set during each run"</em>. A failed policy can stop the run.</p>

<!--
[S2]

Once a plan is something a person can review, it's also something a machine can check. That's policy as code.

You write rules, like "no storage bucket open to the internet" or "nothing outside our region", and they're checked against every plan before apply. In HashiCorp's own words, HCP Terraform "checks the Terraform plan against the policy set during each run". If a policy fails, it can stop the run.

There are three main options. Sentinel is HashiCorp's own policy language. OPA, the Open Policy Agent, is open source and uses a language called Rego. And since Terraform 1.17, last month, there's Terraform Policy, written in HCL itself and built into the CLI, so policy checks no longer need the paid platform.

The reviewer is no longer only a colleague. It's a colleague plus a set of rules. Keep that in mind for the last part of the talk, when the one writing the code is an AI.
-->

---

# How HashiCorp makes money

<div class="grid grid-cols-2 gap-8 pt-4">
<div>

**Free**
- The Terraform CLI
- HCP Terraform's free tier, with remote runs and single sign-on

</div>
<div>

**Paid**: HCP Terraform, per resource per month
- $0.10, $0.47 or $0.99, depending on the tier
- More concurrent runs, drift detection, audit logs

</div>
</div>

<p class="pt-6">HashiCorp: <b>4,856 customers</b>, <b>946</b> of them paying over $100k a year</p>

<p class="text-sm opacity-80">Pricing page as of 2026-11-04; the two higher tiers are sold through sales, so these may be list prices. Customers: all HashiCorp products, quarter ending Oct 2024, the last report before IBM.</p>

<!--
[S2]

So who pays for all this? The Terraform CLI is free. Even HCP Terraform, HashiCorp's hosted service, has a free tier, and it already includes remote runs and single sign-on.

Teams pay for the things that only matter once you're a team. More applies running at the same time. Drift detection, which tells you when someone clicked something in the console in production. Audit logs, for when someone asks who changed what. HCP Terraform charges per managed resource per month: ten cents, forty-seven cents or ninety-nine cents, depending on the tier. Those are the prices on HashiCorp's pricing page as of the fourth of November; the two higher tiers go through sales, so treat them as list prices.

So people don't pay for the CLI. They pay for running it as a team: coordination and governance. And those needs grow with headcount, which is exactly what happened to PortoBikes.

For scale: in its last quarterly report before IBM bought it, HashiCorp had 4,856 customers, and 946 of them paid more than a hundred thousand dollars a year. That's all HashiCorp products, not just HCP Terraform.
-->

---

# Why job ads ask for it

<div class="grid grid-cols-2 gap-8 pt-6 text-center">
  <div>
    <div class="text-6xl font-bold">18.4%</div>
    <div class="pt-2">of respondents use Terraform</div>
    <div class="text-sm opacity-80">Stack Overflow survey 2025</div>
  </div>
  <div>
    <div class="text-6xl font-bold">~2,300</div>
    <div class="pt-2">UK job ads in 6 months, median salary <b>£75k</b></div>
    <div class="text-sm opacity-80">IT Jobs Watch, 6 months to 21 Nov 2026</div>
  </div>
</div>

<p class="pt-10">Our reading, not a measured fact: they ask for the team workflow (remote state, modules, CI/CD, policy).</p>

<!--
[S2]

This is also why so many job ads ask for Terraform.

In the 2025 Stack Overflow survey, 18.4% of respondents said they had done extensive work with Terraform in the past year. That measures usage, not jobs.

For jobs: in the UK, IT Jobs Watch counted about 2,300 permanent job ads mentioning Terraform in the six months to the twenty-first of November, with a median salary of seventy-five thousand pounds.

[re-check this number the day before; it's a rolling window]

And what do those jobs actually want? Our reading, not a measured fact: not someone who can type terraform apply on a laptop. They want the team workflow we just walked through: remote state, modules, CI/CD, policy. Every company at this stage needs someone who knows it.
-->

---

# Certifications

| Exam | Price | Length |
|---|---|---|
| Terraform Associate (004) | $70.50 | 1 h |
| Terraform Infrastructure Engineer Professional (002) | $200 | 90 min, incl. CI/CD, policy, and the MCP server with AI agents |
| Terraform Authoring and Operations Advanced | $295 | 4 h, hands-on labs |

<p class="pt-4">Three separate, current exams. Each is valid for 2 years; only Advanced includes a free retake.</p>

<p class="text-sm opacity-80">HashiCorp's official certification pages (checked 2026-11-04, names re-checked 2026-11-21).</p>

<!--
[S2]

And if you want proof that you know this workflow, HashiCorp sells three certifications.

The Associate is the entry point: seventy dollars fifty, one hour, multiple choice. Almost every term in this talk, state, locking, drift, plan, is one of its exam objectives.

The Professional costs two hundred dollars and takes ninety minutes. It covers exactly this turning point: CI/CD, policy as code, and even using the Terraform MCP server with AI coding agents.

The Advanced exam is two hundred and ninety-five dollars, four hours, with hands-on labs on AWS or Azure.

These are three separate, current exams. None replaced another. Each is valid for two years, and only the Advanced one includes a free retake.

[pause]

So PortoBikes now has a team, a pipeline, policies, and maybe a certified engineer or two. Everything depends on one tool, and one vendor: HashiCorp. In 2023, HashiCorp changed the rules.
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
