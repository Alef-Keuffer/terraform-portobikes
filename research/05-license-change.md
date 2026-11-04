# Turning point 5 (2023–2025): the licence change, the fork, and the debate

Research checked 2026-11-04. Key: [P] = primary source, [S] = secondary source, **(!)** = uncertain or contested; check it again before it goes on a slide. Facts already in `research-notes.md` are not re-verified here, only built on.

## Key points for the talk

- **The BSL change does not stop PortoBikes using the Terraform CLI.** The licence allows production use. What it forbids is offering Terraform "to third parties on a hosted or embedded basis" to compete with the vendor's paid versions. The people it hit were HashiCorp's commercial competitors (Spacelift, env0, Scalr…), and those same companies founded OpenTofu. [P]
- **Our main argument applies here too.** Terraform is valuable because infrastructure became shared, reviewable code. Once something is a shared standard, who controls its licence matters as much as its features. That is why a licence change caused a fork within about six weeks.
- **OpenTofu is now a real, separate project, not just a copy.** It sits in the CNCF Sandbox (since April 2025) and has features Terraform lacks (state encryption, provider `for_each`, `-exclude`, OCI registries). Terraform has features OpenTofu lacks (Stacks, actions, `terraform query`). The two are no longer guaranteed to be drop-in replacements for each other. [P]
- **This has happened before.** MongoDB (2018), Elastic (2021) and Redis (2024) all moved to source-available licences to stop cloud providers profiting from their code. Elastic (2024) and Redis (2025) later **added an OSI-approved licence back (AGPL)**. HashiCorp, now part of IBM, has not done this. [P]
- **Real anchors:** Fidelity moved ~50k state files to OpenTofu ("OpenTofu really is a drop-in"). GitLab deprecated its Terraform CI/CD templates and now offers OpenTofu components instead. [P]

---

## 1. The BSL change in detail

**What happened.** On 2023-08-10, HashiCorp announced that future releases of its products would move from MPL 2.0 to the Business Source License v1.1. It said "APIs, SDKs, and almost all other libraries will remain MPL 2.0" [P: HashiCorp blog]. Terraform 1.5.7 was the last MPL release, and 1.6.0 (published 2023-10-04) was the first under BUSL [P: GitHub releases; see research-notes]. Providers are maintained in separate repositories and were not relicensed. For example, `hashicorp/terraform-provider-aws` is still MPL-2.0 (GitHub API, checked 2026-11-04) [P].

**What the licence text actually says.** Quoted from the current `LICENSE` file in the Terraform repository [P]:
- *Additional Use Grant:* "You may make production use of the Licensed Work, provided Your use does not include offering the Licensed Work to third parties on a hosted or embedded basis in order to compete with **IBM Corp.'s** paid version(s) of the Licensed Work." Since the acquisition, the licensor named in the text is IBM, not HashiCorp. That makes a nice detail for a slide.
- *Competitive offering:* a product "offered to third parties on a paid basis, including through paid support arrangements, that significantly overlaps with the capabilities of" the paid versions.
- *Embedded:* including the code in a competitive offering, or packaging the offering so that Terraform must be downloaded for it to work.
- *Change Date / Change License:* four years after each version is published, that version becomes MPL 2.0. **Our inference:** Terraform 1.6.0 should therefore become MPL 2.0 around October 2027.

**What it does *not* forbid:** internal production use, including in commercial companies; writing and sharing modules; building providers; and partners building integrations. HashiCorp said customers of its paid products would see no change [P: HashiCorp blog]. **(!)** "Significantly overlaps" is not defined further, so whether a given tool counts as competitive is a grey area. HashiCorp's Licensing FAQ answers questions about consultants and internal hosting (Q26–Q28), but we could not extract the answer text automatically. Read it in a browser before quoting it [P: https://www.hashicorp.com/en/license-faq].

**HashiCorp's stated reasons.** Armon Dadgar (co-founder and CTO) wrote that "commercial open source models need to evolve" and that some vendors use open-source projects for commercial gain without contributing back. He said the change was meant to ensure continued investment in the community [P: HashiCorp blog].

