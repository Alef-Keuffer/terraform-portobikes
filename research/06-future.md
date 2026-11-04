# Turning point 6: the future (2026 → 2036)

Research checked 2026-11-04. Key: [P] = primary source, [S] = secondary source, **(!)** = uncertain or contested; check before it goes on a slide.

## Key points for the talk

- **IaC grew an ecosystem around the plan.** Policy as code, drift detection, security scanners and platform engineering all exist because infrastructure became reviewable code. Each one inspects or gates the **plan** and the **state**. That is the talk's thread carried into 2026.
- **AI writes IaC, but valid is not the same as correct or secure.** The best model in the NeurIPS 2024 IaC-Eval benchmark passed only 19.36% of tasks. A 2026 SBSeg study found one model with a 77.8% validate rate and 0% Checkov compliance.
- **DataTalks.Club is the cautionary real anchor.** The author's own post-mortem blames over-reliance on the agent, local **state**, missing deletion protection and unchecked backups. Gruntwork agrees: "The operating model is what determined the blast radius."
- **Vendors now pitch the plan as the AI guardrail.** HashiCorp's line is "The agent can propose. It should not decide." The guardrails are mandatory policy between **plan** and **apply**, per-run credentials, and delete commands that an autonomous agent cannot confirm.
- **Analysts expect agents to run much of infrastructure operations by about 2030, and to break things along the way.** Gartner, as reported: 60% of enterprises will deploy agentic AI in infrastructure operations by 2029, and 40% of heavy users will suffer a business-critical disruption by 2028. These are opinion, not fact.

---

## Part 1: The "IaC in 2026" map

**Policy as code (Sentinel, OPA).** Rules such as "no public S3 buckets" are written as code and checked automatically on every run. In HCP Terraform, Sentinel "runs … after a `terraform plan` and before a `terraform apply`", with access to the plan, state and configuration [P]. HCP Terraform also accepts Open Policy Agent policies written in Rego. Policies are *advisory* (they warn) or *mandatory* (they stop the run unless someone with override permission intervenes). The free edition allows one policy set of up to five policies [P]. OPA itself is a general-purpose policy engine and has been a CNCF Graduated project since 2021-01-29 [P]. For the talk: once the plan became a reviewable artifact, machines could review it as well as humans.

**GitOps (Argo CD, Flux).** GitOps takes IaC one step further: an agent inside the platform continuously *pulls* the desired state from Git and corrects drift on its own. The four OpenGitOps principles are: declarative; versioned and immutable; pulled automatically; continuously reconciled [P]. Flux and Argo CD both graduated in the CNCF in late 2022 [P/S]. Both are Kubernetes-centric. Terraform's classic model is push-based (someone runs `apply`), which is the main difference to point out.

**Automatic drift detection.** HCP Terraform "health assessments" periodically re-plan a workspace to find **drift**, where real infrastructure no longer matches the configuration (for example, after a ClickOps edit). The documentation's example uses a 24-hour cadence. The fix is either to apply the code again or to update the code to accept the change. A related check, *continuous validation*, re-runs `check` blocks and pre- and postconditions. Both are limited to the Standard and Premium editions [P]. Pulumi Neo offers scheduled drift checks delivered as pull requests [P].

**Platform engineering and internal developer platforms (Backstage).** Platform teams wrap IaC modules in self-service portals, so application developers request "a database" rather than writing HCL. Backstage, "an open platform for building developer portals", is CNCF Incubating (accepted 2020, Incubating since 2022-03-15) [P]. The 2025 DORA report (Google) found that "90% of organizations have adopted at least one platform". It also found a direct correlation between platform quality and getting value from AI [P]. Gartner's widely repeated forecast that 80% of software engineering organisations would have platform teams by 2026 circulates mostly second-hand **(!)** [S]. HashiCorp's own entry is the Terraform Developer Portal (public preview) [P].

