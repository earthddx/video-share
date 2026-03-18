# Video Share

A collaborative video playlist app built with **React 18**, **Apollo Client 3**, **GraphQL (Hasura)**, and **Material UI v5**.

Paste a YouTube, Vimeo, or SoundCloud URL to add videos to a shared playlist. The video list updates in real time for all connected users via a live WebSocket subscription.

## Features

- Add videos from YouTube, Vimeo, or SoundCloud by URL
- Real-time video list updates via GraphQL subscriptions (WebSocket)
- Play, pause, and skip between videos
- Personal queue saved to localStorage — persists across page refreshes

## Tech Stack

| Layer | Library |
|---|---|
| UI | React 18, Material UI v5 |
| GraphQL client | Apollo Client 3 |
| Subscriptions | `graphql-ws` over WebSocket |
| Backend | Hasura GraphQL Engine |
| Animations | react-useanimations |
| Player | react-player |

## Getting Started

```bash
npm install
npm start
```

The app runs at `http://localhost:3000`.

## How It Works

### Adding Videos

Paste a supported URL into the header input and click the **+** button. A dialog will confirm the video details (title, artist, thumbnail) before adding it to the shared playlist.

### Queue (localStorage)

Each user has a personal queue stored in `localStorage`. The queue is loaded on startup so it survives page refreshes. Adding or removing a video from the queue is handled by a client-side Apollo mutation (`addOrRemoveFromQueue`) that reads and writes directly to the Apollo cache, then syncs to `localStorage` via the `onCompleted` callback.

### Real-Time Sync

The app connects to Hasura over a WebSocket using `GraphQLWsLink` from `@apollo/client/link/subscriptions`. Any video added by any user appears instantly in all open sessions.

## Project Structure

```
src/
  components/
    AddVideo.js          # URL input in the header
    AddVideoDialog.js    # Confirmation dialog before adding
    Header.js           # Top bar with app title and Addvideo
    Video.js             # Single video card in the shared list
    VideoList.js         # Scrollable list of all videos
    VideoPlayer.js       # Audio/video player with queue controls
    QueuedVideoList.js   # Sidebar list of queued videos
    AboutDialog.js      # Info dialog about the app
  graphql/
    client.js           # Apollo Client setup, local resolvers, queue init
    queries.js          # GraphQL queries
    mutations.js        # GraphQL mutations
    subscriptions.js    # GraphQL subscriptions
  App.js
  reducer.js            # video player state (current video, playing flag)
  theme.js              # MUI theme customization
```

## Notes

- The Hasura GraphQL endpoint is public and unauthenticated — do not store sensitive data.
- The shared video list is visible and editable by anyone with the app URL.
