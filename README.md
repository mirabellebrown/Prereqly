# UCSB SILVER

UCSB SILVER is a Next.js prototype for a UC Santa Barbara academic planning app. It is designed as a clickable student experience for exploring course planning, degree progress, and deadlines—built to complement **Gaucho GOLD**, not replace it.

## Live demo

[https://prereqly.vercel.app/](https://prereqly.vercel.app/) *(deployment URL may be updated)*

## Functionality

The current prototype includes:

- a dashboard with a student profile, graduation progress, quick access cards, and upcoming academic deadlines
- a 4-year planner with a pre-filled Letters & Science sample Economics pathway and click-to-add course recommendations
- a degree checklist with GE, major, and elective requirements plus a transfer credit toggle
- an L&S-focused Campus Q&A panel for general questions, mandatory links to official UCSB pages on every reply, and clear handoff to L&S General Academic Advising for complex topics
- a full-page **Economics prep flowchart** at `/econ-prep-map` (large SVG, color-coded arrows for each branch, **All** gates, tap-to-complete demo state saved in the browser); linked from the dashboard quick access cards

## Tech stack

- Next.js
- React
- Tailwind CSS

## Getting started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Deploy

This app is deployed on Vercel and can also be redeployed there as a standard Next.js project.
