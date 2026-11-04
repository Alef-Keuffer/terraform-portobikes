# Turning point 4: the team grows (2019–2022)

Research checked 2026-11-04. Key: [P] = primary source, [S] = secondary source, **(!)** = uncertain or contested; check before it goes on a slide.

## Key points for the talk

- **Two people running `apply` at once is a state problem, and locking solves it.** Terraform locks **state** automatically on any write, "to prevent others from acquiring the lock and potentially corrupting your state" [P]. On AWS, the classic setup was S3 for state plus DynamoDB for the lock. Since Terraform 1.11 (2025-02-27), S3 can lock natively (`use_lockfile`), and the DynamoDB arguments are deprecated and "will be removed in a future minor version" [P].
- **The pull request becomes the change process.** `plan` runs in CI and is posted to the PR; a colleague reviews the *plan*, not just the code; apply happens after approval. Atlantis, GitHub Actions and HCP Terraform VCS-driven runs all implement the same loop [P]. This is the talk's thread: reviewable code became reviewable change.
- **Once a plan is reviewable by humans, it is checkable by machines.** Policy as code (Sentinel, OPA and, since Terraform 1.17, native Terraform Policy) evaluates every plan before apply [P].
- **Teams pay for the team features, not the CLI.** Remote runs, concurrency, policy, drift detection, audit logging, SSO and the private registry are what separate the HCP Terraform tiers [P]. HashiCorp's last reported quarter had 4,856 customers, 946 of them paying ≥$100k ARR. These figures are for all HashiCorp products, not Terraform alone [P].
- **Certifications mirror this turning point.** The Associate exam tests state locking, remote backends and HCP Terraform collaboration. The new Professional exam (002, Terraform 1.15) adds CI/CD, policy as code and even "Use the Terraform MCP server with AI coding agents" [P].

---

## Part 1: Remote state and locking

**The failure mode.** PortoBikes now has ten engineers. With local `terraform.tfstate`, each laptop has its own copy of the truth. If two people apply at once, both read the same old state, both write, and one write is lost. The infrastructure then exists but is no longer tracked, or gets tracked twice.

**How Terraform handles it** [P, state locking docs]:
- Locking runs automatically "on all operations that could write state". It is silent, and if the lock can't be acquired, Terraform stops.
- `-lock=false` exists but is discouraged. Not every backend supports locking.
- `terraform force-unlock LOCK_ID` releases a stuck lock. The docs say "Be very careful with this command", to be used only for *your own* lock when automatic unlocking failed.

**S3 backend, then and now** [P, S3 backend docs; 1.11 changelog]:
- Before 1.11: `bucket` + `key` for state, plus `dynamodb_table` for the lock. The table needs a partition key `LockID` (String).
- 1.11.0 (2025-02-27): "S3 native state locking is now generally available. The `use_lockfile` argument enables users to adopt the S3-native mechanism … we've deprecated the DynamoDB-related arguments." The lock is an object named `<key>.tflock` next to the state.
- Both can be configured simultaneously to migrate. `use_lockfile` still defaults to `false`, so locking on S3 is opt-in. **Slide-worthy: forgetting it means no locking.**
- **(!)** The removal version for the DynamoDB arguments is not announced.

**HCP Terraform** stores state remotely, locks it, and keeps version history. "Remote state storage" is listed on every tier, including the entry tiers [P, pricing].

**Real anchor idea:** Atlantis was built precisely for this coordination problem. It locks a directory and workspace "until the pull request is merged or closed", so two PRs can't plan the same infrastructure at once [P].

## Part 2: The pull-request workflow

**The loop:** branch → edit HCL → open PR → CI runs `terraform plan` → plan posted to PR → reviewer approves → `apply` → merge (or merge → apply).

