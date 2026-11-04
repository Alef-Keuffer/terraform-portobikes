# Q&A preparation (checked 2026-11-04)

Questions the audience is likely to ask that the talk itself does **not** answer. Each one has a short spoken answer (2–4 sentences), a "go deeper" line in case of a follow-up, and sources.

Key: **(!)** = uncertain, or our own interpretation. Don't state it as fact without a caveat. Terms follow `GLOSSARY.md`.

---

## Fundamentals

### 1. Isn't Kubernetes YAML also Infrastructure as Code?
**Answer:** Mostly yes. Kubernetes manifests in Git, applied with `kubectl apply`, are declarative: you describe objects and `kubectl` works out whether to create, patch or delete each one. The difference is scope. Manifests manage objects *inside* a cluster that already exists. They don't create the cluster, the network or the database it depends on, and that is where Terraform usually comes in. Many teams use both: Terraform for the cluster and the cloud around it, and manifests (or Helm/GitOps) for what runs inside.
**Go deeper:** `kubectl diff` plays roughly the same role as Terraform's plan. Kubernetes warns that mixing management techniques on the same object "results in undefined behavior", which is the same lesson as drift. Crossplane goes the other way and manages cloud resources from inside Kubernetes (CNCF Graduated, Nov 2025, per research-notes).
**Sources:** https://kubernetes.io/docs/concepts/overview/working-with-objects/object-management/ ; https://www.cncf.io/projects/crossplane/

### 2. Is Terraform really multi-cloud if every provider's resources are different?
**Answer:** It is multi-cloud in *workflow*, not in *code*. The language, plan/apply, state, modules and review process are the same everywhere, but each provider "adds a set of resource types" specific to its platform. So an AWS VM and a Google Cloud VM are different resource types with different arguments, and moving clouds means rewriting those resource blocks. What you keep is the skills, the pipeline, and the ability to manage several platforms in one configuration.
**Go deeper:** That's why the GLOSSARY defines provider as "moving the same workflow to a different platform means switching providers". Our Docker demo uses the same plan/apply loop as AWS would.
**Sources:** https://developer.hashicorp.com/terraform/language/providers

### 3. Why does Terraform need a state file at all, when Azure Bicep doesn't?
**Answer:** Terraform talks to many unrelated APIs, so it needs its own record of which real object belongs to which block of code. That record is the state. Bicep only targets Azure, and Microsoft says "Azure stores all states", so Azure Resource Manager itself is the source of truth. The cost of Terraform's approach is that you have to store, lock, protect and back up the state yourself. The benefit is that one tool works across clouds, SaaS products and Docker.
**Go deeper:** HashiCorp's docs say state's primary purpose is storing the bindings between remote objects and declared resources, and they link to a page on why Terraform "cannot function without state".
**Sources:** https://developer.hashicorp.com/terraform/language/state ; https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview

---

## Operations

### 4. What happens if the state file is lost or corrupted?
**Answer:** The infrastructure keeps running, but Terraform no longer knows it owns it. The next plan proposes to create everything again, which leads to duplicates or name conflicts. That's why state belongs in a remote backend with versioning: HashiCorp says it is "highly recommended" to enable bucket versioning on the S3 backend. The recovery path is to pull an older version and push it back (`terraform state pull` / `terraform state push`). If no backup exists, you re-import the resources one by one (see Q7).
**Go deeper:** Locally, Terraform keeps only one previous copy (`terraform.tfstate.backup`). The DataTalks.Club incident began exactly this way: the state lived on an old laptop, so the plan saw production as "to be created". Never hand-edit the JSON.
**Sources:** https://developer.hashicorp.com/terraform/language/state ; https://developer.hashicorp.com/terraform/language/backend/s3 ; https://developer.hashicorp.com/terraform/cli/state/recover ; https://www.gruntwork.io/blog/thinking-of-using-ai-with-terraform

### 5. How are secrets handled, and why do they leak into state?
**Answer:** Marking a variable `sensitive` only hides it from the terminal and UI. In HashiCorp's own words, Terraform "stores values with the `sensitive` argument in both state and plan files". That happens because state has to record the real attributes of each resource, and a database password is one of them. The newer fix is *ephemeral* values (Terraform 1.10+) and *write-only* arguments (1.11+, usually named `..._wo`), which Terraform "omits from state and plan files entirely". Until every provider supports these, treat the state file itself as a secret: encrypted backend, tight access.
**Go deeper:** OpenTofu went a different way and added built-in state and plan encryption in 1.7 (April 2024), with keys from AWS KMS, GCP KMS, OpenBao and others. Terraform CLI has no equivalent, which makes it a good point for the debate. OpenTofu also warns that a lost key makes the state "unrecoverable".
**Sources:** https://developer.hashicorp.com/terraform/language/manage-sensitive-data ; https://opentofu.org/docs/language/state/encryption/ ; https://opentofu.org/blog/opentofu-1-7-0/

