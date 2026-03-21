import { createContext } from "react";

const _savedVideo = (() => {
  try {
    return JSON.parse(localStorage.getItem("currentVideo"));
  } catch {
    return null;
  }
})();
const _savedSeconds = Number(localStorage.getItem("playedSeconds")) || 0;

export const VideoContext = createContext({
  video: _savedVideo ?? {
    artist: "",
    title: "",
    duration: 0,
    id: "",
    thumbnail: "",
    url: "",
  },
  isPlaying: false,
  playedSeconds: _savedSeconds,
  isVideoExpanded: false,
  seekTo: null,
  volume: 1,
  playbackRate: 1,
});
