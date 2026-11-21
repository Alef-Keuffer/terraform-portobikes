# Declare the debate poll in the slides, with a show of hands as backup

The debate vote at turning point 5 runs on `slidev-addon-slide-quiz`. The poll is declared in `slides/slides.md`, and the deck is deployed to Netlify (with a free AnyCable WebSocket app) for the talk only, then taken down. We chose it over Mentimeter because the poll lives in the repo next to the rest of the talk. The cost is that three things we deploy ourselves have to work at once, so we test them end to end with real phones over mobile data before 2026-11-25. If the QR code fails live, we switch to a Mentimeter presentation set up in advance with the same two questions, and if that fails too, the timekeeper counts a show of hands. (Amended 2026-11-21: we added Mentimeter as a backup because the Netlify setup wasn't done yet, three days before the talk.)

## Considered Options

- **Mentimeter** (the lowest-risk option): needs a presenter account, has no API or CLI to create a poll from a file, and the free plan hides part of the results after the session.
- **Slido**: needs a presenter account, has no public API, and allows 3 polls per event on the free plan.
- **`slidev-component-poll`** without a server: phones would have to reach the presenter's laptop, which university Wi-Fi usually blocks.
- **Claper**: its hosted free tier is capped at 10 attendees.

## Consequences

The permanent slides on GitHub Pages can't run the poll, so the poll slide there shows screenshots of the results. The QR code on the closing slide points to the GitHub repo, not to either deck, so it still works after the Netlify teardown.
