# Infrastructure as Code with Terraform

Presentation for DCN (DevOps e Computação na Nuvem), FEUP MESW.

The talk follows PortoBikes, an invented startup, from ClickOps to AI-written infrastructure, with a live Terraform demo and a Terraform vs OpenTofu vs Pulumi debate.

- `GLOSSARY.md`: the words we use, and the ones we avoid
- `research/`: background research, one file per turning point, plus Q&A prep. Deliberately covers more than we present.
- `outline.md`: the talk, one turning point at a time, with speaker notes
- `docs/adr/`: decisions and the reasons behind them
- `demo/`: the live demo, scripted, with a backup recording
- `slides/`: the deck, in [Slidev](https://sli.dev). Published to GitHub Pages on every push to `main` that touches `slides/`: https://alef-keuffer.github.io/terraform-portobikes/

## Slides

```bash
cd slides
npm install
npm run dev       # edit with live reload; presenter mode with notes at /presenter
npm run build     # static site in slides/dist
npm run preview   # serve the build, works offline
npm run check:offline   # after a build: fails if any slide fetches from the network (needs Google Chrome)
```

To present, build and preview on the laptop beforehand, then open the presenter view (`/presenter`) for the speaker notes. Nothing is fetched from the network, so it runs with Wi-Fi off. CI checks this on every pull request that touches `slides/`.

The debate poll is live only on a temporary Netlify copy, built with `VITE_SLIDE_QUIZ_WS_URL` set. Everywhere else its slides show the question as plain text. Setup, the phone test and teardown are in `docs/poll-checklist.md`.

Claims marked **(!)** in the research have not been verified yet. Check them before they go on a slide.
