# Turning point 3: Terraform arrives (the live demo)

Research checked 2026-11-04. Key: [P] = primary source, [S] = secondary source, **(!)** = uncertain or contested; check before it goes on a slide.

## Key points for the talk

- **Terraform's bet was one declarative workflow for every cloud.** Its author had wanted "an open source, cloud-agnostic solution" since CloudFormation (AWS-only) launched in 2011. v0.1 (July 2014) supported only AWS and DigitalOcean, specifically to prove that multiple **providers** could work [P].
- **The plan/apply split is the core idea.** `plan` refreshes what exists, compares it with the code and **state**, and prints exactly what it would create (`+`), change (`~`), destroy (`-`) or replace (`-/+`). It can be saved with `-out` and applied unchanged, which makes it a reviewable artifact rather than a "dry run" [P].
- **Drift detection is a side effect of refresh.** Because every `plan` re-reads reality first, a container deleted by hand drops out of state and the plan proposes to create it again. In the Docker provider this behaviour is one line of code: `d.SetId("")` when the container is gone [P].
- **The demo is verified against current versions.** `kreuzwerker/docker` v4.6.0 (2026-09-01) installed from the Terraform Registry with Terraform v1.17.1 on 2026-11-04 [P, tested]. Watch out: changing the port or page content does **not** update in place. It shows `-/+` "forces replacement" [P].
- **Adoption was slow, then explosive.** Downloads were "mostly stagnant for the first 18 months" and the team "talked … about maybe shutting down the project". In 2017 "downloads continued to double every single month" [P].

---

## Part 1: What problem Terraform solved (2014)

- **Origin.** Mitchell Hashimoto describes wanting, after CloudFormation's 2011 launch, a tool that could "provide the same workflows" across clouds. He blogged the idea, nobody built it, and HashiCorp built it themselves when "the challenges predicted became very real" [P, HashiCorp "Story of Terraform"].
- **v0.1.0, 2014-07-28**, supported only AWS and DigitalOcean. The goal was to show that multiple **providers** could share one workflow [P, notes; 1.0 keynote].
- **The three ideas, in the talk's vocabulary:**
  1. *Multi-cloud through providers.* The core engine is generic, and each platform is a plugin. Moving the workflow to another platform means switching **providers**, not tools.
  2. *Declarative.* You describe the end state; Terraform computes the steps. This is the contrast with PortoBikes' turning-point-2 scripts, which are **imperative**.
  3. *Plan, then apply.* The preview is a separate, inspectable step. CloudFormation at the time had no equivalent preview step **(!)** (not verified; CloudFormation Change Sets came later, so check before claiming it on a slide).
- **Slow start.** Downloads were flat for about 18 months. The team bet on making providers easy to write, then 2017 became the "year of Terraform" [P].

## Part 2: The core model

| Concept | What it is | Demo moment |
|---|---|---|
| **HCL** | HashiCorp's configuration language, inspired by libucl/nginx config [P, notes] | `main.tf` on screen |
| **Provider** | A plugin that maps resource types to a platform's API. It is installed by `terraform init` from a registry address (`kreuzwerker/docker`) [P] | `init` output |
| **Resource** | One managed object (`docker_image`, `docker_container`) | the two blocks |
| **State** | Terraform's record mapping resources in code to real object IDs (`terraform.tfstate` locally) | `terraform show` / `state list` |
| **Dependency graph** | Built from references. `image = docker_image.nginx.image_id` forces image-before-container on create and the reverse on destroy | ordering in apply output |
| **Plan** | Refresh, then diff (config vs refreshed state), then a proposed action list | the key screen |
| **Apply** | Executes a plan. Without a saved plan file it re-plans and asks for `yes` | `apply` |

