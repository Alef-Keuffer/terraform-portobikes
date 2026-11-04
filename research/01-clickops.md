# Turning point 1: ClickOps (2015)

Research checked 2026-11-04. Key: [P] = primary source, [S] = secondary source, **(!)** = uncertain or contested; check before it goes on a slide.

## Key points for the talk

- **ClickOps works until the server dies.** In 2015 the PortoBikes founders click their AWS setup together in the console. Nothing is written down, so nothing can be reviewed, repeated or audited. When the Friday 18:00 server dies, the only "documentation" is the dead machine.
- **The failure modes have names.** Martin Fowler called a hand-tuned production machine a *snowflake server* in 2012: "good for a ski resort, bad for a data center" [P]. **Drift** is what happens when hand-made changes pile up. *Pets vs cattle* is the mindset shift: stop nursing irreplaceable servers and build ones you can replace.
- **Real anchors: humans running one-off commands take down real systems.** In the AWS S3 outage (2017), one mistyped command input took S3 in us-east-1 offline for about four hours [P]. At Knight Capital (2012), one of eight servers was missed during a deployment, and the firm lost $460 million in about 45 minutes [P, SEC order].
- **Infrastructure as Code is the answer the industry converged on.** The term appears around 2009 in the DevOps, Puppet and Chef communities **(!)**. Kief Morris's O'Reilly book (1st ed. 2016, 3rd ed. 2025) became the reference text [P/S].

---

## Part 1: What ClickOps is and why it breaks

**ClickOps** (see GLOSSARY): managing infrastructure by hand through web consoles. For a two-person startup in 2015, it is the rational choice. The AWS console is fast, visual and free to learn. The costs are hidden and arrive later.

**1. Snowflake servers.** Fowler (2012-07-10) describes a server whose configuration has been hand-tuned through "command lines, GUI screens, and text-file edits" until it is unique [P]. He lists the problems:
- It is hard to reproduce: you can't easily replace failed hardware or mirror production for testing.
- It is fragile: "Snowflakes soon become hard to understand and modify."
- It forces manual processes and documentation just to satisfy audit requirements.

His remedy is to define server configuration in version-controlled recipes (Puppet, Chef). That is turning point 2.

**2. Drift between environments.** Kief Morris (on Fowler's site, 2013) describes long-running servers that "drift" from their specification through unmanaged changes [P]. In ClickOps there is *no* specification to drift from, so staging and production quietly diverge. Nobody can say which difference caused a bug. (The talk's own term **drift** means a mismatch between code and reality, so strictly it starts to exist only from turning point 3 onwards.)

**3. Only one person can rebuild it.** This is the opening hook. The configuration lives in one founder's memory and in the machine itself. The Knight Capital anchor below shows that one missed step by one person can be invisible until it is catastrophic.

**4. No audit trail.** A click leaves no diff, no reviewer and no reason. Fowler's IaC article (2016-03-01, summarising Morris) lists "keep everything in version control" for auditability as a core practice [P]. The talk's thread starts here: ClickOps is *unreviewable*.

### Pets vs cattle

