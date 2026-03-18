<<<<<<< HEAD
import { gql } from "@apollo/client";
=======
import { gql } from "apollo-boost";
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994

export const GET_SONGS = gql`
  subscription getSongs {
    songs(order_by: { created_at: desc }) {
      artist
      duration
      id
      thumbnail
      title
      url
    }
  }
`;