**IaC security scanning (Checkov, tfsec → Trivy, KICS).** These are static analysers that flag misconfigurations before deployment.
- **Checkov:** branded Prisma Cloud / Palo Alto Networks. It scans Terraform, Terraform plans, CloudFormation, Kubernetes, Helm, AWS CDK and more [P].
- **tfsec:** Aqua Security now tells users to "transition over to Trivy", and "engineering attention will be directed at Trivy". tfsec "will continue to remain available for the time being"; the repository is not archived [P]. Sources disagree on when the merger happened (2023 or 2024) **(!)** [S].
- **KICS:** from Checkmarx, Apache-2.0. It covers Terraform, OpenTofu, Pulumi, Crossplane, Ansible and others [P].

These are the same scanners the AI-quality papers use as their yardstick (Part 2).

**Terraform Stacks.** A layer above workspaces for deploying many modules together across environments and regions. Announced GA for new HCP Terraform plans at HashiConf on 2025-09-25 [P]. Limits: a Stack can link to up to 20 upstream Stacks and expose values to 25 downstream ones; not available on legacy team plans [P]. The same event introduced Terraform Search (bulk discovery and import of unmanaged resources) and Terraform Actions (Day-2 operations such as triggering an Ansible playbook), both in public beta [P].

**HCP Terraform powered by Infragraph.** "A centralized, event-driven knowledge graph" of the whole estate: managed *and unmanaged* resources, ownership and cost. It can be queried in natural language and is explicitly positioned as "the knowledge foundation" for future AI-driven workflows [P].
- **Origin:** previewed as Project Infragraph in September 2025 [P].
- **Public preview:** announced 2026-05-04 at IBM Think, open from 2026-05-08 to qualified US customers [P].
- **Limited availability:** a later post extends it to US Standard and Premium customers and adds Azure, GitHub and Terraform Enterprise connectors (exact date not checked **(!)**) [P].

---

## Part 2: AI + IaC today

**Terraform MCP server.** It connects AI assistants (Claude Code, GitHub Copilot, IBM Bob) to Terraform through the Model Context Protocol [P].
- **History:** open-sourced in May 2025; GA for HCP Terraform and Terraform Enterprise on 2026-06-11 (already in research-notes).
- **Capabilities:** searching the private registry for approved modules, answering questions about workspaces, and explaining plans in natural language.
- **Safety model:** it uses the user's existing authentication and authorisation, and credentials never reach the model [P].
- **Default:** the setting that enables run-creating tools, `ENABLE_TF_OPERATIONS`, defaults to `false` [P, GitHub README]. One blog says the flag gates `create_run` (applying against a workspace); this is unconfirmed in the README **(!)** [S].
- **Remote server:** a hosted version is in public preview [P].

**HCP Terraform agent features.**
- **tfctl** (2026-06-16): a first-party CLI for HCP Terraform and Terraform Enterprise, built for engineers *and* agents. Every command can preview its changes, and "Delete commands require interactive confirmation, making them effectively inoperable by autonomous agents, by design" [P].
- **Five layers of control** (blog of 2026-08-05): provenance, policy, identity, isolation and audit. Agents run under a project-scoped identity, with dynamic credentials issued per run and revoked afterwards. Mandatory policy sits between plan and apply, where an agent cannot skip it. Core line: "The agent can propose. It should not decide." [P]

**Pulumi Neo.** An AI "platform engineer" agent, launched in public preview 2025-09-16. It works within Pulumi's RBAC, policy as code and audit trail, with "human-in-the-loop approvals and controls" [P]. Later updates added operating modes, CLI access via `pulumi neo`, and Claude Sonnet 4.5 as the default model [P]. Pulumi also says Neo can turn policy violations into fix pull requests [P].