**What `plan` does, per the docs** [P, `terraform plan` docs]:
- By default it "reads the current state of any already-existing remote objects" (the **refresh**), then compares the configuration with that state and proposes actions.
- Symbols: `+` create, `~` update in place, `-` destroy, `-/+` replace.
- `-refresh=false` skips refresh and therefore "causes Terraform to ignore external changes" (no drift detection).
- `-refresh-only` builds a plan that only updates state to match reality, with no infrastructure changes. Use it to *accept* drift instead of reverting it.
- **New in 1.17.0 (2026-10-21):** `-minimal-refresh` refreshes only resources that have proposed changes [P, changelog]. Do **not** use it in the demo: it would likely hide the drift **(!)** (inference from the description, not tested).
- `-detailed-exitcode` returns 0 for no changes, 1 for an error, 2 for changes present. This is what CI pipelines and drift-checking cron jobs build on.

**Why `plan` matters as a reviewable artifact.**
- `terraform plan -out=tfplan` writes a file that `terraform apply tfplan` executes exactly, with no re-planning. What was reviewed is what runs.
- The docs warn to "treat any saved plan files as potentially-sensitive artifacts", because the file contains full configuration values [P].
- `terraform show -json` renders a plan for machines. Since 1.8 it includes explicit `"applyable"` and `"complete"` flags [P, 1.8 changelog]. Policy engines (Sentinel, OPA, and since 1.17 the native Terraform Policy) read exactly this. See `04-team-grows.md`.
- HashiCorp's own drift tutorial shows the refresh producing the heading "Note: Objects have changed outside of Terraform" [P].

## Part 3: From 0.x to 1.x (all dates from HashiCorp blog or `CHANGELOG.md`)

| Version | Date | What changed | Why it matters for the story |
|---|---|---|---|
| 0.1.0 | 2014-07-28 | First release: AWS + DigitalOcean | multi-cloud bet |
| 0.12 | 2019-05-22 | New language: first-class expressions (no `"${…}"` everywhere), rich types, `for` expressions, dynamic blocks, structural plan rendering, better errors [P] | HCL becomes a real language. The blog post doesn't use the label "HCL2"; that name comes from HCL library v2 **(!)** |
| 0.13 | 2020-08-10 | `required_providers` with source addresses (`namespace/name`). `init` auto-installs partner/community providers from the Registry. `count`/`for_each`/`depends_on` on modules [P] | why `source = "kreuzwerker/docker"` works in the demo |
| 0.15 | 2021 | experimental testing feature, later replaced by `terraform test` [P, 1.6 blog] | |
| 1.0 | 2021-06-08 | GA. 100M downloads and 5,000+ add-ons at launch [P, notes] | maturity signal |
| 1.5 | 2023-06-12 | `import` blocks: "Import is now a plannable operation, not a state operation". `plan -generate-config-out=…` writes HCL for imported resources. `check` blocks: assertions run at the end of plan/apply and warn without halting [P] | ClickOps leftovers can be adopted *through a reviewed plan* |
| 1.5.7 | 2023 | last MPL 2.0 release [P, notes] | BSL boundary (turning point 5) |
| 1.6 | 2023-10-04 | `terraform test`: `.tftest.hcl` files, `run` blocks, assertions, automatic teardown. First BUSL release [P] | |
| 1.7 | 2024-01-17 | Mocks in `terraform test`; `removed` block [P] | |
| 1.8 | 2024-04-10 | Provider-defined functions [P] | |
| 1.9 | 2024-06-26 | Variable validation can reference other objects; `templatestring` [P] | |
| 1.10 | 2024-11-27 | Ephemeral resources and values, which are never persisted to plan or state [P] | secrets out of state |
| 1.11 | 2025-02-27 | Write-only attributes; **S3 native state locking GA** (`use_lockfile`), DynamoDB arguments deprecated [P] | see TP4 |
| 1.12 | 2025-05-14 | Parallel test runs; import by resource identity [P] | |
| 1.13 | 2025-08-20 | `terraform stacks` CLI command [P] | |
| 1.14 | 2025-11-19 | `terraform query` + list resources (`*.tfquery.hcl`) to discover existing infrastructure and generate import config; **Actions** blocks for provider-defined non-CRUD operations [P] | |
| 1.15 | 2026-04-29 | Variables/locals in module `source`/`version`; `deprecated` on variables/outputs; `validate` checks the backend block [P] | |
| 1.16 | 2026-08-26 | `import` blocks inside modules; `terraform_data` `store` block [P] | |
| 1.17 | 2026-10-21 (1.17.1 on 10-28) | **Terraform Policy GA** (`-policies` flag on plan/apply/query); `-minimal-refresh`; variables in provider requirements [P] | the plan is now policy-checked by the CLI itself |
| 1.18 | unreleased | experimental deferred actions (`-allow-deferral`), `test cleanup` [P, main changelog] | |

