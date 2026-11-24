# Grilling record, 2026-11-24: backup slides from team feedback

The team suggested removing slides 7, 14, 20, 21 and 26–28. We don't remove any. Some become **backup slides** (see `GLOSSARY.md`): they stay in place, the live talk skips them, and they're shown only if someone asks. Slide numbers are Slidev's, as of commit `e8aa31f`.

## Decisions

| Slide | Title | Decision |
|---|---|---|
| 7 | 📍 AWS S3, 2017 | Backup slide (topic: "another real outage") |
| 14 | Terraform almost didn't make it | Backup slide (topic: "how Terraform started") |
| 20 | Same workflow, another platform | Already a backup slide; no change |
| 21 | How Terraform changed, 0.x → 1.x | Stays live: it's the only answer to "How did it change since it started?" from `ideas.md` |
| 26 | How HashiCorp makes money | Stays live: the money motive behind the BSL change |
| 27 | Why job ads ask for it | Stays live: answers the job-ads question from `ideas.md` |
| 28 | Certifications | Backup slide (topic: "certifications") |

- **The presenter note.** Each new backup slide's notes start with this line, above the existing speaker label, in the same format slide 20 already uses:
  `BACKUP SLIDE: skip it in the live talk; show it only if someone asks about <topic>.`
- **The deck still reads in order if nothing is skipped.** So no notes or bridges are moved. Instead, the next live slide gets a conditional line for when the backup slide is skipped:
  - Slide 15 ("The core model"): *If slide 14 was skipped, open with: "PortoBikes, 2017. The scripts describe the steps; what we want is something that describes the result."*
  - Slide 27 ("Why job ads ask for it"): *If slide 28 is skipped, close with: "So PortoBikes now has a team, a pipeline, policies, and maybe a certified engineer or two. Everything depends on one tool, and one vendor: HashiCorp. In 2023, HashiCorp changed the rules."*
  - Slide 7 needs no bridge. Slide 8 opens with "So what's the alternative?", which follows slide 6.
- The Turning point 3 section marker stays on slide 14.

## Unchanged
- Slide order and everything the audience sees on screen. The word "backup" appears only in the notes.
- `slides/narration.md`: the **narrated video** keeps every slide, backup slides included.
- Section budgets (`~N min`). We don't rerun `npm run timing`. (`timing.mjs` already skips notes that start with `BACKUP SLIDE`.)
- The fallback recordings' slide titles ("Backup: …"). Only the glossary renames them.

## Files the change touches
- `slides/slides.md`: the `BACKUP SLIDE` line on 7, 14 and 28, and the conditional lines on 15 and 27.
- `outline.md`: the running order marks 7, 14, 20 and 28 as backup slides.
- `GLOSSARY.md`: **Backup slide** and **Fallback recording** (done in this session).

## No ADR
Keeping the slides in place, rather than moving them to an appendix, is cheap to reverse. It was chosen because moving them would renumber `narration.md`.