- **Pets:** "Servers or server pairs that are treated as indispensable or unique systems that can never be down."
- **Cattle:** "Arrays of more than two servers, that are built using automated tools, and are designed for failure."
- **Who:** Randy Bias's own history of the metaphor (2016-09-29) credits Bill Baker (Microsoft), who used it in a talk about scaling SQL Server (scale-up vs scale-out). Bias says he came across it around 2011–2012 and reframed it for cloud as *disposability*. CERN's Tim Bell, among others, then spread it [P, Bias's own account]. The year of Baker's original talk is not given **(!)**.
- **For the talk:** PortoBikes' server is a pet with a name. The hook ("nobody knows how it was configured") is the moment the pet dies.

---

## Part 2: Real anchors

### A. AWS S3 outage, us-east-1, 2017-02-28 (already verified in research-notes; more depth)

From Amazon's own post-event summary [P]:
- **09:37 PST:** an authorised S3 team member, "following an established playbook", ran a command to remove a small number of servers from a billing-related subsystem. "One of the inputs to the command was entered incorrectly and a larger set of servers was removed than intended."
- The removed servers also supported two critical subsystems:
  - **index:** metadata and location of every object in the region; needed for GET, LIST, PUT and DELETE;
  - **placement:** allocates storage for new objects.
- Both needed a full restart, and S3 could not serve requests in the meantime.
- **Recovery:** index able to serve GET, LIST and DELETE again at 12:26 PST; fully recovered at 13:18 PST; placement recovered and S3 "operating normally" at 13:54 PST. That is about **4 h 17 min** from start to finish (our calculation from AWS's timestamps).
- **Knock-on effects:** the S3 console, new EC2 instance launches, EBS volumes needing S3 snapshots, and AWS Lambda. The AWS Service Health Dashboard itself depended on S3, so AWS couldn't update it until 11:37 PST and posted on Twitter instead.
- **Fixes:**
  - The tool now removes capacity more slowly.
  - It refuses to take "any subsystem below its minimum required capacity".
  - Other operational tools are being audited for similar safety checks.
  - The Health Dashboard console now runs across multiple regions.

**How to frame it (!):** this was a command-line action run from a playbook, not console clicking. It is a *manual-operations* anchor rather than strictly ClickOps. The lesson that carries over: a human typing parameters into a live system, with no preview and no guardrail. That is exactly what Terraform's **plan** later adds.

### B. Knight Capital, 2012-08-01 (SEC order, Release No. 34-70694, 2013-10-16)

From the SEC order [P] (paragraph numbers in brackets):
- **[15]** Starting 2012-07-27, Knight deployed new code to its SMARS order router in stages. "One of Knight's technicians did not copy the new code to one of the eight SMARS computer servers. Knight did not have a second technician review this deployment … Knight had no written procedures that required such a review."
- **[16]** On the eighth server, old, unused "Power Peg" code was still present. Orders carrying a repurposed flag activated it, and the server sent child orders without limit.
- **[17]** The result: 4 million executions in 154 stocks, more than 397 million shares, "in approximately 45 minutes". Knight was left with roughly $3.5B net long and $3.15B net short, and "realized a $460 million loss".
- **[19]** Before the market opened, an internal system sent 97 automated "Power Peg disabled" emails. No one acted on them.
- **[27]** During the incident, Knight uninstalled the new code from the seven *correct* servers, which "worsened the problem".
- **[41]** "A written procedure requiring a simple double-check of the deployment … could have identified that a server had been missed."
- **Penalty:** $12 million, paid without admitting or denying the findings [P, SEC press release / digest].

**Framing:** this is an *application deployment*, not infrastructure provisioning. But it is the clearest documented case of one machine out of N silently differing from the rest: a snowflake caused by a hand-performed, unreviewed step. The popular "manual deployment" summary is a fair reading, but the SEC's wording is "did not copy the new code" and missing review/procedures **(!)**. Quote the SEC, not the blogs.

### C. Optional third anchor: GitLab.com database outage, 2017-01-31

From GitLab's own postmortem (published 2017-02-10) [P]:
- While trying to rebuild replication, an engineer meant to wipe the PostgreSQL data directory on the secondary (`db2`). "Unfortunately this process was executed on the primary instead" (`db1`). About 300 GB was gone before it was stopped.
- **Data lost:** about six hours of database changes, an estimated 5,000 projects, 5,000 comments and 700 users. Git repositories were unaffected.
- **Outage:** about 18 hours.
- **Backups:** "the process of both finding and using backups failed completely". Examples: `pg_dump` used 9.2 binaries against a 9.6 database, and its failure emails were silently rejected (DMARC). Recovery used an LVM snapshot taken about 6 hours earlier, intended for staging.
- **Use for the talk:** the wrong-terminal mistake is the human-at-a-shell failure mode. The unverified backups are the "nobody knows if this still works" failure mode.

---

## Part 3: Defining Infrastructure as Code, and where it came from

**Definition (GLOSSARY):** managing infrastructure through machine-readable definition files kept in version control, instead of by clicking in consoles or running ad-hoc scripts. Fowler's one-liner: "the approach to defining computing and network infrastructure through source code" [P, 2016-03-01].

**Practices Fowler lists from Morris's book** [P]:
- Use definition files for everything; never change live servers by hand.
- Self-documenting systems.
- Version everything.
- Continuously test, through pipelines.
- Small changes.
- Keep services available during changes.

**Origins of the term (!):** the term's origin is genuinely fuzzy.
- Morris's book site says the earliest uses *he* found were Andrew Clay Shafer's "Agile Infrastructure" talk at Velocity 2009 and John Willis's write-up of it. The term emerged around the Agile 2008 talk by Clay Shafer and Patrick Debois that sparked the DevOps movement.
- Morris adds that Adam Jacob (Chef co-founder) and Luke Kanies (Puppet founder) "were also using the phrase around this time" [P, author's own account].
- A 2010 *Web Operations* chapter by Adam Jacob is often cited, but we could not verify it **(!)**. Say "around 2009, in the DevOps / Puppet / Chef community", not a single inventor.

**Kief Morris, *Infrastructure as Code* (O'Reilly):**
| Edition | Year | Focus |
|---|---|---|
| 1st, *Managing Servers in the Cloud*, ISBN 978-1-4919-2435-8 | 2016 (June per retailers **(!)**) | server configuration (Chef, Puppet) |
| 2nd, *Dynamic Systems for the Cloud Age* | 2020 (Dec 2020 / Jan 2021 depending on listing **(!)**) | infrastructure "stacks" (Terraform, CDK) |
| 3rd, ISBN 978-1-0981-5035-8 | 2025 (O'Reilly: March; print April) | platform strategy; declarative vs procedural languages |

- **Sources:** focus per Morris's own book page [P]; ISBNs and dates per publisher/library/retailer listings [S].
- **Author:** Morris is a Thoughtworks engineer (Thoughtworks lists him as a "distinguished infrastructure engineer") [P].
- **Nice talk detail:** the book itself moved from *configuring servers* to *defining stacks*. That mirrors PortoBikes' move from turning point 2 to turning point 3.

---

## Sources

- AWS, "Summary of the Amazon S3 Service Disruption in the Northern Virginia (US-EAST-1) Region" [P]: https://aws.amazon.com/message/41926/
- SEC, Order Instituting Proceedings, *In the Matter of Knight Capital Americas LLC*, Rel. 34-70694, 2013-10-16 [P]: https://www.sec.gov/files/litigation/admin/2013/34-70694.pdf
- SEC News Digest 2013-10-16 (penalty summary) [P]: https://www.sec.gov/news/digest/2013/dig101613.htm
- GitLab, "Postmortem of database outage of January 31" [P]: https://about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/
- Martin Fowler, "SnowflakeServer" (2012) [P]: https://martinfowler.com/bliki/SnowflakeServer.html
- Kief Morris, "ImmutableServer" (2013, on martinfowler.com) [P]: https://martinfowler.com/bliki/ImmutableServer.html
- Martin Fowler, "InfrastructureAsCode" (2016) [P]: https://martinfowler.com/bliki/InfrastructureAsCode.html
- Randy Bias, "The History of Pets vs Cattle and How to Use the Analogy Properly" (2016) [P]: https://cloudscaling.com/blog/cloud-computing/the-history-of-pets-vs-cattle/
- Kief Morris, book site (term origins, editions) [P]: https://infrastructure-as-code.com/book/
- Thoughtworks, *Infrastructure as Code* 3rd ed. [P]: https://www.thoughtworks.com/insights/books/infrastructure-as-code-3rd-ed
- O'Reilly listing, 3rd ed. [P]: https://www.oreilly.com/library/view/-/9781098150341/
- TUM library record, 1st ed. 2016 [S]: https://search.ub.tum.de/vufind/Record/DE-604.BV043682394
- Powell's listing, 1st ed. ISBN 9781491924358 [S]: https://www.powells.com/book/infrastructure-as-code-managing-servers-in-the-cloud-9781491924358