**Research on AI-generated IaC quality.**
- **IaC-Eval (NeurIPS 2024):** 458 human-curated AWS scenarios. "Contemporary LLMs perform poorly": GPT-4 reached 19.36% pass@1, against 86.6% on a Python benchmark [P]. Sources disagree on whether the benchmark targets Terraform or CloudFormation; the abstract names neither **(!)**.
- **Error taxonomy (arXiv 2512.14792):** few-shot and chain-of-thought prompting helped little; retrieval-augmented generation helped most [P].
- **GenSIaC (arXiv 2511.12385):** LLMs often miss security misconfigurations. Fine-tuning on a security dataset raised F1 from 0.303 to 0.858 [P].
- **SBSeg 2026 (Vargas, Mansilha, Kreutz, UNIPAMPA):** seven models on 17 AWS Terraform scenarios, scanned with Checkov and Trivy. Validity and security are "largely independent": WizardCoder-33B had a 77.8% validate rate and 0% Checkov compliance, while Claude Opus 4 with detailed security prompts reached 23.1% Checkov and 92.5% Trivy pass rates. "Prompt engineering alone is insufficient" [P].
- **Earlier study:** only 8.4% security compliance even after several rounds of iterative correction [S, cited by the SBSeg paper and Sonar].
- **Sector context:** the 2025 DORA report found 90% of developers use AI at work, but 30% have little or no trust in AI-generated code [P].

### The DataTalks.Club incident in depth

The primary source is Alexey Grigorev's own post-mortem, "How I Dropped Our Production Database and Now Pay 10% More for AWS" (2026-03-06) [P]. Detailed timeline below.

1. **Context.** He wanted to move his AI Shipping Labs site to AWS. To save roughly $5–10 a month, he added it to the existing Terraform setup that also ran the DataTalks.Club course platform. He writes that Claude had advised keeping the two separate.
2. **2026-02-26, around 22:00.** He started deploying from a new computer. The Terraform state was still on the old machine, so Terraform saw "nothing exists" and planned to create duplicates. He let Claude Code run `plan` and `apply` instead of reviewing the plan himself. He noticed many new resources and stopped the run, but some had already been created.
3. **Cleanup.** He asked the agent to delete only the new duplicates. He then pointed it at an archived Terraform folder, containing the *old* state file, "for comparison". The agent unpacked it, so the old state, which described production, replaced the current one. He says he did not notice this happen.
4. **Around 23:00, `terraform destroy`.** The agent proposed a destroy, and he let it run, believing only duplicates would go. It deleted the VPC, RDS database, ECS cluster, load balancers and bastion host. The automated snapshots went too, because they were deleted along with the database.
5. **Recovery.** He upgraded to AWS Business Support at around midnight, which he puts at "about 10%" on top of his AWS bill (hence the title). AWS found a snapshot that was not visible in his console, escalated internally, and restored it. He rebuilt the rest of the infrastructure with Terraform. The platform was back at about 22:00 on 2026-02-27, with 1,943,200 rows in `courses_answer`.
6. **Root causes he names.** "I over-relied on the AI agent to run Terraform commands." "I also over-relied on backups that I assumed existed." "The database was too easy to delete." Also: local state on one laptop, and unrelated infrastructure mixed in one configuration.
7. **What he changed.**
   - Terraform state moved to S3.
   - Backups kept outside Terraform, with S3 versioning on the backup buckets.
   - Deletion protection in both Terraform and AWS.
   - A nightly Lambda / Step Functions job that test-restores the latest backup.
   - Agents no longer execute commands. He reviews every plan and runs destructive actions himself.
   - Considering separate AWS accounts for development and production.

The AI Incident Database lists this as Incident 1424, dated 2026-02-26 [P]. Media coverage framed it as "Claude Code wiped 2.5 years of data" [S], but the data was recovered after about 24 hours.

