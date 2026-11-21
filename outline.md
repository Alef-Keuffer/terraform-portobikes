# Outline: Infrastructure as Code with Terraform

**First draft.** Every fact here comes from `research/`. Before a fact goes on a slide, check whether it is marked **(!)** in the research file it came from. Use the words in `GLOSSARY.md`. The reasons behind this structure are in `docs/adr/0001-storyline-with-debate.md`.

**The argument running through the talk:** Terraform made infrastructure reviewable code. That's why it became the standard, and also why the license change and IBM's purchase of HashiCorp matter.

**Running order** (2026-11-25, in English; about 47 min in a one-hour slot, with Q&A after. Keep the rest as buffer, since we can't rehearse as a group):

| # | Section | Speaker | ~min |
|---|---|---|---|
| 0 | Opening hook: Friday 18:00 | Alef | 2 |
| 1 | ClickOps (2015) | S1 | 5.5 |
| 2 | Scripts and configuration management (2016) | S1 | 4 |
| 3 | Terraform arrives, plus the live demo | S2 + Alef (demo driver) | 13 |
| 4 | The team grows (2019–2022) | S2 | 7.5 |
| 5 | The plot twist: the license change, plus the debate (2023–2025) | S3 + all speakers | 8 |
| 6 | The future (2026 → 2036) | S3 | 6 |
| 7 | Closing: Friday 18:00, again | Alef | 1 |

Alef opens, closes, drives the demo and argues for OpenTofu in the debate. Daniella and Afonso speak, and S1–S3 get assigned once the slides are solid. S4 and S5 are optional slots for Al Mahmud and Sergio: they take debate sides first, then existing sections. Whoever doesn't speak keeps time with cards. Decisions and their reasons: `docs/grilling-2026-11-21.md`.

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
7. *(added 2026-11-21)* **What IaC buys you:** **speed** (new servers by "running the script", Fowler; environments "within minutes", AWS); **consistency** ("the same environment every time it deploys", Microsoft); an **audit trail** ("every change … can be logged", Fowler); **safe rollback** to "the last working configuration" (Fowler); **disaster recovery** (AWS: "you should always deploy using infrastructure as code" so infrastructure can be "redeployed quickly without errors"); **identical copies of environments** ("the same environment … in another location using the same IaC", AWS). Answers "what are the use cases and benefits?" from `ideas.md`. Source: `research/01-clickops.md` Part 3.

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
4. **CloudFormation had the right idea, inside AWS.** It was declarative, and from 2016 it even previewed changes (change sets). But it runs only in AWS and can't manage a second cloud. Non-AWS services work only where a vendor has published a type (since 2021).

**Speaker notes**
> Be careful here: don't claim Terraform invented the preview. CloudFormation had change sets from 2016. HashiCorp's own claim is "a consistent workflow to provision and manage all of your infrastructure", with a plan you approve first. Ansible isn't purely imperative either, so if someone asks, some of its modules are declarative.

**Research:** `research/02-scripts-and-config-management.md`

---

## 3. Terraform arrives, plus the live demo (2017)

**Key message:** You describe what should exist. `plan` shows exactly what will change before anything happens.

**Slides**
1. 📍 **Real anchor: Terraform almost didn't make it.** In 2014, Terraform v0.1 supported only AWS and DigitalOcean, chosen to prove that multiple **providers** could work. Its creator, Mitchell Hashimoto: downloads were "mostly stagnant for the first 18 months", and the team talked about "maybe shutting down the project". In 2017, "downloads continued to double every single month".
2. The core model as a diagram: code + **state** + reality → **plan** → **apply**.
3. The symbols in a plan: `+` create, `~` change, `-` destroy, `-/+` replace.
4. → **LIVE DEMO**
5. Backup slide: the same code targeting AWS. Only the provider block changes.
6. *(added 2026-11-21)* **How Terraform changed, 0.x → 1.x:** 0.1 (July 2014): AWS and DigitalOcean only. 0.12 (May 2019): HCL2, a real expression language. 0.13 (Aug 2020): providers installed from the Registry. 1.0 (June 2021): a compatibility promise, so upgrades within 1.x keep your configuration working. 1.5 (2023): import through a plan. 1.6 (Oct 2023): `terraform test`, and the first BSL release. 1.11 (2025): S3 locks state itself. 1.17 (Oct 2026): Terraform Policy is generally available. After 1.0, new features increasingly work *through the plan*. Answers "how did it change since it started?" from `ideas.md`. Source: `research/03-terraform-arrives.md` Part 3.

**Demo script** (driver types; S2 narrates). Rehearsed on 2026-11-04 with Terraform 1.17.1 and the Docker provider 4.6.0. The outputs below are real. The driver runs `demo/demo.sh`, which types each command and waits for Enter, so nothing is typed by hand. Setup is in `demo/README.md`. The backup video is `demo/recording.mp4`.

**Don't destroy here.** The server keeps running until the debate, where OpenTofu takes it over.

| Step | Command | What the class sees (real output) | Line for S2 |
|---|---|---|---|
| 1 | `terraform apply` | `Plan: 2 to add` → the page at `localhost:8080`: "PortoBikes — 5 EUR per hour" | "This is our booking server, written down." |
| 2 | change the price in `main.tf` → `terraform plan -out=tfplan` | `# docker_container.web must be replaced`, `upload { # forces replacement`, `Plan: 1 to add, 0 to change, 1 to destroy.` | "Before touching anything, it tells us exactly what it will do. And notice: this replaces the server. In production that means downtime, and we found out **before** pressing enter." |
| 3 | `terraform apply tfplan` | `Resources: 1 added, 0 changed, 1 destroyed.` → the new price is live | "What we reviewed is exactly what runs. Nothing gets recalculated." |
| 4 | `docker rm -f portobikes-web` | the page stops loading | "**Friday, 18:00.**" |
| 5 | `terraform plan -out=tfplan` | `# docker_container.web will be created`, `Plan: 1 to add` | "Terraform re-read reality, saw the server is gone, and wants to put it back. That's **drift** detection." |
| 6 | `terraform apply tfplan` | `Resources: 1 added` in under a second, with no `yes` prompt (a saved plan was already reviewed) → the page is back | "So, how long did it take you to rebuild yours?" |

During step 1 or 2, S2 says one sentence: *"By the way, this Docker provider is maintained by one volunteer, not by HashiCorp. Remember that when we talk about who controls these tools."*

Demo-day risks:
- Terraform does **not** print "Objects have changed outside of Terraform" when a container is deleted. The plan just says `will be created`. Don't promise the class a warning message.
- On Colima (and other non-default Docker setups), Terraform needs `DOCKER_HOST` set. See `demo/README.md`.
- Run `terraform init` beforehand on the demo laptop, and pre-pull `nginx:alpine`. The provider version is pinned by the committed `.terraform.lock.hcl`.
- Don't use `-refresh=false` or `-minimal-refresh`: both would hide the drift.
- Port 8080 must be free.
- Have a recorded backup ready.

**Research:** `research/03-terraform-arrives.md`

---

## 4. The team grows (2019–2022)

**Key message:** Once infrastructure is code, changing it becomes a pull request. That's where IaC meets DevOps, and where HashiCorp makes money.

**Slides**
1. Ten engineers. Two people run `apply` at once → corrupted **state**. Fix: shared remote state with **locking**. (Since Terraform 1.11, S3 can lock state itself; the DynamoDB approach is deprecated.)
2. **The pipeline:** pull request → CI runs `plan` → a colleague reviews the *plan*, not just the code → approval → `apply`. Tools: Atlantis, GitHub Actions, HCP Terraform.
3. *(added 2026-11-21)* **Where IaC sits in a DevOps pipeline**, as a diagram: commit → pull request → CI runs `terraform init` + `plan` → a human reviews the plan → merge → `apply` the saved plan → app deploy onto the environment it built. HashiCorp's own automation guide lists the same four steps: initialize, produce a plan, "have a human operator review that plan", apply. DORA: versioning infrastructure files "predicts continuous delivery". Answers "what is the relationship to DevOps?" from `ideas.md`. Source: `research/04-team-grows.md` Part 7.
4. A plan that humans can review can also be checked by machines: **policy as code** (Sentinel, OPA, and since 1.17, Terraform Policy).
5. **How HashiCorp makes money:** the CLI is free; teams pay for more concurrent runs, drift detection, policy sets and audit logs (remote runs and single sign-on are free) through **HCP Terraform**: $0.10, $0.47 or $0.99 per resource per month, depending on the tier (pricing page as of 2026-11-04). HashiCorp had 4,856 customers, 946 of them paying over $100k a year (all HashiCorp products, quarter ending Oct 2024, the last report before IBM).
6. **Why job ads ask for it:** **18.4%** of developers use Terraform (Stack Overflow 2025). UK job ads mentioning Terraform: about 2,300 in the last 6 months, median salary £75k (IT Jobs Watch, 6 months to 21 Nov 2026; re-check the day before, it's a rolling window). *Don't use the "88% of job ads" figures; they have no source.*
7. **Certifications:**

   | Exam | Price | Length |
   |---|---|---|
   | Associate (004) | $70.50 | 1 h |
   | Professional (002) | $200 | 90 min; includes CI/CD, policy, and the MCP server with AI agents |
   | Advanced | $295 | 4 h, hands-on labs |

   All three are current, separate exams, valid for 2 years; only Advanced includes a free retake.

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

5. **THE DEBATE:** "PortoBikes must decide." QR poll (`slide-quiz`, see `docs/adr/0002-debate-poll-in-the-slides.md`), vote #1. If the QR fails, the timekeeper counts a show of hands.
6. Three speakers, about 90 seconds each:
   - **Stay on Terraform:** the full product and HCP Terraform; newest features (Stacks, `terraform query`, Terraform Policy); the biggest community and job market.
   - **Move to OpenTofu** (Alef): an open-source license under neutral governance; features of its own (state encryption); real migrations.
   - **Rewrite in Pulumi:** real programming languages; Pulumi now reads HCL directly and offers credits to HashiCorp customers.
   - One line on Crossplane: "the option nobody argued for."
7. QR poll, vote #2. Show both results side by side. (On the GitHub Pages copy, this slide shows screenshots of the results.)
8. 📍 **Real anchors: what companies actually did.** Fidelity runs 50,000+ state files on Terraform/OpenTofu and made OpenTofu the default for new deployments (*"a technical drop-in"*; *"Changing the CLI in a pipeline is trivial"*). GitLab replaced its Terraform CI/CD templates with OpenTofu components, citing the BSL.
   - 🎬 **Live** (the last part of `demo/demo.sh`): the OpenTofu speaker runs `tofu init`, then `tofu plan` against the server Terraform built. Result: `No changes. Your infrastructure matches the configuration.` Then `tofu destroy` cleans up. If it fails, play the end of `demo/recording.mp4`.
   - Honest caveat for the "stay" speaker: `tofu init` rewrites the provider lock file, so the two tools can't share one without re-running `init`. "Drop-in, mostly."

**Speaker notes**
> No winner gets announced. The honest answer is "it depends on the company." The research found **no named company publicly saying it's staying on Terraform**. The "stay" speaker should argue from usage share (62% "market share" vs 12% using OpenTofu, in Firefly's 2025 vendor survey) and features, and can say openly: "companies that stay don't write blog posts about it." Full argument briefs, with counter-arguments, are in the research file.

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
   - the best model tested (GPT-4) passed only 19% of IaC-Eval's Terraform tasks (NeurIPS 2024)
   - one model's code passed Terraform's validity check 77.8% of the time, with 0% security compliance (SBSeg 2026)
4. 📍 **Real anchor: DataTalks.Club, February 2026.** An AI coding agent restored an outdated state file and ran `terraform destroy`, taking down the production setup. AWS support restored the database after about 24 hours.
5. HashiCorp's own line: *"The agent can propose. It should not decide."*
6. **"Our bets for 2036":** 2–3 predictions the group commits to, clearly labelled as opinion. Raw material: DORA 2025 and Gartner forecasts (Gartner second-hand via press and vendors; label them as reported opinion).

**Speaker notes**
> Tell the DataTalks.Club story fairly. In his own post-mortem, the author, Alexey Grigorev, blames his own setup: local state, no deletion protection, backups never tested. Gruntwork agrees: *"The operating model is what determined the blast radius."* It isn't "AI bad". It's "an agent skipped human review of the plan." That's turning point 1 again: Knight Capital's missing double-check, now with an AI agent in the operator's seat.

**Research:** `research/06-future.md`

---

## 7. Closing: Friday 18:00, again

**Slides**
1. **Friday, 18:00. The booking server is down.** → `terraform apply` → back within seconds.
2. One sentence: *Terraform turned infrastructure into reviewable code, and everything since has been about who reviews it: colleagues, policies, and now AI.*
3. The repo link and a QR code pointing to the GitHub repo (not to a deck, since the Netlify one is taken down after the talk): "Run the demo yourself."

**Speaker notes**
> At the start, we asked how long it would take you to rebuild that server. You just watched it take seconds.

---

## Q&A

The non-speakers lead. They prepare from `research/qa-prep.md`, which has 20 likely questions with spoken answers.
