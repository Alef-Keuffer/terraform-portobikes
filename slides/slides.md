---
theme: seriph
title: Infrastructure as Code with Terraform
info: DCN (DevOps e Computação na Nuvem), FEUP MESW. The PortoBikes story, from ClickOps to AI-written infrastructure.
# The deck must run offline on the presenter's laptop, so don't fetch web fonts.
fonts:
  provider: none
# The seriph cover layout otherwise loads a remote Unsplash image.
background: ''
favicon: /favicon.svg
# Live debate poll; it stays offline unless the build sets VITE_SLIDE_QUIZ_WS_URL (see layouts/poll.vue).
addons:
  - slidev-addon-slide-quiz
transition: fade
---

# Infrastructure as Code with Terraform

The PortoBikes story

<p class="opacity-70 pt-8">
PortoBikes is invented. Every incident in this talk really happened somewhere.
</p>

<!--
Meet PortoBikes: a bike-rental startup here in Porto. It's invented, but everything that happens to it in this talk has happened to a real company, and we'll show you which one.
-->

---
layout: center
class: text-center bg-black text-white
---

# Friday, 18:00.

## The booking server is down.

<!--
It's Friday, 18:00, peak rental time, and the booking server just died. It was set up by hand three years ago, by someone who has since left.

So: how long would it take *you* to rebuild it?

[pause]

Hold that number. We'll come back to it.
-->

---
layout: poll
poll: vote
quizId: debate-1
question: PortoBikes must decide. What should it do?
options:
  - { label: A, text: Stay on Terraform }
  - { label: B, text: Move to OpenTofu }
  - { label: C, text: Rewrite in Pulumi }
---

# PortoBikes must decide. What should it do?

- A. Stay on Terraform
- B. Move to OpenTofu
- C. Rewrite in Pulumi

<p class="opacity-70">Show of hands.</p>

<!--
Vote #1, before the debate. Scan the QR code and vote. [wait for the bars to settle]

If the QR code fails: timekeeper, count a show of hands for A, B and C and note the numbers.
-->

---
layout: poll
poll: results
quizId: debate-1
question: "Vote #1: before the debate"
options:
  - { label: A, text: Stay on Terraform }
  - { label: B, text: Move to OpenTofu }
  - { label: C, text: Rewrite in Pulumi }
---

# Vote #1: before the debate

<p class="opacity-70">The live results from the talk will be shown here.</p>

<!--
Here's where the room stands before anyone argues. Hold on to it.
-->

---
layout: poll
poll: vote
quizId: debate-2
question: You've heard all three sides. What should PortoBikes do?
options:
  - { label: A, text: Stay on Terraform }
  - { label: B, text: Move to OpenTofu }
  - { label: C, text: Rewrite in Pulumi }
---

# You've heard all three sides. What should PortoBikes do?

- A. Stay on Terraform
- B. Move to OpenTofu
- C. Rewrite in Pulumi

<p class="opacity-70">Show of hands.</p>

<!--
Vote #2, after the debate. Same question, same QR code. Vote again, even if you haven't changed your mind.

If the QR code fails: timekeeper, count a show of hands again.
-->

---
layout: poll
poll: compare
columns:
  - { quizId: debate-1, title: Before the debate }
  - { quizId: debate-2, title: After the debate }
options:
  - { label: A, text: Stay on Terraform }
  - { label: B, text: Move to OpenTofu }
  - { label: C, text: Rewrite in Pulumi }
---

# Before and after the debate

<p class="opacity-70">The live results from the talk will be shown here.</p>

<!--
Before and after, side by side. We're not announcing a winner: this is what the room thinks.
-->

---
layout: center
class: text-center
---

# Friday, 18:00. The booking server is down.

<v-click>

```bash
terraform apply
```

</v-click>

<v-click>

## Back within seconds.

</v-click>

<!--
At the start, we asked how long it would take you to rebuild that server.

[click] terraform apply.

[click] You just watched it take seconds.
-->

---
layout: center
---

<p class="text-3xl leading-relaxed">
Terraform turned infrastructure into reviewable code, and everything since has been about who reviews it: colleagues, policies, and now AI.
</p>

<!--
Terraform turned infrastructure into reviewable code, and everything since has been about who reviews it: colleagues, policies, and now AI.
-->

---
layout: center
class: text-center
---

# Run the demo yourself

<img src="/qr-repo.svg" alt="QR code for github.com/Alef-Keuffer/terraform-portobikes" class="w-56 mx-auto my-6 bg-white p-2" />

[github.com/Alef-Keuffer/terraform-portobikes](https://github.com/Alef-Keuffer/terraform-portobikes)

<!--
Everything you saw, the demo included, is in this repo. Scan the code and run it yourself. Thank you, and now your questions.
-->