**The reaction.**
- Within days, a group of companies published the **OpenTF manifesto**. It asked HashiCorp to return Terraform to MPL (or another widely accepted open-source licence) and to promise it would stay open. HashiCorp did not respond by the 25 August deadline, so the fork went ahead [P: OpenTofu manifesto].
- HashiCorp also changed the **Terraform Registry terms** so that the registry may only be used with Terraform. This pushed the fork to build its own registry, released as an alpha in October 2023 [S: TechTarget, The New Stack]. **(!)** We have not checked the current wording of the terms.
- Pulumi published "Pulumi 💜's Open Source", saying it is Apache-2.0 and will not depend on BSL software [S: Pulumi blog index / forum].

## 2. The OpenTofu fork

**Backers.** Formal pledges came from 140+ organisations and 600+ individuals, plus "over 18 full-time developers over five years". Named supporters included Harness, Gruntwork, Spacelift, env0, Scalr, Digger, Terrateam, Massdriver and Terramate, and the insurer Allianz backed it as a user [S: The Register, 2023-09-20]. An archived pledge page lists Harness and Spacelift at 5 FTEs each for 5 years and Scalr at 3 **(!)** (archived copy, undated).

**Name and home.** The project was first called OpenTF. It was renamed OpenTofu to avoid trademark trouble; co-founder Sebastian Stadil said HashiCorp had been "super aggressive in sending cease and desist" letters [S: The Register]. The Linux Foundation announced it on 2023-09-20 at Open Source Summit Europe (Bilbao). The first stable release was 1.6.0, on 2024-01-10 (research-notes). The CNCF accepted it as a Sandbox project on 2025-04-23 [P: CNCF].

**Governance.** A Technical Steering Committee started with five seats, with founding representatives from env0, Gruntwork, Harness, Spacelift and Scalr [S: env0; The Register]. **(!)** We did not find an authoritative list of current TSC members. Check `TSC_SUMMARY.md` in the opentofu repository.

**The April 2024 cease-and-desist.** On 2024-04-03, HashiCorp sent OpenTofu a cease-and-desist letter. It claimed that one of OpenTofu's core developers had infringed copyright in implementing the `removed` block (a BSL-era Terraform feature). On 2024-04-11, OpenTofu published the letter, its reply and a Source Code Origin analysis. It said the code came from older **MPL-2.0** code, and that HashiCorp "seems to have copied the same code itself" [P: OpenTofu blog]. A Futurum Group analysis noted that the letter "does not provide detailed evidence" [S]. **(!)** No public resolution has been reported, and we found no public statement from HashiCorp's side. The letter arrived three weeks before the IBM deal was announced (2024-04-24). Online commentators linked the two, but that is speculation.

