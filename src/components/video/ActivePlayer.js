import { Box, IconButton, Tooltip } from "@mui/material";
import { Close } from "@mui/icons-material";
import ReactPlayer from "react-player";
import PlayerControls from "./PlayerControls";

const MODAL_CONTROLS_HEIGHT = 80;

export default function ActivePlayer({
  video,
  isVideoExpanded,
  repeatVideo,
  volume,
  playbackRate,
  reactPlayerRef,
  initialSecondsRef,
  hasRestoredSeek,
  showControls,
  onTogglePlay,
  onVideoEnd,
  onProgress,
  controlsProps,
  dispatch,
}) {
  return (
    <>
      {/* Fullscreen backdrop */}
      {isVideoExpanded && (
        <Box
          onClick={() => dispatch({ type: "COLLAPSE_VIDEO" })}
          sx={{ position: "fixed", inset: 0, bgcolor: "rgba(0,0,0,0.85)", zIndex: 1300 }}
        />
      )}

      <Box
        onClick={onTogglePlay}
        sx={
          isVideoExpanded
            ? {
                position: "fixed",
                top: { xs: 0, sm: "50%" },
                left: { xs: 0, sm: "50%" },
                transform: { xs: "none", sm: "translate(-50%, -50%)" },
                width: { xs: "100vw", sm: "80vw" },
                height: { xs: "100vh", sm: "45vw" },
                zIndex: 1301,
                bgcolor: "black",
              }
            : { width: "100%", height: "100%" }
        }
      >
        <ReactPlayer
          ref={reactPlayerRef}
          url={video.url}
          playing={controlsProps.isPlaying}
          volume={volume}
          playbackRate={playbackRate}
          loop={repeatVideo}
          playsinline
          width="100%"
          height={isVideoExpanded ? `calc(100% - ${MODAL_CONTROLS_HEIGHT}px)` : "100%"}
          style={{ pointerEvents: "none" }}
          config={{ youtube: { playerVars: { playsinline: 1 } } }}
          onReady={() => {
            if (!hasRestoredSeek.current && initialSecondsRef.current > 0) {
              reactPlayerRef.current?.seekTo(initialSecondsRef.current, "seconds");
              hasRestoredSeek.current = true;
            }
          }}
          onEnded={onVideoEnd}
          onProgress={onProgress}
        />

        {/* Modal close button */}
        {isVideoExpanded && (
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "flex-end",
              px: 1,
              pt: 1,
              zIndex: 1,
            }}
          >
            <Tooltip title="Close">
              <IconButton onClick={() => dispatch({ type: "COLLAPSE_VIDEO" })}>
                <Close sx={{ color: "white" }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* Modal controls */}
        {isVideoExpanded && (
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              px: 2,
              pb: 1,
              pt: 3,
              background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)",
            }}
          >
            <PlayerControls {...controlsProps} />
          </Box>
        )}
      </Box>

      {/* Inline controls overlay */}
      {!isVideoExpanded && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
            px: 1,
            pb: 0.5,
            pt: 4,
            opacity: showControls ? 1 : 0,
            transition: "opacity 0.2s",
          }}
        >
          <PlayerControls
            {...controlsProps}
            compact
            showExpand
            onExpand={() => dispatch({ type: "EXPAND_VIDEO" })}
          />
        </Box>
      )}
    </>
  );
}
