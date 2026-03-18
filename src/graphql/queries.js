import { gql } from "@apollo/client";

export const GET_QUEUED_VIDEOS = gql`
  query getQueuedVideos {
    queue @client {
      id
      duration
      thumbnail
      url
      artist
      title
    }
  }
`;