The trend for the talk: after 1.0, the features increasingly work *through the plan*. Import, checks, query and policy all became plannable or plan-inspecting operations.

## Part 4: Facts the demo depends on

**Provider: `kreuzwerker/docker`.**
- Latest is **v4.6.0, published 2026-09-01** [P, Registry API]. The repo README recommends pinning `version = "4.6.0"`.
- Maintainer: the Registry lists the owner as GitHub user **Junkern**. The v3.9.0 release notes call him the "only maintainer", and say he is not an org admin of the kreuzwerker GitHub org [P]. It is a single-maintainer community provider, not HashiCorp-maintained. That is a nice aside about ecosystem fragility.
- **(!) Install warning in old release notes.** v3.9.0's notes say that from v3.7.0 a new GPG key broke standard Registry installation, and advise `source = "registry.opentofu.org/kreuzwerker/docker"`.
  - **Tested 2026-11-04:** Terraform v1.17.1 (darwin_arm64) ran `terraform init` with `source = "kreuzwerker/docker"`, `version = "4.6.0"`. Result: "Installed kreuzwerker/docker v4.6.0 (self-signed, key ID 0DCE698927DAF8EC)". `terraform validate` passed.
  - So the problem appears fixed for 4.6.0, but **run `init` on the demo laptop beforehand and commit `.terraform.lock.hcl`**.
- Working minimal config (validated). `image_id` is the image attribute to reference:
  ```hcl
  terraform {
    required_providers {
      docker = { source = "kreuzwerker/docker", version = "4.6.0" }
    }
  }
  provider "docker" {}
  resource "docker_image" "nginx" { name = "nginx:alpine" }
  resource "docker_container" "web" {
    name  = "portobikes-web"
    image = docker_image.nginx.image_id
    ports {
      internal = 80
      external = 8080
    }
  }
  ```
  The PortoBikes page can be injected with an `upload { content = "…", file = "/usr/share/nginx/html/index.html" }` block (`content` and `file` exist in the v4.6.0 schema) [P, source].

**What "change one line" will show (from the v4.6.0 schema)** [P]:
- `name`, `image`, `ports`, `env`, `labels` and `upload` on `docker_container` are all `ForceNew`. Changing the page text or the port gives `-/+ … must be replaced` with `# forces replacement`: the container is destroyed and recreated.
- That is fine, and even a good teaching point ("the plan warns you about downtime").
- If the team wants a `~` in-place update instead, change `restart` (e.g. `"no"` → `"unless-stopped"`), which is not `ForceNew` **(!)** (read from the schema, not run).

**Drift scenario, step by step:**
1. `terraform init` installs the provider and writes the lock file.
2. `terraform apply` shows the plan (`2 to add`) and asks for `yes`. It pulls the image, then creates the container, in graph order.
3. Edit one line, then `terraform plan` shows `1 to add, 0 to change, 1 to destroy` for a replacement **(!)** (expected counts; rehearse). Then `terraform apply`.
4. Run `docker rm -f portobikes-web` by hand. This is ClickOps-style drift.
5. `terraform plan`. During refresh, the provider's `resourceDockerContainerRead` lists all containers. If the ID is not found, it runs `d.SetId("")`, with the comment "This container doesn't exist anymore" [P, source]. Terraform then drops the object from state and should report "Objects have changed outside of Terraform … has been deleted", then plan `+ create` **(!)** (exact wording from Terraform core not verified; rehearse).
6. `terraform apply` recreates the container. The image still exists, so only one resource is added.
7. `terraform destroy` removes the container, then the image: `docker_image` deletes the local image on destroy unless `keep_locally = true` [P]. Set `keep_locally = true` to avoid re-pulling between rehearsals.