**Three implementations:**
- **Atlantis** (self-hosted, open source; "In production since 2017"; an LF Projects entity per its site footer [P]):
  - Comment `atlantis plan` and it "Runs `terraform plan` on the pull request's branch".
  - Comment `atlantis apply` and it applies "all unapplied plans from this pull request", using the *saved* plan file, so `-var` and `-target` are ignored at apply.
  - `apply_requirements: [approved]` blocks apply "unless the pull request is approved by at least one person other than the author". `[mergeable]` requires the PR to be mergeable.
  - Atlantis applies *before* merge, which is why it needs locking [P].
  - **(!)** Atlantis is sometimes described as a CNCF project. Its site says only "a Series of LF Projects, LLC"; check CNCF status before claiming it.
- **GitHub Actions + HCP Terraform** (HashiCorp tutorial) [P]:
  - On `pull_request`, upload a *speculative* configuration (a run that "cannot modify infrastructure"), run a plan, and comment the add/change/destroy counts with a link.
  - On push to `main` (i.e. merge), create a run and apply it if HCP Terraform reports it confirmable.
  - It uses the `hashicorp/tfc-workflows-github` actions.
  - Teams without HCP Terraform typically use `hashicorp/setup-terraform` and run the CLI in the runner with a remote backend **(!)** (not covered by the fetched tutorial).
- **HCP Terraform VCS-driven runs** [P]:
  - "HCP Terraform also performs a speculative plan when a pull request is opened against that branch". It posts a link and re-plans when the PR updates. There are no speculative plans for PRs from forks.
  - Merging to the linked branch queues a run. By default, "run plans require confirmation before HCP Terraform will apply them", unless auto-apply is enabled.
  - Gotcha for Q&A: the PR status check reflects the *plan* only. An apply that later fails does not update it.

**Why the plan is the review artifact.** Reviewing a 3-line HCL diff can hide a destructive change, such as a `ForceNew` attribute that replaces a database. The plan shows the actual consequence (`-/+ must be replaced`). This links back to the demo in turning point 3.

## Part 3: Modules, Registry, policy as code

**Modules** are reusable packages of configuration.
- Public Registry modules live in GitHub repos named `terraform-<PROVIDER>-<NAME>`, follow the standard module structure, and are versioned by semantic-version tags ("v1.0.4"). A new tag is published within about a minute via webhook [P].
- Since 0.13, modules accept `count`, `for_each` and `depends_on` [P].
- HCP Terraform adds a **private registry** on every tier. Test-integrated module publishing is capped at 10 modules on Essentials and unlimited from Standard [P, pricing].
- Registry size ("3,000+ providers / 12,000+ modules") remains unverified **(!)** (see notes).

