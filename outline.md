# Outline: Infrastructure as Code with Terraform

**First draft.** Every fact here comes from `research/`. Before a fact goes on a slide, check whether it is marked **(!)** in the research file it came from. Use the words in `GLOSSARY.md`. The reasons behind this structure are in `docs/adr/0001-storyline-with-debate.md`.

**The argument running through the talk:** Terraform made infrastructure reviewable code. That's why it became the standard, and also why the license change and IBM's purchase of HashiCorp matter.

**Running order** (about 42 min; we have some slack):

| # | Section | Speaker | ~min |
|---|---|---|---|
| 0 | Opening hook: Friday 18:00 | S1 | 2 |
| 1 | ClickOps (2015) | S1 | 4 |
| 2 | Scripts and configuration management (2016) | S1 | 4 |
| 3 | Terraform arrives, plus the live demo | S2 + demo driver | 11 |
| 4 | The team grows (2019–2022) | S2 | 6 |
| 5 | The plot twist: the license change, plus the debate (2023–2025) | S3 + all speakers | 8 |
| 6 | The future (2026 → 2036) | S3 | 6 |
| 7 | Closing: Friday 18:00, again | S1 | 1 |

S1/S2/S3 are placeholders. Assign people later.

---

## 0. Opening hook: Friday 18:00

**Key message:** Nobody can rebuild a server that only exists in someone's memory.

**Slides**
1. Title slide, plus one line: *"PortoBikes is invented. Every incident in this talk really happened somewhere."*
2. A black screen with only: **Friday, 18:00. The booking server is down.**

**Speaker notes**
> Meet PortoBikes: a bike-rental startup here in Porto. It's invented, but everything that happens to it in the next 40 minutes has happened to a real company, and we'll show you which one. It's Friday, 18:00, peak rental time, and the booking server just died. It was set up by hand three years ago, by someone who has since left. So: how long would it take *you* to rebuild it? Hold that number. We'll come back to it.

---

## 1. ClickOps (2015)

**Key message:** Managing infrastructure by hand works fine until the day it doesn't, and then nobody can see what went wrong.

**Slides**
1. PortoBikes in 2015: two founders and the AWS console. "It works!"
2. What goes wrong:
   - **Snowflake servers.** Martin Fowler: *"good for a ski resort, bad for a data center."*
   - **Drift** between staging and production
   - Only one person knows how to rebuild it
3. **Pets vs cattle**: stop nursing irreplaceable servers; make them replaceable.
4. 📍 **Real anchor: Knight Capital, 2012.** During a deployment, one of eight servers was missed. Nobody double-checked. The firm lost **$460M in 45 minutes**. SEC: *"a simple double-check… could have identified"* it.
5. 📍 **Real anchor: AWS S3, 2017.** One mistyped input to a command run by hand took S3 in us-east-1 offline for about 4 hours.
6. **Infrastructure as Code**, defined. The term emerged around 2009 from the DevOps, Puppet and Chef community.

**Speaker notes**
> Knight Capital is our main anchor because the SEC's own report says the missing ingredient was review: one person did it, and nobody checked. Remember that word, *review*. It's the thread of this talk. The S3 outage wasn't console clicking. It was a command typed by hand from a written procedure. Present it as "manual operations", not as ClickOps.

**Research:** `research/01-clickops.md`

---

## 2. Scripts and configuration management (2016)

**Key message:** Scripts made the steps repeatable, but they describe the *steps*, not the *result*.

**Slides**
1. PortoBikes writes Bash scripts and puts them in Git. That's progress.
2. Imperative vs declarative, in code: a script that creates 2 servers, run twice, gives you 4. Terraform's `count = 2` gives you 2, however many times you run it. (The code snippets are in the research file.)
3. Configuration management (CFEngine 1993, Puppet 2005, Chef 2009, Ansible 2012) **configures** machines that already exist. Provisioning tools (CloudFormation 2011, Terraform 2014) **create** the infrastructure itself.
4. **CloudFormation had the right idea, for AWS only.** It was declarative, and from 2016 it even previewed changes (change sets). But PortoBikes' DNS, monitoring and any second cloud stay ClickOps.

**Speaker notes**
> Be careful here: don't claim Terraform invented the preview. CloudFormation had change sets from 2016. Terraform's claim is *one* workflow across *every* provider. Ansible isn't purely imperative either, so if someone asks, some of its modules are declarative.

