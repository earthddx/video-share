const songReducer = (state, action) => {
  switch (action.type) {
    case "PLAY_SONG": {
      return {
        ...state,
        isPlaying: true,
      };
    }
    case "PAUSE_SONG": {
      return {
        ...state,
        isPlaying: false,
      };
    }
    case "SET_SONG": {
      return {
        ...state,
        song: action.payload.song,
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

export default songReducer;