### 6. How do you test Terraform code?
**Answer:** In layers. `terraform validate` and formatting catch syntax errors. Static scanners such as Checkov catch insecure settings. Terraform has had a built-in test framework since 1.6 (October 2023): `.tftest.hcl` files with `run` blocks and assertions. A run with `command = plan` tests logic without creating anything, and the default (`apply`) creates real short-lived infrastructure, checks it, then destroys it. Since 1.7 you can also mock providers, so unit tests need no cloud account.
**Go deeper:** Before the built-in framework, the usual tool was Gruntwork's Terratest, a Go library. In teams, the reviewed plan in the PR is itself a test, and policy-as-code (Sentinel/OPA in HCP Terraform) enforces rules like "no public buckets".
**Sources:** https://developer.hashicorp.com/terraform/language/tests ; https://github.com/hashicorp/terraform/releases/tag/v1.6.0 ; https://terratest.gruntwork.io/

### 7. How do you import infrastructure that was created by hand?
**Answer:** You add an `import` block with the real resource's ID and run `terraform plan -generate-config-out=...`, and Terraform writes the matching `resource` block for you. You review and clean up that code, then apply, and the resource is now managed without being recreated. For large estates, Terraform 1.14 added `terraform query`: you write `list` blocks in `.tfquery.hcl` files to find existing resources, and it can generate import configuration in bulk.
**Go deeper:** Generated code is a starting point, not finished code: it often hard-codes values you'd want as variables. Bulk discovery only works if the provider implements "list resources", and support is still partial (for example, a GitHub provider issue reports a missing list resource). OpenTofu had loopable import blocks since 1.7. For PortoBikes, this is how the ClickOps-era servers would be brought under Terraform.
**Sources:** https://developer.hashicorp.com/terraform/language/import ; https://developer.hashicorp.com/terraform/language/import/bulk ; https://github.com/hashicorp/terraform/releases/tag/v1.14.0 ; https://github.com/integrations/terraform-provider-github/issues/2955

### 8. How do you separate dev, staging and production?
**Answer:** The tempting answer is CLI workspaces, but HashiCorp itself warns they "are not appropriate for system decomposition or deployments requiring separate credentials and access controls". The common pattern is a separate root configuration and separate state per environment, all reusing the same modules. In HCP Terraform, each environment is its own workspace with its own variables and permissions, and that kind of workspace is a different concept from a CLI workspace.
**Go deeper:** The point of separate state is blast radius: a bad apply in dev cannot touch prod's state. Tools such as Terragrunt exist mainly to reduce the copy-paste this causes **(!)** (not verified for this doc).
**Sources:** https://developer.hashicorp.com/terraform/language/state/workspaces

### 9. Every tutorial uses S3 plus DynamoDB for locking. Is that still right?
**Answer:** Not anymore. The S3 backend now supports native locking with `use_lockfile`, and HashiCorp's docs state that "DynamoDB-based locking is deprecated" and will be removed in a future minor version. Both can be configured at the same time during a migration. Note that locking is opt-in: if you don't enable it, two people can still apply at once.
**Go deeper:** This is a good example of why we checked the official docs instead of tutorials: the 2022-era blog-post setup is now legacy.
**Sources:** https://developer.hashicorp.com/terraform/language/backend/s3

---

## Business & licensing

### 10. Does the BSL affect us as users?
**Answer:** For almost everyone in this room, no. HashiCorp's license page says "hosting or using the Licensed Work(s) for internal purposes within an organization is not considered a competitive offering", and production use is allowed. The restriction only applies if you offer Terraform to third parties as a *paid* hosted or embedded product that overlaps with HashiCorp's paid offerings. So the companies really affected were vendors such as Spacelift, env0 and Scalr, which backed OpenTofu **(!)** (vendor names from general knowledge, not checked for this doc).
**Go deeper:** The license page defers to a separate FAQ for "binding interpretive guidance". Gray areas like consultancies or internal platforms sold to subsidiaries are worth reading there; affiliates "under common control" count as the same organisation. The awkward follow-up "then why does it matter?" is answered by the talk's thesis: the *ecosystem* depended on the CLI being open.
**Sources:** https://www.hashicorp.com/en/bsl

