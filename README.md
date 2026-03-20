# Video Share

A real-time collaborative video queue — paste a link, everyone sees it instantly.

**[Live demo →](https://earthddx.github.io/video-share)**

> Originally written in 2020 and left untouched for ~6 years. Resurrected, modernised, and brought back to life.

---

## Features

- **Multi-source playback** — YouTube, Vimeo, SoundCloud and anything ReactPlayer supports
- **Real-time sync** — videos added or removed appear instantly for all connected users via GraphQL subscriptions
- **Queue management** — add to queue, drag to reorder, shuffle / unshuffle, clear all
- **Full playback controls** — seek, volume, repeat, picture-in-picture expand
- **Reliable auto-advance** — uses `onEnded` for HTML5/non-YouTube sources; falls back to a `played >= 0.99` heuristic for YouTube (which sometimes suppresses `onEnded`); a guard ref prevents double-firing
- **Mini player** — persistent bar at the bottom with progress, seek and volume controls
- **Dark / light theme** — persisted across sessions
- **Keyboard shortcuts** — `Space` to play/pause, `←` / `→` to skip tracks
- **Mobile friendly** — responsive layout, queue accessible via bottom drawer

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Material UI v5 |
| State | useReducer + React Context |
| Data / realtime | Apollo Client v3, GraphQL subscriptions (graphql-ws) |
| Backend | Hasura (PostgreSQL) |
| Playback | ReactPlayer |
| Drag & drop | dnd-kit |
| Deployment | GitHub Pages |

## Getting started

```bash
# Install dependencies
npm install

# Start dev server
npm start

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

The app connects to a hosted Hasura instance — no local backend setup required.

## Project structure

```
src/
├── components/
│   ├── AddVideo.js          # URL input + submit
│   ├── AddVideoDialog.js    # Confirm & edit metadata before adding
│   ├── Video.js             # Video card with inline player controls
│   ├── VideoList.js         # Subscription-driven video grid
│   ├── QueuedVideoList.js   # Sidebar queue with drag-and-drop
│   ├── MiniPlayer.js        # Fixed bottom player bar
│   ├── Header.js            # App bar with theme toggle
│   └── AboutDialog.js       # About modal
├── graphql/
│   ├── client.js            # Apollo client + local queue resolver
│   ├── mutations.js
│   ├── queries.js
│   └── subscriptions.js
├── reducer.js               # Global playback state
├── theme.js                 # MUI theme (dark / light)
└── App.js                   # Root — theme provider, layout, keyboard shortcuts
```

## Notes

- The Hasura GraphQL endpoint is public — do not store sensitive data.
- The shared video list is visible and editable by anyone with the app URL.
- The personal queue is stored in `localStorage` and persists across page refreshes.