**Research:** `research/02-scripts-and-config-management.md`

---

## 3. Terraform arrives, plus the live demo (2017)

**Key message:** You describe what should exist. `plan` shows exactly what will change before anything happens.

**Slides**
1. 2014: Terraform v0.1, with only AWS and DigitalOcean, chosen to prove that multiple **providers** could work. Downloads stayed flat for 18 months and the team considered shutting it down. In 2017, downloads doubled every month.
2. The core model as a diagram: code + **state** + reality → **plan** → **apply**.
3. The symbols in a plan: `+` create, `~` change, `-` destroy, `-/+` replace.
4. → **LIVE DEMO**
5. Backup slide: the same code targeting AWS. Only the provider block changes.

**Demo script** (driver types; S2 narrates)

| Step | Command | What the class sees | Line for S2 |
|---|---|---|---|
| 1 | `terraform init && terraform apply` | the nginx container serves the PortoBikes booking page | "This is our booking server, written down." |
| 2 | edit the page text → `terraform plan` | `-/+ … forces replacement` | "Before touching anything, it tells us exactly what it will do, and this change means a replacement." |
| 3 | `terraform apply` | the new page is live | |
| 4 | `docker rm -f portobikes` | the page is gone | "**Friday, 18:00.**" |
| 5 | `terraform plan` | `+ create`: it noticed | "Terraform noticed reality doesn't match the code. That's **drift**." |
| 6 | `terraform apply` | back within seconds | "So, how long did it take you to rebuild yours?" |
| 7 | `terraform destroy` | clean slate | |

Demo-day risks (from `research/03`):
- Changing the port or page text forces a **replacement**, not an in-place update. That's fine, just narrate it.
- Run `init` beforehand on the demo laptop, commit `.terraform.lock.hcl`, and pre-pull `nginx:alpine`.
- Set `keep_locally = true` on the image.
- Don't use `-refresh=false` during the drift step.
- Rehearse the exact plan output; it is marked **(!)** in the research.
- Have a recorded backup ready.

**Research:** `research/03-terraform-arrives.md`

---

## 4. The team grows (2019–2022)

**Key message:** Once infrastructure is code, changing it becomes a pull request. That's where IaC meets DevOps, and where HashiCorp makes money.

**Slides**
1. Ten engineers. Two people run `apply` at once → corrupted **state**. Fix: shared remote state with **locking**. (Since Terraform 1.11, S3 can lock state itself; the DynamoDB approach is deprecated.)
2. **The pipeline:** pull request → CI runs `plan` → a colleague reviews the *plan*, not just the code → approval → `apply`. Tools: Atlantis, GitHub Actions, HCP Terraform.
3. A plan that humans can review can also be checked by machines: **policy as code** (Sentinel, OPA, and since 1.17, Terraform Policy).
4. **How HashiCorp makes money:** the CLI is free; teams pay for collaboration (remote runs, policy, single sign-on, audit logs) through **HCP Terraform**: $0.10, $0.47 or $0.99 per resource per month, depending on the tier. HashiCorp had 4,856 customers, 946 of them paying over $100k a year (figures for all HashiCorp products).
5. **Why job ads ask for it:** 17.8% of developers use Terraform (Stack Overflow 2025). UK job ads mentioning Terraform: 2,390, up 49% year on year, with a median salary of £75k (IT Jobs Watch). *Don't use the "88% of job ads" figures; they have no source.*
6. **Certifications:**

   | Exam | Price | Length |
   |---|---|---|
   | Associate (004) | $70.50 | 1 h |
   | Professional (002) | $200 | 90 min; includes CI/CD, policy, and the MCP server with AI agents |
   | Advanced | $295 | 4 h, hands-on labs |

   All three are valid for 2 years. Check the Advanced and Professional naming first: it's marked **(!)**.

**Speaker notes**
> This is where the talk's argument becomes concrete: reviewable code became reviewable change. Every company at this stage needs someone who knows this workflow, and that's the honest answer to "why do so many job ads ask for Terraform?" It's the same reason teams pay HashiCorp: not for the CLI, but for running it as a team.

**Research:** `research/04-team-grows.md`

---

## 5. The plot twist: the license change, plus the debate (2023–2025)

**Key message:** When a tool becomes the standard, who controls its license matters as much as its features.

