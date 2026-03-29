import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { ADD_OR_REMOVE_VIDEO_FROM_QUEUE } from "../graphql/mutations";

export function useQueueState(video, queue) {
  const [currVideoInQueue, setCurrVideoInQueue] = useState(false);
  const [positionInQueue, setPositionInQueue] = useState(0);

  useEffect(() => {
    setCurrVideoInQueue(queue.some((item) => item.id === video.id));
  }, [video.id, queue]);

  useEffect(() => {
    setPositionInQueue(queue.findIndex((s) => s.id === video.id));
  }, [video.id, queue]);

  const [addOrRemoveFromQueue] = useMutation(ADD_OR_REMOVE_VIDEO_FROM_QUEUE, {
    onCompleted: (data) => {
      localStorage.setItem("queue", JSON.stringify(data.addOrRemoveFromQueue));
    },
  });

  const handleAddToQueue = () => {
    addOrRemoveFromQueue({ variables: { input: { ...video, __typename: "Video" } } });
  };

  return { currVideoInQueue, positionInQueue, handleAddToQueue };
}
