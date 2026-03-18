import { gql } from "@apollo/client";

export const GET_QUEUED_SONGS = gql`
  query getQueuedSongs {
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
