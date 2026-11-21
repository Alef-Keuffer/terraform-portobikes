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
- If no bars move within about 30 seconds of a vote, the QR code has failed. The timekeeper counts a show of hands for A, B and C and notes the numbers, for vote #1 and again for vote #2. Don't troubleshoot on stage.
- After vote #2, take a screenshot of "Before and after the debate", and of each results slide. The GitHub Pages copy shows them instead of the live poll.

## Teardown (after the talk)

- [ ] Commit the result screenshots under `slides/public/`.
- [ ] Delete the Netlify site (**Site configuration → Delete this site**). This also deletes the saved votes.
- [ ] Delete the AnyCable app.
- [ ] Check that the Netlify URL no longer loads, and that the GitHub Pages deck and the closing QR code (which points to the repo) still work.
