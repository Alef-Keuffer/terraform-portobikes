# Debate poll checklist

The debate vote runs on a live copy of the deck on Netlify, with a free AnyCable app relaying the votes (see `adr/0002-debate-poll-in-the-slides.md`). Both exist only for the talk. The local and GitHub Pages decks never connect to them: their poll slides show the question as plain text.

## Set up (before 2026-11-24)

1. Create a free app on [AnyCable Plus](https://plus.anycable.io). Note its WebSocket URL (`wss://…/cable`), its broadcast URL and its broadcast key.
2. On Netlify, import this GitHub repo as a new site. `netlify.toml` sets the build. Under **Site configuration → Environment variables**, add:
   - `VITE_SLIDE_QUIZ_WS_URL`: the WebSocket URL. It turns the poll on.
   - `ANYCABLE_BROADCAST_URL` and `ANYCABLE_BROADCAST_KEY`: used by the vote functions.
   - `VITE_SLIDE_QUIZ_GROUP_ID`: `phone-test` for now. Votes are saved on the site (Netlify Blobs) under this ID.
3. Redeploy. The variables are read at build time, so a deploy started before you added them has no poll.
4. Check the functions and the round trip: `npx -p create-slide-quiz verify-slide-quiz --site https://<site>.netlify.app --ws-url wss://<app>/cable`

Before the first deploy, and after changing the poll code, run `npm run rehearse:poll` in `slides/` (needs `brew install anycable-go`). It runs AnyCable, the vote functions and three scripted phones on the laptop, and checks that every tab shows the same counts.

## Backup: Mentimeter (if the Netlify poll isn't working by 2026-11-24)

Set this up whether or not the Netlify poll works. It takes about 10 minutes and needs no deploy.

1. Sign in to [mentimeter.com](https://www.mentimeter.com) (free plan) and create a presentation called "PortoBikes debate".
2. Add two **Multiple Choice** slides, with the wording copied from `slides/slides.md`:
   - Slide 1: "PortoBikes must decide. What should it do?"
   - Slide 2: "You've heard all three sides. What should PortoBikes do?"
   - Both slides: options "A. Stay on Terraform", "B. Move to OpenTofu" and "C. Rewrite in Pulumi". Results as bars, one vote per person.
3. Test it once with two phones on mobile data: scan the join QR code and vote on each slide.
4. Reset the results (**⋯ → Reset results**) after the test.

On the day, open the Mentimeter presentation in a second browser window before the talk. If the Netlify poll fails, switch the projector to Mentimeter at the vote slide, let people vote, then switch back to the deck. Take a screenshot of each Mentimeter result straight away, because the free plan hides some results after the session. Mentimeter can't compare the two votes side by side: show the two screenshots one after the other instead.

Fallback order: Netlify poll → Mentimeter → show of hands.

## Phone test (by 2026-11-24)

Use at least two phones with Wi-Fi off, on mobile data. The laptop can be on any network.

- [ ] Open `https://<site>.netlify.app/presenter` and the projected view (`https://<site>.netlify.app`) in two tabs of the same browser, as on the day.
- [ ] On vote #1, each phone scans the QR code, opens the voting page and votes.
- [ ] On the "Vote #1" results slide, the bars match the votes and the count says how many responded.
- [ ] On vote #2, the phones vote differently from vote #1.
- [ ] On "Before and after the debate", the two columns show the two votes separately.
- [ ] Reload the projected tab: the results are still there.
- [ ] Open the compare slide in a new window, or on another laptop: it shows the same results. Votes are saved on the site, so a tab opened late catches up.
- [ ] Set `VITE_SLIDE_QUIZ_GROUP_ID` to `talk` and redeploy, so the test votes don't show at the talk. Check that vote #1 now shows no votes.
- [ ] Try the show-of-hands backup once: the timekeeper counts A, B and C out loud and notes the numbers.

## On the day

- Open the deck in a **new browser window** just before the talk. A tab left over from the test can still show the test votes.
- If a tab crashes, reopen it: it loads the saved votes.
- If no bars move within about 30 seconds of a vote, the QR code has failed. Switch to the Mentimeter window (see the backup section above). If Mentimeter fails too, the timekeeper counts a show of hands for A, B and C and notes the numbers, for vote #1 and again for vote #2. Don't troubleshoot on stage.
- After vote #2, take a screenshot of "Before and after the debate", and of each results slide. The GitHub Pages copy shows them instead of the live poll.

## Teardown (after the talk)

- [ ] Commit the result screenshots under `slides/public/`.
- [ ] Delete the Netlify site (**Site configuration → Delete this site**). This also deletes the saved votes.
- [ ] Delete the AnyCable app.
- [ ] Delete the Mentimeter presentation, if you made one.
- [ ] Check that the Netlify URL no longer loads, and that the GitHub Pages deck and the closing QR code (which points to the repo) still work.