**Policy as code** [P, HCP policy enforcement docs]:
- Three frameworks: **Sentinel** (HashiCorp's own language), **OPA** (Rego) and **Terraform Policy** (native HCL).
- Terraform Policy is the only one that also covers Stacks, and it needs Terraform ≥ 1.17.
- "HCP Terraform checks the Terraform plan against the policy set during each run". Failed policies can stop the run, and people with the right permission can override.
- Terraform 1.17.0 (2026-10-21): "Terraform Policy is now generally available. The `-policies` flag for `plan`, `apply`, and `query` no longer requires an experimental build" [P, changelog]. Policy checks are no longer exclusive to the paid platform.
- **(!)** HCP docs are inconsistent on tiers. The comparison table shows policy enforcement on Standard/Premium, while the Free section allows "one policy set of up to five policies".

## Part 4: How HashiCorp makes money, and why teams pay

**Open core** (notes): the Terraform CLI is free (BSL since 1.6). HCP Terraform (SaaS) and Terraform Enterprise (self-hosted, now branded "IBM Terraform Enterprise", custom pricing) are paid.

**HCP Terraform tiers** (per managed resource per month: Essentials $0.10, Standard $0.47, Premium $0.99) [P, pricing].

**What a ten-person team actually buys** [P, HCP overview, pricing, health docs]:

| Need at PortoBikes | Feature | Tier |
|---|---|---|
| Shared, locked state | Remote state storage | all |
| Applies not from laptops; credentials not on laptops | Remote runs (plan & apply), secure variable storage | all |
| Several applies at once | Concurrency: Free 1 remote/1 agent; Essentials 3/1; Standard 10/10; Premium 200/300 | grows with tier |
| Know when someone ClickOps'd prod | Health assessments (drift detection + continuous validation) | **Standard, Premium only** |
| Guardrails | Policy enforcement | Standard/Premium (**(!)** see above) |
| Login with company accounts | SSO (SAML) | all |
| Auditors | Audit logging, custom RBAC | **Premium only** |
| Platform team serving developers | No-code provisioning, change requests, module deprecation | Standard+ |

- **The argument for the talk:** the CLI solves "one person, one laptop". People pay for *coordination and governance*: who may apply, what may be applied, what drifted, who did it. Those needs grow with headcount, which is exactly this turning point.
- The legacy free plan ended 2026-03-31. The new free tier is capped at 500 resources, with unlimited users [P, notes].

**Numbers** (all HashiCorp products, not Terraform alone) [P, SEC EX-99.1, Q3 FY2025, quarter ended 2024-10-31]:
- Revenue $173.4M, up 19% YoY
- 4,856 customers
- 946 customers with ≥ $100k ARR (up 8% YoY)
- Trailing net dollar retention 109%, down from 119% a year earlier
- No earnings call, because of the pending IBM deal
- FY2024 revenue: $583.1M (notes)

The 109% retention means existing customers spent ~9% more year on year. That is the "pay as you grow" mechanism, though slowing.

## Part 5: Why job ads ask for Terraform

Use only the evidence in `research-notes.md`:
- **Stack Overflow 2025:** 17.8% of all respondents and 18.7% of professional developers used Terraform. This measures *usage*.
- **IT Jobs Watch UK:** 2,390 permanent ads in the 6 months to Nov 2026, up 49% YoY, with a median of £75k. But the share of all IT ads fell from 3.19% to 1.96% **(!)**. Present both numbers honestly.
- **Firefly 2025** (vendor survey) **(!)**.
- **Do not use** "88% of DevOps ads".

The defensible explanation ties back to this turning point. Job ads ask for the *team workflow*: remote state, modules, CI/CD, policy. That is the same content HashiCorp's own Professional exam objectives list (below). This is an inference, not a measured fact.

## Part 6: Certifications (official pages, 2026-11-04)

| | Associate (004) | Infrastructure Engineer Professional (002) | Authoring & Operations Advanced |
|---|---|---|---|
| Level | foundational | intermediate, "mid-career" | advanced, lab-based |
| Version tested | Terraform 1.12 | Terraform 1.15 | Terraform 1.6 **(!)** (old version) |
| Format / time | MC, 1 h | MC, 90 min | labs + MC, 4 h (AWS or Azure) |
| Price | $70.50, no free retake | $200, no free retake | $295, free retake |
| Prerequisite | terminal + cloud basics | Associate "strongly recommended" + production experience | Associate recommended + production experience |

**What they test** [P]:
- **Associate** has 8 domains:
  - IaC concepts (incl. "multi-cloud, hybrid cloud, and service-agnostic workflows")
  - providers and state
  - core workflow (init/validate/plan/apply/destroy/fmt)
  - configuration (resources vs data, references, variables, complex types, custom conditions, secrets with Vault)
  - modules (sourcing, scope, versions)
  - state (local backend, **locking**, remote backends, **drift**)
  - maintenance (import, inspect state, logging)
  - HCP Terraform (workspaces, projects, governance)
  - Nearly every term in our glossary is an exam objective.
- **Professional (002)** has 7 domains:
  - scalable configuration design (incl. "Use the Terraform MCP server with AI coding agents")
  - state/backend operations and drift remediation
  - lifecycle (import, multi-environment)
  - **CI/CD and automation** (dynamic provider credentials)
  - **security and governance** (secrets rotation, policy rules, "Identify and mitigate risky infrastructure changes")
  - modules and Registry (incl. unit tests)
  - HCP Terraform/Enterprise operations (cost tracking, "Define Policy as Code in a CI/CD pipeline")
- **Advanced** has 6 objectives: resource lifecycle and drift; dynamic configuration; collaborative workflows; modules; providers; HCP Terraform collaboration.
  - Passing the Advanced exam also extends an unexpired Professional credential (recertification path).
  - **(!)** The notes call Advanced "formerly Professional". The current pages do not state a rename, and they treat Professional (002) as a separate, newer exam. Reword before putting it on a slide.

## Part 7: Where IaC sits in a DevOps pipeline

- **DORA** (Google's research programme), "Version control" capability:
  - Teams should version "All environment creation tools and artifacts", e.g. "Terraform files", and "All cloud configuration files".
  - "Research consistently shows that comprehensive use of version control predicts continuous delivery" [P].
  - The page does not use the phrase "infrastructure as code"; it covers the practice by example.
- **CALMS** (Culture, Automation, Lean, Measurement, Sharing): IaC is the "Automation" pillar, and the PR workflow is "Sharing".
  - **(!)** Attribution (commonly Jez Humble, extending Willis/Edwards' CAMS) and the Atlassian page text could not be verified; the page did not render.
- **In the pipeline:** IaC sits *before* application deploy. Environments are created from the same reviewed repo. The PR/plan/policy/apply loop is the infrastructure equivalent of build, test and deploy.

## Sources

- State locking: https://developer.hashicorp.com/terraform/language/state/locking
- S3 backend: https://developer.hashicorp.com/terraform/language/backend/s3
- Terraform 1.11 changelog (S3 native locking): https://github.com/hashicorp/terraform/blob/v1.11/CHANGELOG.md
- Terraform 1.17 changelog (Terraform Policy GA): https://github.com/hashicorp/terraform/blob/v1.17/CHANGELOG.md
- Atlantis: https://www.runatlantis.io/ ; https://www.runatlantis.io/docs/using-atlantis ; https://www.runatlantis.io/docs/command-requirements ; https://www.runatlantis.io/docs/locking
- GitHub Actions + HCP Terraform tutorial: https://developer.hashicorp.com/terraform/tutorials/automation/github-actions
- HCP Terraform VCS-driven runs: https://developer.hashicorp.com/terraform/cloud-docs/run/ui
- HCP Terraform policy enforcement: https://developer.hashicorp.com/terraform/cloud-docs/policy-enforcement
- HCP Terraform plans/features: https://developer.hashicorp.com/terraform/cloud-docs/overview
- Health assessments: https://developer.hashicorp.com/terraform/cloud-docs/workspaces/health
- Pricing: https://www.hashicorp.com/en/pricing
- Module publishing: https://developer.hashicorp.com/terraform/registry/modules/publish
- 0.13 (module count/for_each): https://www.hashicorp.com/blog/announcing-hashicorp-terraform-0-13
- HashiCorp Q3 FY2025 results (SEC): https://www.sec.gov/Archives/edgar/data/0001720671/000172067124000022/hcp-q3fy25xex991.htm
- Certifications: https://developer.hashicorp.com/certifications/infrastructure-automation ; https://developer.hashicorp.com/certifications/terraform-associate ; https://developer.hashicorp.com/certifications/terraform-infrastructure-engineer-professional ; https://developer.hashicorp.com/certifications/terraform-advanced
- DORA version control: https://dora.dev/capabilities/version-control/
- CALMS (could not be read; unverified): https://www.atlassian.com/devops/frameworks/calms-framework
- Job-market figures: see `research-notes.md` (Stack Overflow 2025, IT Jobs Watch, Firefly)