**Bonus variant.** If someone runs `docker stop` instead of `rm`, the provider sets `must_run` to false in state "to trigger update". The plan then shows an in-place `~` change that restarts the container [P, source]. Both kinds of drift are visible.

**Demo risks:**
- The image pull and provider download need network. Pre-pull `nginx:alpine` and run `init` beforehand.
- Port 8080 must be free.
- Never use `-refresh=false` or `-minimal-refresh` during the drift step.

## Part 5: Real anchors (adoption case studies)

All of these are customer stories on HashiCorp's own site, so the outcomes are self-reported and unaudited.
- **Atruvia** (IT provider to 900+ German cooperative and private banks): cluster provisioning "3 months → 4 hours", network configuration "weeks → 15 minutes". Uses Terraform modules with GitLab pipelines and Vault [P-vendor].
- **Helvetia Insurance** (Swiss, founded 1858): "migrated approximately 200 applications to the cloud within one year". Cloud account provisioning went "from days to minutes" through Terraform-built landing zones [P-vendor].
- **Cielo / TMX Group / Skechers** are already in `research-notes.md`.
  - Cielo: a search summary gives "1 month to under 15 minutes", while the notes say "down 90%" **(!)**. Re-read the page before quoting.
  - Skechers: the English and German pages differ ("days or weeks to hours" vs "one week to two hours") **(!)**.
- The best story to pair with PortoBikes is Hashimoto's own: a near-abandoned project that doubled downloads monthly in 2017 [P].

## Sources

- Story of Terraform (Hashimoto): https://www.hashicorp.com/resources/the-story-of-hashicorp-terraform-with-mitchell-hashimoto
- Terraform 1.0 launch keynote: https://www.hashicorp.com/resources/terraform-1-0-launch-keynote
- `terraform plan` docs: https://developer.hashicorp.com/terraform/cli/commands/plan
- Drift tutorial: https://developer.hashicorp.com/terraform/tutorials/state/resource-drift
- 0.12 announcement: https://www.hashicorp.com/blog/announcing-terraform-0-12
- 0.13 announcement: https://www.hashicorp.com/blog/announcing-hashicorp-terraform-0-13
- 1.0 GA: https://www.hashicorp.com/blog/announcing-hashicorp-terraform-1-0-general-availability
- 1.5 import/check: https://www.hashicorp.com/blog/terraform-1-5-brings-config-driven-import-and-checks
- 1.6 test framework: https://www.hashicorp.com/blog/terraform-1-6-adds-a-test-framework-for-enhanced-code-validation
- Changelogs (one per minor version): https://github.com/hashicorp/terraform/blob/v1.17/CHANGELOG.md (replace `v1.17` with `v1.7` … `v1.16`); unreleased: https://github.com/hashicorp/terraform/blob/main/CHANGELOG.md
- HCL: https://github.com/hashicorp/hcl
- Docker provider Registry API: https://registry.terraform.io/v2/providers/kreuzwerker/docker?include=provider-versions
- Docker provider repo and releases: https://github.com/kreuzwerker/terraform-provider-docker ; https://github.com/kreuzwerker/terraform-provider-docker/releases/tag/v3.9.0
- Provider source (v4.6.0): https://github.com/kreuzwerker/terraform-provider-docker/blob/v4.6.0/internal/provider/resource_docker_container_funcs.go ; `resource_docker_container.go` ; `resource_docker_image.go` (same folder)
- Provider signing: https://developer.hashicorp.com/terraform/cli/plugins/signing
- Case studies: https://www.hashicorp.com/en/case-studies/atruvia ; https://www.hashicorp.com/en/case-studies/helvetia ; https://www.hashicorp.com/en/case-studies/cielo ; https://www.hashicorp.com/en/case-studies/skechers ; https://www.hashicorp.com/en/case-studies/tmx-group
