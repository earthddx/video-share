# Video Share

A real-time collaborative video queue — paste a link, everyone sees it instantly.

**[Live demo →](https://earthddx.github.io/video-share)**

> Originally written in 2020 and left untouched for ~6 years. Resurrected, modernised, and brought back to life.

---

## Features

- **Multi-source playback** — YouTube, Vimeo, SoundCloud and anything ReactPlayer supports
- **Real-time sync** — videos added or removed appear instantly for all connected users via GraphQL subscriptions
- **Queue management** — add to queue, drag to reorder (mouse and touch), shuffle / unshuffle, clear all
- **Full playback controls** — seek, volume, repeat, playback speed (0.75×–2×), expand to fullscreen
- **Reliable auto-advance** — uses `onEnded` for HTML5/non-YouTube sources; falls back to a `played >= 0.99` heuristic for YouTube (which sometimes suppresses `onEnded`); a guard ref prevents double-firing
- **Mini player** — persistent bar at the bottom with progress, seek, volume and speed controls; click thumbnail/title to scroll to and highlight the active video
- **Search / filter** — filter the video list by title or artist without interrupting playback
- **Keyboard shortcuts** — `Space` play/pause, `←` / `→` skip tracks, `?` show shortcut overlay
- **Dark / light theme** — persisted across sessions
- **Mobile friendly** — responsive layout, draggable queue FAB, queue accessible via bottom drawer

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
│   ├── add-video/
│   │   ├── index.js             # URL input with clear button + submit
│   │   └── AddVideoDialog.js    # Confirm & edit metadata before adding
│   ├── video/
│   │   ├── index.js             # Video card with inline player + highlight animation
│   │   ├── VideoList.js         # Subscription-driven video grid with search filter
│   │   ├── PlayerControls.js    # Seek, volume, repeat, speed, prev/next controls
│   │   └── VideoInfoRow.js      # Title, artist, queue and share actions
│   ├── queue/
│   │   ├── QueuedVideoList.js   # Sidebar queue with drag-and-drop (mouse + touch)
│   │   └── QueuedVideo.js       # Individual queue item with drag handle
│   ├── miniplayer/
│   │   └── index.js             # Fixed bottom player bar
│   ├── Header.js                # App bar with add-video input and theme toggle
│   ├── AboutDialog.js           # About modal
│   └── MarqueeText.js           # Scrolling text for long titles
├── store/
│   ├── VideoContext.js          # Global playback state initial values
│   ├── ThemeContext.js          # Theme mode context
│   └── reducer.js               # Playback state reducer
├── graphql/
│   ├── client.js                # Apollo client + local queue resolver
│   ├── mutations.js
│   ├── queries.js
│   └── subscriptions.js
├── helpers/
│   └── formatDuration.js        # mm:ss formatter
├── theme.js                     # MUI theme (dark / light)
└── App.js                       # Root — layout, keyboard shortcuts, search state, FAB
```

## Notes

- The Hasura GraphQL endpoint is public — do not store sensitive data.
- The shared video list is visible and editable by anyone with the app URL.
- The personal queue is stored in `localStorage` and persists across page refreshes.