**Features OpenTofu has that Terraform does not (from OpenTofu's official "what's new" pages) [P]:**
- 1.7 (2024): **client-side state encryption** (AES-GCM, with keys from a passphrase/PBKDF2, AWS KMS, GCP KMS or OpenBao/Vault). This was the most-requested community feature, because Terraform state often contains secrets in plain text.
- 1.8: variables and locals allowed in backend and module source blocks ("early evaluation"); `.tofu` override files, so one module can support both tools.
- 1.9: `for_each` on provider blocks (multi-region without copy-paste); `-exclude` flag.
- 1.10: providers and modules from **OCI registries** (useful in air-gapped environments); experimental OpenTelemetry tracing; external key providers for encryption.
- 1.11–1.13: ephemeral values (Terraform has these too), `enabled` meta-argument, dynamic `prevent_destroy`; 1.13 (2026-09-29) adds experimental linting and "symbol libraries".

**Features Terraform has that OpenTofu does not:** HCP Terraform **Stacks** (GA at HashiConf 2025 [P: HashiCorp blog]); Terraform 1.14 (2025-11-19) **actions** blocks and **`terraform query`** with list resources [P: GitHub release notes]. **(!)** A third-party comparison says OpenTofu 1.10–1.13 has no equivalent of these, and also mentions "Terraform Policy" in 1.17. Neither claim is checked against primary sources.

**Compatibility drift.** OpenTofu says it "aims to maintain compatibility with Terraform configurations" and warns that setups using `terraform_remote_state` across projects need extra care [P: OpenTofu migration docs]. State format is still shared, but plan files cannot be swapped between the tools, and lock files are rewritten to `registry.opentofu.org` [S: community migration reports] **(!)**. In practice the switch is easy for code written for Terraform ≤1.9. It gets harder once a team uses features only one tool has. Migration has become a **one-way door** for teams using `.tofu` files, state encryption, Stacks or actions.

## 3. The IBM acquisition and what has changed since

The deal was announced 2024-04-24 ($6.4B, $35/share). It closed 2025-02-27, after UK CMA approval. HashiCorp runs as a division of IBM Software, not inside Red Hat [S: TechRepublic; press release syndications] (research-notes has the primary link). Changes since then:
- **The licence is still BSL.** There has been no move back to MPL. The licensor named in the `LICENSE` file is now "IBM Corp." [P].
- **Product cuts and changes** (research-notes): CDK for Terraform archived 2025-12-10; the legacy free plan ended 2026-03-31 (new free tier capped at 500 resources); HCP Consul Dedicated retired; Infragraph preview in May 2026.
- **New features keep shipping**: Stacks GA (2025), actions/query (1.14), the Terraform MCP server GA (2026-06-11), Terraform 1.17.1 (2026-10-28).
- **Competitors are using the moment.** Pulumi now runs HCL as a first-class language, manages Terraform/OpenTofu state in Pulumi Cloud, and lets customers apply credits bought from HashiCorp to Pulumi. Its CEO called the CDKTF archive an "overnight rug-pull" [P: Pulumi blog, 2025-12-18].

## 4. The wider relicensing pattern

| Company | Change | Fork | Later |
|---|---|---|---|
| MongoDB | AGPL → **SSPL**, 2018-10-16; pulled from OSI review in March 2019 [S] | none of note | Still SSPL |
| Elastic | Apache 2.0 → **SSPL/ELv2**, 2021, because of "issues with AWS" | AWS **OpenSearch** | **Added AGPL** on 2024-08-29: "Elasticsearch is open source again" [P] |
| Redis | BSD → **RSAL/SSPL**, March 2024 | **Valkey** (LF, 2024-03-28; AWS, Google, Oracle, Ericsson, Snap) [S] | **Added AGPLv3** with Redis 8, 2025-05-01; admits the change "hurt our relationship with the Redis community" [P] |
| HashiCorp | MPL → **BSL**, 2023-08-10 | **OpenTofu** (LF → CNCF) | Still BSL under IBM |

The pattern is the same each time. A single-vendor project relicenses to stop cloud or SaaS rivals from profiting. A foundation-hosted fork appears. The rivals keep their own fork going, as Redis CEO Rowan Trollope wrote: "AWS and Google now maintain their own fork". Some vendors later go back to an OSI licence. In 2021 the OSI also said SSPL is not open source [S]. Possible debate line: *Elastic and Redis came back; will IBM?*

## 5. Debate briefs

### Stay on Terraform
1. **The licence does not apply to us.** PortoBikes uses Terraform internally, and the BSL explicitly allows production use [P: LICENSE].
2. **It is the market standard.** In the Stack Overflow 2025 survey, 17.8% of respondents use Terraform (research-notes). In Firefly's survey, 62% use Terraform vs 12% OpenTofu **(!)** (vendor survey). Hiring, certifications and tutorials all assume Terraform.
3. **Features only Terraform has:** Stacks (GA), actions and `terraform query` (1.14), and the integrated HCP Terraform features (policy, Infragraph, MCP server) [P].
4. **A large vendor behind it:** IBM can offer enterprise support, and HashiCorp is still releasing every few weeks (1.17.1, October 2026).
5. **Switching has a cost, even when it's "trivial"**: CI images, procurement, tooling with Terraform hard-coded, and retraining [S: practitioner blogs].
- **Strongest counter-argument:** IBM can change the terms again, and the changes since the acquisition went against users: the BSL was kept, the free tier was capped, and CDKTF was archived. Each new Terraform-only feature makes leaving more expensive later.

### Move to OpenTofu
1. **Licence and governance:** MPL-2.0, with neutral governance under the Linux Foundation and CNCF. No single company can relicense it [P: CNCF; GitHub].
2. **Drop-in, shown at scale:** Fidelity moved 2,000+ apps, 50k+ state files and 4M+ resources. "Changing the CLI in a pipeline is trivial"; OpenTofu is now the default for new deployments [P].
3. **Features only OpenTofu has, for problems users actually report:** state encryption, provider `for_each`, `-exclude`, OCI registries [P].
4. **The ecosystem is moving with it:** GitLab deprecated its Terraform CI/CD templates (announced in 16.9, removed in 18.0) and offers OpenTofu components instead [P: GitLab issue 438010]. GitLab's docs give the licence change as the reason **(!)** (the issue page itself does not state it).
5. **Uses the same providers, so it builds on everything learned so far.**
- **Strongest counter-argument:** The main backers (Spacelift, env0, Harness, Scalr) sell products that compete with HCP Terraform, so their support is also a business decision. Critics argued at launch that only four companies committed real resources [S: Vlad Ionescu thread]. The two tools are drifting apart, and OpenTofu's market share is still a fraction of Terraform's.

### Rewrite in Pulumi
1. **Real programming languages:** TypeScript, Python, Go, .NET, Java, plus YAML and now HCL. Developers get loops, types, unit tests and IDE support [P: Pulumi blog].
2. **Apache-2.0 from the start**, and it says it does not rely on BSL software [S].
3. **Gradual migration:** `pulumi convert --from terraform` converts HCL and CDKTF code. Any Terraform/OpenTofu provider can be used through the bridge, and HCL can run unchanged [P: Pulumi blog].
4. **A home for stranded CDKTF users.** CDKTF is archived, and Pulumi offers the same "IaC in a programming language" model while still maintained.
5. **Leading on AI:** Pulumi Neo, a platform-engineering agent (preview since 2025-09-16, research-notes).
6. **Plan-like previews still exist** (`pulumi preview`), so changes can still be reviewed [P: Pulumi docs].
- **Strongest counter-argument:** Pulumi is also a single, VC-funded vendor, the same kind of company that relicensed in every case in Section 4. A rewrite is the most expensive option. General-purpose code can also be harder to review than declarative HCL, which weakens the "reviewable infrastructure" argument our talk is built on.

### The option nobody argues for
**Crossplane** manages cloud resources as Kubernetes objects. It is a CNCF Graduated project (Nov 2025), under Apache-2.0 (research-notes; GitHub). It is a serious option only for teams already running everything on Kubernetes, which PortoBikes does not.

## 6. Real anchors

- **Fidelity Investments → OpenTofu** (2025-10-06): see the numbers above. Lesson: "the code change is the easy part"; versioning, CI/CD and governance are the hard parts [P].
- **GitLab:** removed its Terraform CI/CD templates and ships OpenTofu components instead [P].
- **TrueCar → OpenTofu**, by its own account on Spacelift's blog (Sept 2025) **(!)** (vendor-hosted, not independently checked).
- **Allianz:** backed OpenTofu at launch; its CIO said it "aligns with this strategy" [S: The Register].
- **Decisions to stay on Terraform:** **(!)** We found no named company publicly announcing that it is staying. All the "we stayed" posts we found are individual engineers' blogs. A company that says nothing has, by default, stayed, so the silence says little.

## Sources

- HashiCorp, "HashiCorp adopts the Business Source License" (2023-08-10): https://www.hashicorp.com/blog/hashicorp-adopts-business-source-license
- Terraform LICENSE (BUSL 1.1 text): https://github.com/hashicorp/terraform/blob/main/LICENSE
- HashiCorp Licensing FAQ: https://www.hashicorp.com/en/license-faq
- HashiCorp BSL page: https://www.hashicorp.com/en/bsl
- Terraform 1.14.0 release notes: https://github.com/hashicorp/terraform/releases/tag/v1.14.0 ; 1.6.0: https://github.com/hashicorp/terraform/releases/tag/v1.6.0
- AWS provider repo (MPL-2.0): https://github.com/hashicorp/terraform-provider-aws
- HashiConf 2025 Terraform announcements (Stacks GA): https://www.hashicorp.com/blog/scale-infrastructure-with-new-terraform-and-packer-features-at-hashiconf-2025
- OpenTofu manifesto: https://opentofu.org/manifesto/ and https://github.com/opentofu/manifesto
- Archived OpenTF pledge page: https://33cfea4f.opentf-website.pages.dev
- The Register, "Terraform fork OpenTF renamed OpenTofu" (2023-09-20): https://www.theregister.com/2023/09/20/terraform_fork_opentf_opentofu/
- env0, "OpenTF joins the Linux Foundation as OpenTofu": https://www.env0.com/blog/opentf-joins-the-linux-foundation-as-opentofu
- Vlad Ionescu, "OpenTF is disconnected from reality": https://typefully.com/iamvlaaaaaaad/opentf-is-disconnected-from-reality-kWKNoBH
- TechTarget on the Registry ToS change: https://www.techtarget.com/searchitoperations/news/366555192/Terraform-Registry-TOS-change-stokes-open-source-ire
- OpenTofu, "Our response to HashiCorp's cease and desist" (2024-04-11): https://opentofu.org/blog/our-response-to-hashicorps-cease-and-desist/
- Futurum Group, dispute analysis: https://futurumgroup.com/insights/a-deep-dive-into-the-hashicorp-and-opentofu-dispute/
- OpenTofu "what's new" pages: https://opentofu.org/docs/v1.7/intro/whats-new/ , https://opentofu.org/docs/v1.8/intro/whats-new/ , https://opentofu.org/docs/v1.9/intro/whats-new/ , https://opentofu.org/docs/v1.10/intro/whats-new/
- OpenTofu 1.11.0: https://opentofu.org/blog/opentofu-1-11-0/ ; 1.13.0: https://opentofu.org/blog/opentofu-1-13-0/
- OpenTofu migration docs: https://opentofu.org/docs/intro/migration/
- Feature-parity comparison (secondary): https://oneuptime.com/blog/post/2026-03-20-opentofu-terraform-feature-parity/view
- Community migration report (secondary): https://dev.to/mateenali66/i-migrated-a-real-production-codebase-from-terraform-to-opentofu-heres-what-broke-4j1b
- CNCF OpenTofu project page: https://www.cncf.io/projects/opentofu/
- TechRepublic on the IBM closing: https://www.techrepublic.com/article/ibm-hashicorp-acquisition-completed/
- Pulumi, "All IaC, including Terraform and HCL" (2025-12-18): https://www.pulumi.com/blog/all-iac-including-terraform-and-hcl/
- Pulumi, "Pulumi 💜's Open Source": https://www.pulumi.com/blog/pulumi-hearts-opensource/ ; forum: https://archive.pulumi.com/t/13905023/how-does-hashicorp-adopting-a-new-bsl-license-affect-the-fut
- Pulumi preview docs: https://www.pulumi.com/docs/iac/cli/commands/pulumi_preview/
- Elastic, "Elasticsearch is Open Source. Again!" (2024-08-29): https://www.elastic.co/blog/elasticsearch-is-open-source-again
- Redis, "Redis is now available under the AGPLv3" (2025-05-01): https://redis.io/blog/agplv3/
- MongoDB SSPL / OSI withdrawal: https://opensourceforu.com/2019/03/mongodb-withdraws-its-server-side-public-license-from-osi-consideration-process/ ; OSI review list: https://lists.opensource.org/pipermail/license-review_lists.opensource.org/2019-March/003989.html
- Valkey launch: https://www.phoronix.com/news/Linux-Foundation-Valkey ; https://www.linuxfoundation.org/blog/a-year-of-valkey
- Fidelity migration (2025-10-06): https://opentofu.org/blog/fidelity-investment-migration/
- GitLab deprecation issue: https://gitlab.com/gitlab-org/gitlab/-/issues/438010 ; epic: https://gitlab.com/groups/gitlab-org/-/epics/12401 ; docs: https://docs.gitlab.com/user/infrastructure/iac/
- TrueCar story (Spacelift, secondary copy): https://www.plushcap.com/content/spacelift/blog/spacelift-upgrading-our-infrastructure-with-opentofu
