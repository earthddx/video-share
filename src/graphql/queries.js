<<<<<<< HEAD
import { gql } from "@apollo/client";
=======
import { gql } from "apollo-boost";
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994

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
