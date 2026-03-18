# Video Share

A collaborative video playlist app built with **React 18**, **Apollo Client 3**, **GraphQL (Hasura)**, and **Material UI v5**.

Paste a YouTube, Vimeo, or SoundCloud URL to add songs to a shared playlist. The song list updates in real time for all connected users via a live WebSocket subscription.

## Features

- Add songs from YouTube, Vimeo, or SoundCloud by URL
- Real-time song list updates via GraphQL subscriptions (WebSocket)
- Play, pause, and skip between songs
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

### Adding Songs

Paste a supported URL into the header input and click the **+** button. A dialog will confirm the song details (title, artist, thumbnail) before adding it to the shared playlist.

### Queue (localStorage)

Each user has a personal queue stored in `localStorage`. The queue is loaded on startup so it survives page refreshes. Adding or removing a song from the queue is handled by a client-side Apollo mutation (`addOrRemoveFromQueue`) that reads and writes directly to the Apollo cache, then syncs to `localStorage` via the `onCompleted` callback.

### Real-Time Sync

The app connects to Hasura over a WebSocket using `GraphQLWsLink` from `@apollo/client/link/subscriptions`. Any song added by any user appears instantly in all open sessions.

## Project Structure

```
src/
  components/
    AddSong.js          # URL input in the header
    AddSongDialog.js    # Confirmation dialog before adding
    Header.js           # Top bar with app title and AddSong
    Song.js             # Single song card in the shared list
    SongList.js         # Scrollable list of all songs
    SongPlayer.js       # Audio/video player with queue controls
    QueuedSongList.js   # Sidebar list of queued songs
    AboutDialog.js      # Info dialog about the app
  graphql/
    client.js           # Apollo Client setup, local resolvers, queue init
    queries.js          # GraphQL queries
    mutations.js        # GraphQL mutations
    subscriptions.js    # GraphQL subscriptions
  App.js
  reducer.js            # Song player state (current song, playing flag)
  theme.js              # MUI theme customization
```

## Notes

- The Hasura GraphQL endpoint is public and unauthenticated — do not store sensitive data.
- The shared song list is visible and editable by anyone with the app URL.
