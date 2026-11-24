# Day-of checklist

The talk is on 2026-11-25. This page covers the timing, who has which speaker slot, and what to do on the 24th and the 25th. The poll's own setup and teardown are in `poll-checklist.md`.

## Timing

`npm run timing` in `slides/` counts the spoken words in the speaker notes, section by section, at 130 words per minute. Stage directions in `[brackets]`, instructions to the speaker, "Detail if there's time" lines and the backup slides don't count. The demo, the debate and the votes are timed by the clock instead. Each section's budget comes from its `<!-- ===== … ~N min ===== -->` marker in `slides.md`.

As of 2026-11-21 (`npm run timing` always has the current numbers):

| Section | Speaker | Budget | Words | Estimate |
|---|---|---|---|---|
| Opening hook | Alef | 1.5 | 76 | 0.6 |
| 1. ClickOps | S1 | 5.5 | 736 | 5.7 |
| 2. Scripts and config management | S1 | 4 | 455 | 3.5 |
| 3. Terraform arrives, plus the demo | S2, Alef | 7.5 | 365 | 2.8 + 4 demo = 6.8 |
| 4. The team grows | S2 | 7.5 | 1,019 | 7.8 |
| 5. License change, plus the debate | S4, everyone | 14 | 657 | 5.1 + 8.5 (votes 2, debate 5, `tofu` 1.5) = 13.6 |
| 6. The future | S5 | 6 | 845 | 6.5 |
| Closing | Alef | 1 | 66 | 0.5 |
| **Whole talk** | | **47** | | **45.0** |

The budgets were moved, not grown: the `tofu` demo and the debate live in section 5, so it gets the minutes section 3 doesn't need. Sections 4 and 6 were over and were trimmed in the notes to within half a minute of their budget. No slide was cut. Clicks, hand-offs and nerves aren't in the estimate. That's what the 2 minutes left over, and the 13-minute buffer before Q&A, are for.

If your read-through runs long, trim your notes, not the slides, and run `npm run timing` again.

## Speaker slots

The slides and the outline use the numbers. This is the map. There is no S3: in the slides, S3 is the AWS service.

| Slot | Who | Where |
|---|---|---|
| S1 | Daniella | Turning points 1 and 2 |
| S2 | Afonso | Turning point 3 (narrates the demo) and 4 |
| S4 | Al Mahmud | Turning point 5: hosts both votes and says the Crossplane line; argues side A (stay on Terraform) |
| S5 | Sergio | Argues side C (rewrite in Pulumi), then turning point 6 |
| Alef | Alef | Opening, closing, both demos, side B (move to OpenTofu) |
| Timekeeper | whoever isn't speaking | Cards: "2 min left" and "wrap up" per section; "30 seconds" and "stop" in the debate; counts the show of hands |

## 24 November

- [ ] Each speaker reads their sections aloud, alone, with a timer, from the presenter view (`npm run dev`, then `/presenter`). Compare with the table above. Over by more than half a minute: trim the notes.
- [ ] Re-check the IT Jobs Watch number in turning point 4 (it's a rolling window).
- [ ] On the laptop that will present: follow `demo/README.md` setup, then run `./demo.sh` start to finish, including the `tofu` part. Then run it once more with `-d`.
- [ ] On that laptop: `npm run build && npm run check:offline && npm run preview` in `slides/`. Play both backup recordings (after "LIVE DEMO" and after "LIVE: `tofu plan`") with Wi-Fi off.
- [ ] Poll: the phone test and the Mentimeter backup in `poll-checklist.md`, including one show-of-hands rehearsal with the timekeeper. Afterwards, switch the group ID to `talk` and redeploy.
- [ ] Make the timekeeper cards: "2 min left", "wrap up", "30 seconds", "stop".

## 25 November

Set up in this order, before people arrive:

1. [ ] Laptop on power. Notifications off.
2. [ ] Colima started, `DOCKER_HOST` set, port 8080 free. `./demo.sh` open in a terminal, waiting at its first step.
3. [ ] Deck: open the Netlify copy in a **new browser window**, the projected view and `/presenter` in two tabs. Check vote #1 shows no votes.
4. [ ] Backup deck: `npm run preview` running locally, in case the Wi-Fi or Netlify goes down.
5. [ ] Backup videos: on "Backup: the demo, recorded" and "Backup: `tofu plan`, recorded", check each video loads. Then go back to the title slide.
6. [ ] Mentimeter open in another window, results reset.
7. [ ] Timekeeper has the cards, a pen and paper for the show of hands.

During the talk the fallback order for the poll is Netlify → Mentimeter → show of hands. If the demo fails, go to the next slide (the recording). Don't troubleshoot on stage.

## After the talk

- [ ] Screenshot the results slides (or the Mentimeter results).
- [ ] Teardown in `poll-checklist.md`: commit the screenshots, delete the Netlify site, the AnyCable app and the Mentimeter presentation.