**Gruntwork's counter-view.** In a post of 2026-04-15, Oreoluwa Agunbiade (Gruntwork) argues "That's not exactly what happened." He calls it "a story about brittle state handling, ad hoc execution, broad permissions", not AI acting on its own. AI only increases the number and speed of changes. "The solution is not to remove AI": instead, run AI-proposed changes through CI, with remote state, separate plan and apply steps, scoped credentials, reviewed destructive changes and protected critical resources. "The operating model is what determined the blast radius." [S, vendor opinion]

*Link to the talk:* every safeguard the author lacked is a practice from turning point 4 (remote state, locking, reviewed plans). The agent did not invent a new failure; it reached an old one faster.

---

## Part 3: Raw material for "Our bets for 2036"

Everything in this section is **opinion or forecast**, not fact.

**Analyst forecasts**
- **Gartner, *Hype Cycle for AI in IT Operations* (July 2026), as reported by The Register** [S] **(!)** (the Gartner document itself is paywalled; not checked):
  - 60% of enterprises will deploy agentic AI in infrastructure operations by 2029, up from fewer than 10%.
  - By 2029, only 20% of AI-suggested actions will pass through human approval, down from 80% in 2025.
  - By 2028, 40% of organisations running agentic I&O at scale will suffer a business-critical disruption.
  - By 2030, 25% of I&O work will be done by AI alone and 75% by humans augmented with AI.
- **Gartner, *Market Guide for AI Assistants for IaC* (27 March 2026), as quoted by the vendor Itential** [S] **(!)**:
  - 70% of enterprises will use agentic AI for IaC generation and drift remediation by 2029, up from under 1% in 2026.
  - 90% of infrastructure and operations (I&O) organisations will have context-aware AI assistants in their IaC workflows by 2029, up from 5%.
- **Gartner, platform teams:** the "80% of software engineering organisations by 2026" forecast (2022). Useful for checking how the 2026 forecasts turned out; quoted second-hand **(!)** [S].

**Contrarian views**
- **"IaC has gone as far as it can go":** Adam Jacob (co-founder of Chef) built System Initiative on the argument that "We've taken that idea [declarative configuration] as far as it can go", modelling infrastructure as a live digital twin instead. In August 2025 it relaunched as an "AI-native" platform where engineers and agents edit the model directly [S]. Its 2026 status is not checked **(!)**.
- **"Back to fundamentals":** the Thoughtworks Technology Radar Vol. 34 (April 2026) themes include "putting coding agents on a leash" and "securing permission-hungry agents" [S].

**Trends these forecasts rest on**
1. Agents need a machine-readable, reviewable interface to infrastructure, which is exactly what HCL, the plan and the state provide. Vendors are rebuilding the plan as an AI guardrail (MCP server defaults, tfctl, policy gates) [P].
2. Context graphs such as Infragraph aim to cover the unmanaged estate as well as code, so the "source of truth" may widen beyond Git [P].
3. Platform engineering is near-universal (DORA: 90%), and platforms are where AI pays off [P].
4. Validity is not safety (IaC-Eval, SBSeg 2026), so scanners and policy remain essential [P].
5. The governance fork (Terraform under IBM vs OpenTofu at the CNCF) will shape which tool agents are trained and tooled for (see 05-license-change.md).

Questions the group could take a position on:
- Will humans still write HCL in 2036?
- Will "plan review" become a mostly machine-to-machine step?
- Will one tool remain the standard?

---

## Sources

