# Day-of checklist

The talk is on 2026-11-25. This page covers the timing, the speaker slots still to fill, and what to do on the 24th and the 25th. The poll's own setup and teardown are in `poll-checklist.md`.

## Timing

`npm run timing` in `slides/` counts the spoken words in the speaker notes, section by section, at 130 words per minute. Stage directions in `[brackets]`, instructions to the speaker, "Detail if there's time" lines and the backup slides don't count. The demo, the debate and the votes are timed by the clock instead. Each section's budget comes from its `<!-- ===== … ~N min ===== -->` marker in `slides.md`.

| Section | Speaker | Budget | Words | Estimate |
|---|---|---|---|---|
| Opening hook | Alef | 1.5 | 76 | 0.6 |
| 1. ClickOps | S1 | 5.5 | 736 | 5.7 |
| 2. Scripts and config management | S1 | 4 | 455 | 3.5 |
| 3. Terraform arrives, plus the demo | S2, Alef | 7.5 | 365 | 2.8 + 4 demo = 6.8 |
| 4. The team grows | S2 | 7.5 | 1,019 | 7.8 |
| 5. License change, plus the debate | S3, everyone | 14 | 657 | 5.1 + 8.5 (votes 2, debate 5, `tofu` 1.5) = 13.6 |
| 6. The future | S3 | 6 | 845 | 6.5 |
| Closing | Alef | 1 | 66 | 0.5 |
| **Whole talk** | | **47** | | **45.0** |

The budgets were moved, not grown: the `tofu` demo and the debate live in section 5, so it gets the minutes section 3 doesn't need. Sections 4 and 6 were over and were trimmed in the notes. No slide was cut. Clicks, hand-offs and nerves aren't in the estimate. That's what the 2 minutes left over, and the 13-minute buffer before Q&A, are for.

If your read-through runs long, trim your notes, not the slides, and run `npm run timing` again.

## Speaker slots

Fill these in once people are confirmed.

| Placeholder | Who | Where |
|---|---|---|
| S1 | | Turning points 1 and 2 |
| S2 | | Turning point 3 (narrates the demo) and 4 |
| S3 | | Turning point 5 (hosts the votes and the debate) and 6 |
| `[Side A speaker]` | | Debate: stay on Terraform. Shown on the slide. |
| `[Side C speaker]` | | Debate: rewrite in Pulumi. Shown on the slide. |
| S4, S5 (optional) | Al Mahmud, Sergio | If they join, they take debate sides A and C first |
| Timekeeper | whoever isn't speaking | Cards: "2 min left" and "wrap up" per section; "30 seconds" and "stop" in the debate; counts the show of hands |

Alef opens, closes, drives both demos and argues side B (OpenTofu).

To fill them in, put the names in and run this from the repo root. `S3` is also an AWS service, so the S3 rule only touches the speaker labels:

```sh
perl -pi -e 's/\bS1\b/NAME1/g; s/\bS2\b/NAME2/g;
  s/(\[|\)\. |\| |–)S3(?=[],.| ])(?! (?:locks|can|in|bucket))/${1}NAME3/g;
  s/\[Side A speaker\]/NAMEA/g; s/\[Side C speaker\]/NAMEC/g' slides/slides.md outline.md
git diff --word-diff   # check that only speaker labels changed
```

## 24 November

- [ ] Each speaker reads their sections aloud, alone, with a timer, from the presenter view (`npm run dev`, then `/presenter`). Compare with the table above. Over by more than half a minute: trim the notes.
- [ ] Re-check the IT Jobs Watch number in turning point 4 (it's a rolling window).
- [ ] On the laptop that will present: follow `demo/README.md` setup, then run `./demo.sh` start to finish, including the `tofu` part. Then run it once more with `-d`.
- [ ] On that laptop: `npm run build && npm run check:offline && npm run preview` in `slides/`. Play both backup recordings (after "LIVE DEMO" and after "LIVE: `tofu plan`") with Wi-Fi off.
- [ ] Poll: the phone test and the Mentimeter backup in `poll-checklist.md`, including one show-of-hands rehearsal with the timekeeper. Switch the group ID to `talk` afterwards.
- [ ] Make the timekeeper cards: "2 min left", "wrap up", "30 seconds", "stop".

## 25 November

Set up in this order, before people arrive:

1. [ ] Laptop on power. Notifications off.
2. [ ] Colima started, `DOCKER_HOST` set, port 8080 free. `./demo.sh` open in a terminal, waiting at its first step.
3. [ ] Deck: open the Netlify copy in a **new browser window**, the projected view and `/presenter` in two tabs. Check vote #1 shows no votes.
4. [ ] Backup deck: `npm run preview` running locally, in case the Wi-Fi or Netlify goes down.
5. [ ] Backup video: on the "Backup: the demo, recorded" slide, check the video loads. Then go back to the title slide.
6. [ ] Mentimeter open in another window, results reset.
7. [ ] Timekeeper has the cards, a pen and paper for the show of hands.

During the talk the fallback order for the poll is Netlify → Mentimeter → show of hands. If the demo fails, go to the next slide (the recording). Don't troubleshoot on stage.

## After the talk

- [ ] Screenshot the results slides (or the Mentimeter results).
- [ ] Teardown in `poll-checklist.md`: commit the screenshots, delete the Netlify site, the AnyCable app and the Mentimeter presentation.
