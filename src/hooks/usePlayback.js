import { useState, useEffect, useRef, useCallback } from "react";

export function usePlayback({ isCurrentVideo, state, dispatch, video, queue, positionInQueue, allVideos }) {
  const [played, setPlayed] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [isUserSeeking, setIsUserSeeking] = useState(false);
  const [repeatVideo, setRepeatVideo] = useState(false);

  const reactPlayerRef = useRef();
  const initialSecondsRef = useRef(isCurrentVideo ? state.playedSeconds : 0);
  const hasRestoredSeek = useRef(false);
  const lastDispatchedSecondsRef = useRef(0);
  const hasAdvancedRef = useRef(false);

  useEffect(() => { hasAdvancedRef.current = false; }, [video.id]);

  const handleVideoEnd = useCallback(() => {
    if (!isCurrentVideo || repeatVideo || hasAdvancedRef.current) return;
    hasAdvancedRef.current = true;
    const nextInQueue = positionInQueue >= 0 ? queue[positionInQueue + 1] : undefined;
    if (nextInQueue) {
      setPlayed(0);
      dispatch({ type: "SET_VIDEO", payload: { video: nextInQueue } });
      return;
    }
    if (allVideos?.length) {
      const posInList = allVideos.findIndex((v) => v.id === video.id);
      const nextInList = allVideos[posInList + 1] ?? allVideos[0];
      if (nextInList && nextInList.id !== video.id) {
        setPlayed(0);
        dispatch({ type: "SET_VIDEO", payload: { video: nextInList } });
      }
    }
  }, [isCurrentVideo, repeatVideo, queue, positionInQueue, allVideos, video.id, dispatch]);

  // Fallback for YouTube (which sometimes suppresses onEnded)
  useEffect(() => {
    if (played >= 0.99) handleVideoEnd();
  }, [played, handleVideoEnd]);

  // Lock orientation to landscape on mobile when expanded
  useEffect(() => {
    if (!isCurrentVideo) return;
    if (state.isVideoExpanded) {
      window.screen.orientation?.lock?.("landscape").catch(() => {});
    } else {
      window.screen.orientation?.unlock?.();
    }
    return () => window.screen.orientation?.unlock?.();
  }, [state.isVideoExpanded, isCurrentVideo]);

  // Seek triggered from mini player
  useEffect(() => {
    if (!isCurrentVideo || state.seekTo == null) return;
    reactPlayerRef.current?.seekTo(state.seekTo);
    setPlayed(state.seekTo);
    dispatch({ type: "SEEK_TO_DONE" });
  }, [state.seekTo, isCurrentVideo, dispatch]);

  return {
    played, setPlayed,
    playedSeconds, setPlayedSeconds,
    isUserSeeking, setIsUserSeeking,
    repeatVideo, setRepeatVideo,
    reactPlayerRef,
    initialSecondsRef,
    hasRestoredSeek,
    lastDispatchedSecondsRef,
    handleVideoEnd,
  };
}
