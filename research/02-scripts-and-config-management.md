# Turning point 2: scripts, then configuration management (2016)

Research checked 2026-11-04. Key: [P] = primary source, [S] = secondary source, **(!)** = uncertain or contested; check before it goes on a slide.

## Key points for the talk

- **Scripts write down the steps, not the result.** After the Friday-night disaster, PortoBikes writes Bash scripts. That is progress: the steps are now repeatable and in Git. But a script is **imperative**. Run "create 2 servers" twice and you get 4. **Declarative** tools describe the end state instead, and are designed to be **idempotent**.
- **Configuration management and provisioning are different jobs.** CFEngine (1993), Puppet (2005), Chef (2009) and Ansible (2012) configure machines that already exist. CloudFormation (2011) and Terraform (2014) *create* the infrastructure itself. The confusion between the two is why the glossary says "config management" is a neighbouring practice, not IaC in general.
- **Mutable vs immutable.** Configuration management usually patches live servers in place, so they can still drift. The immutable idea (2013): never change a server, replace it [P].
- **CloudFormation already had the right idea, for AWS only.** It was declarative, and from 2016 it even had a preview of changes (change sets) [P]. But it speaks only AWS. PortoBikes' DNS, monitoring or a second cloud stay ClickOps. This gap is the opening for Terraform at turning point 3.

---

## Part 1: Imperative vs declarative

**Imperative** (GLOSSARY): you write the steps. Here is a Bash script with the AWS CLI:

```bash
# create-servers.sh: run it twice and you have 4 servers
aws ec2 run-instances --image-id ami-0fb653ca2d3203ac1 \
  --instance-type t2.micro --count 2
```

**Declarative** (GLOSSARY): you write the end state, and the tool works out the steps. Here is Terraform:

```hcl
resource "aws_instance" "web" {
  count         = 2
  ami           = "ami-0fb653ca2d3203ac1"
  instance_type = "t2.micro"
}
```

Change `2` to `3`, and the **plan** says "1 to add". Run it again unchanged, and the plan says nothing to do.

**Real reference for the contrast:** Yevgeniy Brikman's Gruntwork post (2016-09-21, updated 2019 and 2022) makes exactly this point [S]:
- With an old-style Ansible `ec2` task, changing `count: 10` to `count: 15` and re-running "would create 15 new servers, giving 25 total".
- With Terraform, the same edit gives "Plan: 5 to add, 0 to change, 0 to destroy".

**Nuance (!):** the line between imperative and declarative is about *how a tool or module is used*, not the brand.
- Brikman classes Ansible and Chef as procedural, and Puppet, CloudFormation and Terraform as declarative [S].
- But today's Ansible `amazon.aws.ec2_instance` module has an `exact_count` parameter: "how many instances that match the filters parameter should be running. Instances are either created or terminated based on this value" [P]. That is declarative behaviour.
- Ansible's own glossary says its resource models bring the system "back to a desired state regardless of the actual state" [P].
- Don't say "Ansible is imperative" on a slide. Say "a Bash script is imperative; these tools are mostly declarative at the resource level".

## Part 2: Idempotence

Ansible's glossary: "An operation is idempotent if the result of performing it once is exactly the same as the result of performing it repeatedly without any intervening actions" [P].

```yaml
# Ansible: safe to run 100 times; installs nginx only if missing
- ansible.builtin.apt:
    name: nginx
    state: present
```

```bash
# Bash: not idempotent; appends a duplicate line on every run
echo "nameserver 8.8.8.8" >> /etc/resolv.conf
```

Luke Kanies describes the same property for Puppet, without using the word: "If they are already configured as desired, then Puppet does nothing" [P].

Why it matters for the story:
- Idempotence is what makes it *safe to re-run* the code after a half-failed run.
- Re-running the code is how you repair **drift**.
- Scripts can be made idempotent with `if` checks, but every author has to remember to do it, for every step.

## Part 3: Configuration management vs provisioning