**Slides**
1. **August 2023:** HashiCorp moves Terraform to the **BSL**. PortoBikes' lawyer asks: "are we affected?" (Using it: no. Selling a competing hosted Terraform service: yes.)
2. Six weeks later, **OpenTofu** forks, backed by the very competitors the BSL targeted. It's now in the CNCF Sandbox.
3. **2025:** IBM completes its $6.4B purchase of HashiCorp. CDK for Terraform is archived, and the old free tier ends.
4. **This has happened before:**

   | Company | Moved to a source-available license | Added an open-source (AGPL) license back |
   |---|---|---|
   | MongoDB | 2018 | no |
   | Elastic | 2021 | 2024 |
   | Redis | 2024 | 2025 |
   | HashiCorp | 2023 | no |

5. **THE DEBATE:** "PortoBikes must decide." QR poll, vote #1.
6. Three speakers, about 90 seconds each:
   - **Stay on Terraform:** the full product and HCP Terraform; newest features (Stacks, `terraform query`, Terraform Policy); the biggest community and job market.
   - **Move to OpenTofu:** an open-source license under neutral governance; features of its own (state encryption); real migrations.
   - **Rewrite in Pulumi:** real programming languages; Pulumi now reads HCL directly and offers credits to HashiCorp customers.
   - One line on Crossplane: "the option nobody argued for."
7. QR poll, vote #2. Show both results side by side.
8. 📍 **Real anchors: what companies actually did.** Fidelity moved ~50k state files to OpenTofu (*"really is a drop-in"*). GitLab replaced its Terraform templates with OpenTofu ones.
   - 🎬 **Live:** the OpenTofu speaker reruns the demo's `plan` with `tofu`. Skip this if it fails.

**Speaker notes**
> No winner gets announced. The honest answer is "it depends on the company." The research found **no named company publicly saying it's staying on Terraform**. The "stay" speaker should argue from usage share (62% in Firefly's vendor survey) and features, and can say openly: "companies that stay don't write blog posts about it." Full argument briefs, with counter-arguments, are in the research file.

**Research:** `research/05-license-change.md`

---

## 6. The future (2026 → 2036)

**Key message:** AI will write the infrastructure code, and that makes human review of `plan` more important, not less.

**Slides**
1. **IaC in 2026**, as a one-slide map of the practices built around the plan and state:
   - policy as code
   - GitOps (Argo CD, Flux)
   - drift detection
   - platform engineering (Backstage)
   - security scanners (Checkov, Trivy)
   - Terraform Stacks
2. **AI + IaC today:**
   - Terraform MCP server (generally available June 2026)
   - Pulumi Neo
   - AI-agent features in HCP Terraform
3. **Valid ≠ correct ≠ secure:**
   - the best model passed only 19% of IaC-Eval tasks (NeurIPS 2024)
   - one model's code passed Terraform's validity check 77.8% of the time, with 0% security compliance (SBSeg 2026)
4. 📍 **Real anchor: DataTalks.Club, February 2026.** An AI coding agent restored an outdated state file and ran `terraform destroy`, taking down the production setup. AWS support recovered the database after about 23 hours.
5. HashiCorp's own line: *"The agent can propose. It should not decide."*
6. **"Our bets for 2036":** 2–3 predictions the group commits to, clearly labelled as opinion. Raw material: DORA 2025 and Gartner forecasts (second-hand, **(!)**).

**Speaker notes**
> Tell the DataTalks.Club story fairly. In his own post-mortem, the author, Alexey Grigorev, blames his own setup: local state, no deletion protection, backups never tested. Gruntwork agrees: *"The operating model is what determined the blast radius."* It isn't "AI bad". It's "an agent skipped human review of the plan." That's turning point 1 again: Knight Capital's missing double-check, now with an AI agent in the operator's seat.

**Research:** `research/06-future.md`

---

## 7. Closing: Friday 18:00, again

**Slides**
1. **Friday, 18:00. The booking server is down.** → `terraform apply` → back within seconds.
2. One sentence: *Terraform turned infrastructure into reviewable code, and everything since has been about who reviews it: colleagues, policies, and now AI.*
3. The repo link and QR code: "Run the demo yourself."

**Speaker notes**
> At the start, we asked how long it would take you to rebuild that server. You just watched it take seconds.

---

## Q&A

The non-speakers lead. They prepare from `research/qa-prep.md`, which has 20 likely questions with spoken answers.