- Grigorev post-mortem: https://aishippingblog.com/p/how-i-dropped-our-production-database (originally alexeyondata.substack.com)
- AI Incident Database #1424: https://incidentdatabase.ai/cite/1424
- Gruntwork counter-view: https://www.gruntwork.io/blog/thinking-of-using-ai-with-terraform
- Tom's Hardware coverage: https://www.tomshardware.com/tech-industry/artificial-intelligence/claude-code-deletes-developers-production-setup-including-its-database-and-snapshots-2-5-years-of-records-were-nuked-in-an-instant
- Terraform MCP server GA: https://www.hashicorp.com/blog/terraform-mcp-server-is-now-generally-available
- MCP server README: https://github.com/hashicorp/terraform-mcp-server
- `create_run` claim (blog): https://heyvaldemar.com/terraform-mcp-server-ga-agentic-iac-governance/
- tfctl: https://www.hashicorp.com/en/blog/introducing-tfctl-the-cli-for-hcp-terraform-and-tfe
- Control plane for AI: https://www.hashicorp.com/en/blog/hcp-terraform-is-the-control-plane-for-ai-driven-infrastructure
- Agentic era / remote MCP / Developer Portal: https://www.hashicorp.com/en/blog/terraform-advances-infrastructure-lifecycle-management-for-the-agentic-era ; https://www.hashicorp.com/en/blog/introducing-terraform-developer-portal
- HashiConf 2025 (Stacks GA, Search, Actions): https://www.hashicorp.com/en/blog/scale-infrastructure-with-new-terraform-and-packer-features-at-hashiconf-2025
- Stacks docs: https://developer.hashicorp.com/terraform/cloud-docs/stacks
- Infragraph: https://www.hashicorp.com/en/blog/introducing-hcp-terraform-powered-by-infragraph-in-public-preview ; https://www.hashicorp.com/en/blog/hcp-terraform-powered-by-infragraph-limited-availability-launch ; https://newsroom.ibm.com/2025-09-25-hashicorp-previews-the-future-of-agentic-infrastructure-automation-with-project-infragraph
- Sentinel: https://developer.hashicorp.com/sentinel/docs/terraform
- OPA in HCP Terraform: https://developer.hashicorp.com/terraform/cloud-docs/workspaces/policy-enforcement/define-policies/opa ; https://developer.hashicorp.com/terraform/cloud-docs/workspaces/policy-enforcement/manage-policy-sets
- OPA (CNCF): https://www.cncf.io/projects/open-policy-agent-opa/
- Drift detection: https://developer.hashicorp.com/terraform/cloud-docs/workspaces/health
- OpenGitOps: https://opengitops.dev/
- Flux graduation: https://opengitops.dev/blog/flux-cncf-graduation ; Argo/Flux: https://www.techtarget.com/searchitoperations/news/252528152/GitOps-hits-stride-as-CNCF-graduates-Flux-CD-and-Argo-CD
- Backstage: https://www.cncf.io/projects/backstage/
- DORA 2025: https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report
- Checkov: https://www.checkov.io/
- tfsec → Trivy: https://github.com/aquasecurity/tfsec
- KICS: https://github.com/Checkmarx/kics
- Pulumi Neo: https://www.pulumi.com/blog/pulumi-neo/ ; https://www.pulumi.com/blog/neo-levels-up/ ; https://www.pulumi.com/blog/2025-product-launches/
- IaC-Eval: https://proceedings.neurips.cc/paper_files/paper/2024/hash/f26b29298ae8acd94bd7e839688e329b-Abstract.html
- Error taxonomy: https://arxiv.org/abs/2512.14792
- GenSIaC: https://arxiv.org/abs/2511.12385
- SBSeg 2026: https://sol.sbc.org.br/index.php/sbseg/article/view/44342
- Sonar (8.4% figure): https://www.sonarsource.com/blog/ai-is-writing-more-of-your-terraform/
- Gartner via The Register: https://www.theregister.com/a/5274712
- Gartner via Itential: https://www.itential.com/resource/analyst-report/gartner-market-guide-for-ai-assistants-for-infrastructure-as-code/
- Platform-teams forecast (secondary): https://www.webpronews.com/platform-engineerings-devops-overhaul-80-adoption-by-2026
- System Initiative: https://thenewstack.io/system-initiative-goes-live-beyond-infrastructure-as-code/ ; https://thenewstack.io/system-initiative-a-devops-makeover-by-ex-chef-adam-jacob/
- Thoughtworks Radar Vol. 34: https://www.aap.com.au/aapreleases/cision20260415ae29507/