| | Configuration management | Provisioning |
|---|---|---|
| Question it answers | "What is installed and configured *on* this machine?" | "Which machines, networks, databases, DNS records *exist*?" |
| Examples | CFEngine, Puppet, Chef, Ansible | CloudFormation, Terraform (and later OpenTofu, Pulumi) |
| Typical target | an OS: packages, files, services, users | a cloud API |
| Typical model | agent (Puppet/Chef) or SSH (Ansible) **(!)** | calls cloud APIs directly; keeps **state** (Terraform) or a stack (CloudFormation) |

- **Source:** this division follows Brikman's comparison [S].
- **Overlap (!):** Ansible can create EC2 instances, and Terraform can run boot scripts, so this describes each tool's centre of gravity, not a hard wall. Brikman's own recommendation is to *combine* them: provision with Terraform, configure with a config-management tool or a pre-built image [S].

**Why the distinction matters for the talk:**
- Ansible would have helped PortoBikes rebuild the *software on* the dead server.
- But someone still has to click the server, security group, load balancer and DNS record into existence. That half is still ClickOps.
- The hook problem is only fully solved when the *infrastructure itself* is in code. That is what provisioning tools do.

## Part 4: Mutable vs immutable infrastructure

- **Mutable:** a long-lived server is changed in place (a new package, an edited config). Kief Morris (2013) notes that such servers "drift" from their specification through unmanaged changes [P].
- **Phoenix server:** rebuild it regularly from scratch, so drift cannot pile up [P, Fowler/Morris].
- **Immutable server** (Morris, on martinfowler.com, 2013-06-13): "a server that once deployed, is never modified, merely replaced with a new updated instance." Morris credits the name to Ben Butler-Cole (Thoughtworks) [P].
- **Chad Fowler**, "Trash Your Servers and Burn Your Code" (2013-06-23): "Build a new, upgraded system and throw the old one away" [P]. Who coined the umbrella term "immutable infrastructure" is contested between these sources **(!)**.
- **Link to pets vs cattle (file 01):** immutable infrastructure is the cattle mindset applied to every change. It also needs a provisioning tool: if you replace servers instead of patching them, creating servers must be cheap and repeatable.

## Part 5: The limits of CloudFormation

- **Launched 2011-02-25** (in research-notes) [P]. Templates are declarative and describe a "stack" of AWS resources.
- **It got a preview step early.** CloudFormation added **change sets** on 2016-03-29: you can "preview" which resources will be added, modified or deleted before updating a stack [P]. So "Terraform invented plan" is wrong. Terraform's distinctive move was making the plan multi-provider and central to the workflow **(!)** (our interpretation).
- **Drift detection** arrived 2018-11-13 [P]. It compares the template's expected values with what actually exists.
- **The real limit: AWS only.** Brikman lists CloudFormation as the only tool in his comparison that is closed source and single-cloud [S].
- **Nuance (!):** since 2021-06-21 the CloudFormation Public Registry lets third parties publish resource types. Launch partners included MongoDB, Datadog, JFrog and Snyk [P]. So "AWS only" means "runs only inside AWS, and covers non-AWS services only where a vendor published a type". It still can't manage another cloud.
- **For PortoBikes:** their payments, DNS (e.g. at an external registrar), monitoring SaaS and anything outside AWS stay ClickOps. One tool for everything, with one plan, is the promise of turning point 3.

## Part 6: Timeline