### 11. Can students use HCP Terraform for free?
**Answer:** Yes, through the normal free tier, not a student programme. Since the legacy free plan ended on 2026-03-31, the free tier covers up to 500 managed resources with unlimited users. It even includes SSO, policy as code (Sentinel and OPA), run tasks and cost estimation. A class project with a few dozen resources fits easily. We found no HashiCorp student or academic offer for HCP Terraform **(!)**: our search found nothing official, which doesn't prove none exists.
**Go deeper:** Resources count from their first plan or apply, and `null_resource`s don't count. The Terraform CLI and OpenTofu are free regardless; HCP Terraform is only needed for the hosted team features.
**Sources:** https://www.hashicorp.com/en/blog/continuing-hcp-terraform-s-enhanced-free-tier-experience ; https://www.hashicorp.com/en/pricing

### 12. Will the BSL versions ever become open source again?
**Answer:** Yes, on a delay. The BSL's change license is MPL 2.0, and each version converts four years after it was first published. Terraform 1.6.0 was released on 2023-10-04, so by our reading it becomes MPL 2.0 around **October 2027** **(!)** (our calculation from the license terms, not a date HashiCorp states). Each newer version follows four years after its own release, so the open version is always four years behind.
**Go deeper:** That's why OpenTofu forked from 1.5.x, the last MPL release: waiting meant always being four years behind.
**Sources:** https://www.hashicorp.com/en/bsl ; https://github.com/hashicorp/terraform/releases/tag/v1.6.0

---

## Comparisons

### 13. How is this different from Ansible?
**Answer:** They solve neighbouring problems. Ansible is agentless, connects over SSH and runs YAML playbooks of ordered tasks. Its main strength is *configuration management*: keeping existing machines in a consistent state (packages, files, services). Terraform focuses on *provisioning*: creating and wiring the infrastructure itself. It also keeps state and shows a plan of the whole change before doing anything. A common combination is Terraform to create the VMs, then Ansible to configure what runs on them.
**Go deeper:** The overlap is real: Ansible has cloud modules and Red Hat also describes provisioning with playbooks. Without a state file, Ansible doesn't know about a resource you *removed* from the playbook, while Terraform plans to destroy it. Per the Stack Overflow 2025 survey (research-notes), Terraform was used by 17.8% of respondents and Ansible by 11.7%.
**Sources:** https://www.redhat.com/en/topics/automation/learning-ansible-tutorial ; https://survey.stackoverflow.co/2025/technology

### 14. Why not just use the cloud provider's own tool (CloudFormation, Bicep)?
**Answer:** If you are truly single-cloud, that's a reasonable choice. Bicep, for example, supports new Azure resource types from day one, is free, and has no state to manage. You lose one workflow across everything: DNS at Cloudflare, monitoring in Datadog, GitHub repos, and a second cloud all need different tools. The tools also aren't permanent: Google's Deployment Manager lost support on 2026-04-01, will be turned down after 2027-06-30, and its successor, Infrastructure Manager, runs Terraform.
**Go deeper:** Bicep has a "what-if" preview similar to a plan. AWS CloudFormation dates from 2011 (research-notes). The Google case is a strong anchor: the provider's own tool was replaced by Terraform.
**Sources:** https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview ; https://docs.cloud.google.com/deployment-manager/docs/deprecations

### 15. Is OpenTofu really a drop-in replacement, and can we go back?
**Answer:** Going *to* OpenTofu is designed to be easy: the project "aims to maintain compatibility with Terraform configurations", and Fidelity called it "a drop-in" after moving tens of thousands of state files. The two have been diverging since 2024, though. OpenTofu has state encryption and loopable imports, while Terraform has features like `terraform query` that OpenTofu is still discussing. The more of those features you use, the harder it is to go back.
**Go deeper:** OpenTofu's guide calls the migration "safe and reversible" but doesn't document the way back **(!)**. Setups that share data through `terraform_remote_state` need extra care. OpenTofu has an open issue to support `query`/`list`.
**Sources:** https://opentofu.org/docs/intro/migration/ ; https://opentofu.org/blog/fidelity-investment-migration/ ; https://github.com/opentofu/opentofu/issues/3787

