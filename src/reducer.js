const videoReducer = (state, action) => {
  switch (action.type) {
    case "PLAY_VIDEO": {
      return {
        ...state,
        isPlaying: true,
      };
    }
    case "PAUSE_VIDEO": {
      return {
        ...state,
        isPlaying: false,
      };
    }
    case "SET_VIDEO": {
      return {
        ...state,
        video: action.payload.video,
      };
    }
    case "SET_PLAYED_SECONDS": {
      return { ...state, playedSeconds: action.payload.playedSeconds };
    }
    case "EXPAND_VIDEO": {
      return { ...state, isVideoExpanded: true };
    }
    case "COLLAPSE_VIDEO": {
      return { ...state, isVideoExpanded: false };
    }
    default:
      return state;
  }
};

export default videoReducer;