| Year | Event | Source |
|---|---|---|
| 1993 | Mark Burgess starts CFEngine at the University of Oslo, to manage a mix of operating systems | [S] Wikipedia (summarising Burgess); the 1995 paper "A Site Configuration Engine" is in USENIX *Computing Systems* 8(3) [P] |
| 2004–2005 | Puppet: first prototype summer 2004; full-time project from February 2005 (Kanies). Reductive Labs founded 2005 | [P] Kanies, AOSA vol. 2; [S] SCALE 6x speaker bio |
| 2009-01-15 | Chef announced by Opscode (Adam Jacob) | [P] Chef blog, Adam Jacob author page |
| 2011-02-25 | AWS CloudFormation launched | [P] AWS What's New |
| 2012 (Feb) | Ansible by Michael DeHaan; the earliest commits in the public repo date from February 2012. The exact first-release date varies by source **(!)** | [P] GitHub commit history |
| 2012-07-10 | Fowler, "SnowflakeServer" | [P] |
| 2013-06 | "ImmutableServer" (Morris) and "Trash Your Servers" (Chad Fowler) | [P] |
| 2014-07-28 | Terraform v0.1.0 (in research-notes) | [P] |
| 2016-03-29 | CloudFormation change sets | [P] |
| 2018-11-13 | CloudFormation drift detection | [P] |
| 2021-06-21 | CloudFormation Public Registry (third-party resource types) | [P] |

---

## Sources

- Yevgeniy Brikman (Gruntwork), "Why we use Terraform and not Chef, Puppet, Ansible, Pulumi, or CloudFormation" (2016, updated 2022) [S]: https://www.gruntwork.io/blog/why-we-use-terraform-and-not-chef-puppet-ansible-saltstack-or-cloudformation
- Ansible glossary (idempotency, resource model), docs source [P]: https://github.com/ansible/ansible-documentation/blob/devel/docs/docsite/rst/reference_appendices/glossary.rst (rendered: https://docs.ansible.com/ansible/latest/reference_appendices/glossary.html)
- `amazon.aws.ec2_instance` module, `exact_count` [P]: https://github.com/ansible-collections/amazon.aws/blob/main/plugins/modules/ec2_instance.py (rendered: https://docs.ansible.com/ansible/latest/collections/amazon/aws/ec2_instance_module.html)
- Ansible commit history (Feb 2012) [P]: https://github.com/ansible/ansible/commits/devel?until=2012-02-12
- Luke Kanies, "Puppet", *The Architecture of Open Source Applications* vol. 2 [P]: https://aosabook.org/en/v2/puppet.html
- SCALE 6x speaker bio, Luke Kanies (Reductive Labs founded 2005) [S]: https://socallinuxexpo.org/scale6x/conference-info/speakers/Luke-Kanies/index.html
- Chef blog, Adam Jacob author page ("on January 15, 2009 we announced Chef") [P]: https://www.chef.io/blog/author/adam
- USENIX *Computing Systems* vol. 8 no. 3, Summer 1995 (Burgess, CFEngine) [P]: https://usenix.org/legacy/publications/compsystems/1995/summer.html
- CFEngine (Wikipedia, for the 1993 start) [S]: https://en.wikipedia.org/wiki/CFEngine
- AWS, "Introducing AWS CloudFormation" (2011-02-25) [P]: https://aws.amazon.com/about-aws/whats-new/2011/02/25/introducing-aws-cloudformation
- AWS, "AWS CloudFormation Adds Change Sets…" (2016-03) [P]: https://aws.amazon.com/about-aws/whats-new/2016/03/aws-cloudformation-adds-change-sets-for-insight-into-stack-updates
- AWS, "AWS CloudFormation Now Supports Drift Detection" (2018-11) [P]: https://aws.amazon.com/about-aws/whats-new/2018/11/aws-cloudformation-now-supports-drift-detection/
- AWS, "Announcing a new Public Registry for AWS CloudFormation" (2021-06-21) [P]: https://aws.amazon.com/about-aws/whats-new/2021/06/announcing-a-new-public-registry-for-aws-cloudformation
- Kief Morris, "ImmutableServer" (2013) [P]: https://martinfowler.com/bliki/ImmutableServer.html
- Martin Fowler, "SnowflakeServer" (2012) [P]: https://martinfowler.com/bliki/SnowflakeServer.html
- Chad Fowler, "Trash Your Servers and Burn Your Code" (2013) [P]: https://chadfowler.com/articles/trash-your-servers-and-burn-your-code.html
- Terraform repository (v0.1.0 date) [P]: https://github.com/hashicorp/terraform
