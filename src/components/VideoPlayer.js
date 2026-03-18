import { useContext, useState, useRef, useEffect, Suspense } from "react";
import { Typography, IconButton, Slider, Tooltip, Box } from "@mui/material";
import {
  SkipPrevious,
  SkipNext,
  PlayArrow,
  Pause,
  VideoLabel,
  RepeatOne,
} from "@mui/icons-material";
import ReactPlayer from "react-player";
import { useQuery } from "@apollo/client";

import { VideoContext } from "../App";
import { GET_QUEUED_VIDEOS } from "../graphql/queries";

export default function VideoPlayer() {
  const { data } = useQuery(GET_QUEUED_VIDEOS);
  const { state, dispatch } = useContext(VideoContext);
  const [volume, setVolume] = useState(1);
  const [repeatVideo, setRepeatVideo] = useState(false);
  const [played, setPlayed] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [isUserSeeking, setIsUserSeeking] = useState(false);
  const [positionInQueue, setPositionInQueue] = useState(0);
  const [toggleVideo, setToggleVideo] = useState(true);
  const reactPlayerRef = useRef();

  useEffect(() => {
    const videoIndex = data.queue.findIndex((video) => video.id === state.video.id);
    setPositionInQueue(videoIndex);
  }, [state.video.id, data.queue]);

  useEffect(() => {
    const nextVideo = data.queue[positionInQueue + 1];
    if (played >= 0.99 && nextVideo && repeatVideo === false) {
      setPlayed(0);
      dispatch({ type: "SET_VIDEO", payload: { video: nextVideo } });
    }
  }, [data.queue, played, dispatch, positionInQueue, repeatVideo]);

  const handleTogglePlay = () => {
    dispatch(state.isPlaying ? { type: "PAUSE_VIDEO" } : { type: "PLAY_VIDEO" });
  };

  const handleSliderProgressChange = (_, newValue) => {
    setPlayed(newValue);
  };

  const handleSeekMouseDown = () => {
    setIsUserSeeking(true);
  };

  const handleSeekCommitted = (_, newValue) => {
    setIsUserSeeking(false);
    reactPlayerRef.current.seekTo(newValue);
  };

  const formatDuration = (seconds) => {
    const result = state.video.duration / 60;
    if (result >= 60) {
      if (result >= 600)
        return new Date(seconds * 1000).toISOString().slice(11, 19);
      return new Date(seconds * 1000).toISOString().slice(12, 19);
    }
    return new Date(seconds * 1000).toISOString().slice(14, 19);
  };

  const handlePlayPrevVideo = () => {
    const prevVideo = data.queue[positionInQueue - 1];
    if (prevVideo) {
      dispatch({ type: "SET_VIDEO", payload: { video: prevVideo } });
    }
  };

  const handlePlayNextVideo = () => {
    const nextVideo = data.queue[positionInQueue + 1];
    if (nextVideo) {
      dispatch({ type: "SET_VIDEO", payload: { video: nextVideo } });
    }
  };

  const handleToggleVideo = () => {
    setToggleVideo(!toggleVideo);
  };

  const handleVolume = (_, newValue) => {
    setVolume(newValue);
  };

  const handleRepeatVideo = () => {
    setRepeatVideo(!repeatVideo);
  };

  return (
    state.video.title &&
    state.video.artist && (
      <div style={{ display: "flex" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div>
              <Tooltip title={state.video.title}>
                <Typography variant="body1" component="h3" color="primary">
                  <div
                    style={{
                      whiteSpace: "nowrap",
                      width: 100,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontWeight: 600,
                    }}
                  >
                    {state.video.title}
                  </div>
                </Typography>
              </Tooltip>
              <Tooltip title={state.video.artist}>
                <Typography variant="body1" component="h3">
                  <div
                    style={{
                      whiteSpace: "nowrap",
                      width: 100,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {state.video.artist}
                  </div>
                </Typography>
              </Tooltip>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div>
                <IconButton onClick={handlePlayPrevVideo}>
                  <SkipPrevious />
                </IconButton>
                <IconButton onClick={handleTogglePlay}>
                  {state.isPlaying ? <Pause /> : <PlayArrow />}
                </IconButton>
                <IconButton onClick={handlePlayNextVideo}>
                  <SkipNext />
                </IconButton>
              </div>
              <Tooltip title="Repeat video">
                <IconButton onClick={handleRepeatVideo}>
                  <RepeatOne color={repeatVideo ? "primary" : "inherit"} />
                </IconButton>
              </Tooltip>
              <Tooltip title={toggleVideo ? "Show Video" : "Close Video"}>
                <IconButton onClick={handleToggleVideo}>
                  <VideoLabel color={toggleVideo ? "inherit" : "primary"} />
                </IconButton>
              </Tooltip>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <Typography variant="caption" component="h6" style={{ marginRight: 10 }}>
              {formatDuration(playedSeconds)}
            </Typography>
            <Slider
              value={played}
              min={0}
              max={1}
              step={0.01}
              onChange={handleSliderProgressChange}
              onMouseDown={handleSeekMouseDown}
              onChangeCommitted={handleSeekCommitted}
            />
            <Typography variant="caption" component="h6" style={{ marginLeft: 10 }}>
              {formatDuration(state.video.duration)}
            </Typography>
          </div>

          {/* Backdrop when expanded */}
          {state.isVideoExpanded && (
            <Box
              onClick={() => dispatch({ type: "COLLAPSE_VIDEO" })}
              sx={{ position: "fixed", inset: 0, bgcolor: "rgba(0,0,0,0.85)", zIndex: 1300 }}
            />
          )}

          {/* Single ReactPlayer — repositions via CSS, never remounts */}
          <Box
            sx={state.isVideoExpanded ? {
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "80vw",
              height: "45vw",
              zIndex: 1301,
              pointerEvents: "auto",
            } : {
              position: "absolute",
              right: 50,
              marginTop: "40px",
              width: "20vw",
              height: "11.5vw",
              pointerEvents: "none",
              display: toggleVideo ? "none" : "block",
            }}
          >
            <Suspense fallback={null}>
              <ReactPlayer
                width="100%"
                height="100%"
                loop={repeatVideo}
                url={state.video.url}
                playing={state.isPlaying}
                volume={volume}
                controls={state.isVideoExpanded}
                onProgress={({ played, playedSeconds }) => {
                  if (!isUserSeeking) {
                    setPlayed(played);
                    setPlayedSeconds(playedSeconds);
                    dispatch({ type: "SET_PLAYED_SECONDS", payload: { playedSeconds } });
                  }
                }}
                ref={reactPlayerRef}
              />
            </Suspense>
          </Box>
        </div>
        <div style={{ height: 50, marginTop: 20 }}>
          <Slider
            orientation="vertical"
            value={volume}
            min={0}
            max={1}
            step={0.01}
            onChange={handleVolume}
          />
        </div>
      </div>
    )
  );
}
