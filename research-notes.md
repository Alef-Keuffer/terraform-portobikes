# Research notes (verified 2026-11-04)

Key: [P] = primary source, [S] = secondary source, (!) = uncertain or contested. Double-check anything marked (!) before it goes on a slide.

## History
- **Terraform v0.1.0:** 2014-07-28 [P] https://github.com/hashicorp/terraform
- **Terraform 1.0 GA:** 2021-06-08. At launch: 100M downloads, 5,000+ add-ons [P] https://www.hashicorp.com/blog/announcing-hashicorp-terraform-1-0-general-availability
- **Current versions:** Terraform v1.17.1 (2026-10-28); OpenTofu v1.13.2 (2026-10-21) [P]
- **HCL:** HashiCorp's own config language, inspired by libucl/nginx config syntax [P] https://github.com/hashicorp/hcl
- **Registry size:** "3,000+ providers / 12,000+ modules" (HashiCorp, undated) (!)
- **Predecessors:**
  - CFEngine: 1993
  - Puppet: 2005
  - Chef: 2009
  - AWS CloudFormation: 2011-02-25 [P] https://aws.amazon.com/about-aws/whats-new/2011/02/25/introducing-aws-cloudformation
  - Ansible: 2012

## Business model
- **Open core:** the CLI is free; HCP Terraform (SaaS) and Terraform Enterprise (self-managed) are paid.
- **HCP Terraform pricing, per managed resource per month:**
  - Essentials: $0.10
  - Standard: $0.47
  - Premium: $0.99
  - Enterprise: custom
  - Source [P]: https://www.hashicorp.com/en/pricing
- **Free tier change:** the legacy free plan ended 2026-03-31. The new free tier is capped at 500 resources, with unlimited users [P] https://www.hashicorp.com/en/blog/continuing-hcp-terraform-s-enhanced-free-tier-experience
- **Revenue:**
  - FY2024: $583.1M, up 23% [P] (SEC 10-K)
  - Last reported quarter (Q3 FY2025): $173.4M; 4,856 customers [P]
- **BSL change:**
  - Announced 2023-08-10. Versions up to 1.5.7 remain MPL 2.0; 1.6 and later are BUSL 1.1.
  - Forbids offering Terraform as a hosted or embedded product that competes with HashiCorp.
  - Each version converts to MPL 2.0 after 4 years.
  - Source [P]: https://www.hashicorp.com/en/bsl
- **OpenTofu:**
  - Launched at the Linux Foundation 2023-09-20 [P]
  - First GA (1.6.0): 2024-01-10 [P]
  - CNCF Sandbox since April 2025; 10M+ downloads [P] https://www.cncf.io/projects/opentofu/
- **IBM acquisition:**
  - Announced 2024-04-24: $6.4B enterprise value, $35/share [P] https://newsroom.ibm.com/2024-04-24-IBM-to-Acquire-HashiCorp-Inc-Creating-a-Comprehensive-End-to-End-Hybrid-Cloud-Platform
  - Closed 2025-02-27 [S]
- **Since IBM took over:**
  - CDK for Terraform deprecated and archived 2025-12-10 [P]
  - HCP Consul Dedicated retired
  - Legacy free plan ended
  - "HCP Terraform powered by Infragraph" announced (public preview, May 2026) [S]

## Certifications (official pages, checked 2026-11-04)
| Exam | Price | Length | Format | Valid |
|---|---|---|---|---|
| Terraform Associate (004), replaced 003 on 2026-01-08 | $70.50, no free retake | 1 h | multiple choice, online | 2 years |
| Terraform Infrastructure Engineer Professional (002) | $200 | 90 min | multiple choice | 2 years |
| Terraform Authoring & Operations Advanced (!) (sources conflict on whether this replaced "Professional"; see research/04) | $295, free retake | 4 h | lab + multiple choice, AWS or Azure | 2 years |

- **Sources:** https://developer.hashicorp.com/certifications
- **Prep time:** HashiCorp publishes no official estimate (!).
- **Free study material:** HashiCorp tutorials; freeCodeCamp's 12-hour Associate course.

## Job market
- **Stack Overflow 2025 survey (cloud development):**
  - Terraform: 17.8% of all respondents / 18.7% of professional developers
  - Ansible: 11.7%
  - Measures usage, not jobs [P] https://survey.stackoverflow.co/2025/technology
- **IT Jobs Watch, UK, 6 months to Nov 2026:**
  - 2,390 permanent ads mentioning Terraform, up 49% year on year
  - Median salary £75k
  - Share of all IT ads: 1.96%, down from 3.19%
  - Source [P]: https://www.itjobswatch.co.uk/jobs/uk/terraform.do
- **Firefly State of IaC 2025 (vendor survey):**
  - Terraform: 62% use it
  - OpenTofu: 12% use it; 27% plan to adopt it
  - (!) Not checked against the full report.
- **Do not use:** "Terraform in 88% of DevOps ads" and similar LinkedIn claims. They have no methodology.

## Real-world anchors
- **ClickOps / manual error:** AWS S3 us-east-1 outage, 2017-02-28. An engineer following a playbook mistyped an input, and more servers were removed than intended [P] https://aws.amazon.com/message/41926/
- **Adoption case studies (self-reported on HashiCorp's site):**
  - Cielo: provisioning time down 90%
  - TMX Group: up to 75% faster
  - Skechers: one week to two hours
- **Move to OpenTofu:** Fidelity Investments (Oct 2025): ~50k state files, 4M+ resources, OpenTofu now the default for new deployments. Quote: "OpenTofu really is a drop-in." [P] https://opentofu.org/blog/fidelity-investment-migration/ (!) Other named adopters are unverified.
- **AI agent incident:** DataTalks.Club, 2026-02-26.
  - A Claude Code agent restored an outdated state file and ran `terraform destroy`.
  - This deleted the VPC, ECS, RDS and the snapshots. AWS support recovered the database.
  - Sources: https://incidentdatabase.ai/cite/1424 ; caveat that the popular story is oversimplified: https://www.gruntwork.io/blog/thinking-of-using-ai-with-terraform

## AI + IaC
- **Terraform MCP server:** open-sourced May 2025; GA 2026-06-11 for HCP Terraform and Enterprise [P] https://www.hashicorp.com/blog/terraform-mcp-server-is-now-generally-available
- **HCP Terraform (Sept 2026):** agent identities with short-lived OIDC credentials; `tfctl` CLI [S]
- **Pulumi Neo:** AI platform-engineering agent, public preview 2025-09-16 [P]
- **Research on AI-written infrastructure code (valid ≠ secure):**
  - GenSIaC (arXiv 2511.12385): LLMs often miss security issues
  - SBSeg 2026: WizardCoder-33B produced code that passed validation 77.8% of the time, with 0% compliance under the Checkov security scanner

## Competitors (for the debate)
- **OpenTofu:** MPL-2.0, ~30.7k GitHub stars, CNCF Sandbox
- **Pulumi:** Apache-2.0, ~25.8k stars; uses real programming languages; Neo agent
- **AWS CDK:** active, but only for AWS
- **CDK for Terraform:** **archived Dec 2025**. There is a community fork, cdk-terrain.
- **Crossplane:** CNCF **Graduated** (Nov 2025), Apache-2.0, Kubernetes-native