### 16. If Pulumi is the alternative, is it actually independent of Terraform?
**Answer:** Only partly. Many of Pulumi's main providers, including AWS and Google Cloud, are *bridged* providers, which "take a Terraform or OpenTofu provider as an underlying dependency". Pulumi can even wrap almost any Terraform provider. So switching to Pulumi changes the language and the engine, but much of the code that talks to cloud APIs is still the Terraform provider ecosystem.
**Go deeper:** This supports the talk's thesis that the provider ecosystem is the real asset. It's also a good counter in the debate when the Pulumi speaker claims a clean break.
**Sources:** https://www.pulumi.com/docs/iac/concepts/providers/

---

## AI

### 17. Would you trust an AI agent to run `terraform apply`?
**Answer:** Not directly, and not with write credentials. Gruntwork's analysis of the DataTalks.Club incident puts the blame on the operating model: local state, broad credentials, no review step and no deletion protection. Their point is that "if an AI agent can run apply or destroy directly, then every weakness in the workflow becomes more dangerous." The safe pattern is for the AI to propose a code change, CI to produce a plan, a human to review it, and a pipeline to apply it after merge. In short, "AI can still participate… it just doesn't control execution."
**Go deeper:** Concrete guardrails: read-only, short-lived credentials for plan and separate ones for apply; `prevent_destroy` on stateful resources; cloud-side deletion protection and independent backups. HashiCorp's own Terraform MCP server keeps "tools that require explicit approval" off by default (`ENABLE_TF_OPERATIONS=false`).
**Sources:** https://www.gruntwork.io/blog/thinking-of-using-ai-with-terraform ; https://incidentdatabase.ai/cite/1424 ; https://github.com/hashicorp/terraform-mcp-server

### 18. Doesn't `prevent_destroy` stop exactly that kind of accident?
**Answer:** Only partly. Terraform rejects any plan that would destroy a protected resource, but the docs say this "doesn't prevent Terraform from destroying a resource if you remove its configuration". An agent, or a person, that deletes the block, or swaps in an old state as happened at DataTalks.Club, gets around it. That's why deletion protection on the cloud side, plus backups that don't live with the resource, matter more.
**Go deeper:** The lifecycle rule isn't even stored in state. Gruntwork notes that the RDS delete request in the incident also removed the automated backups.
**Sources:** https://developer.hashicorp.com/terraform/language/meta-arguments/lifecycle ; https://www.gruntwork.io/blog/thinking-of-using-ai-with-terraform

### 19. Is AI-generated Terraform any good?
**Answer:** It's usually *valid*, which isn't the same as *safe*. In the study in our research notes (SBSeg 2026), code from one model passed validation 77.8% of the time and had 0% compliance under the Checkov security scanner. The GenSIaC paper likewise found LLMs often miss security issues. So AI speeds up writing code, but review, scanning and plan review matter more than before, not less.
**Go deeper:** Both results are research papers on specific models, so they shouldn't be read as "all AI is insecure". The numbers come from research-notes and were not re-checked here **(!)**.
**Sources:** https://arxiv.org/abs/2511.12385 ; SBSeg 2026 paper as cited in research-notes.md

### 20. Is it safe to connect an AI assistant to our Terraform workspaces through MCP?
**Answer:** With care. HashiCorp says the server "enforces your existing Terraform authentication and authorization" and keeps credentials out of the AI's hands. Its own README also warns not to use it "with untrusted MCP clients or LLMs" because it "may expose certain Terraform data" to the model. Since state can contain secrets (Q5), connecting an assistant to workspaces can mean sending those secrets to a model provider.
**Go deeper:** The server went GA for HCP Terraform and Enterprise on 2026-06-11. Its headline use is explaining plans in natural language, which fits the "AI reads, humans approve" model.
**Sources:** https://www.hashicorp.com/blog/terraform-mcp-server-is-now-generally-available ; https://github.com/hashicorp/terraform-mcp-server

---

## (!) items to double-check before the talk
- Q8: Terragrunt's purpose is not verified.
- Q10: the vendor names (Spacelift, env0, Scalr) behind OpenTofu are not verified here.
- Q11: whether a HashiCorp student/academic offer exists (none found).
- Q12: the ~October 2027 MPL conversion date for 1.6.0 is our own calculation.
- Q15: how to migrate back from OpenTofu to Terraform is not documented.
- Q19: the SBSeg 2026 / GenSIaC figures were taken from research-notes, not re-checked.
- Not used: AWS CloudFormation docs were unreachable during research, so no CloudFormation-specific claims are made beyond its 2011 launch date.
