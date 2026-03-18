<<<<<<< HEAD
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
=======
import ApolloClient from "apollo-client";
import { WebSocketLink } from "apollo-link-ws";
import { InMemoryCache } from "apollo-cache-inmemory";
import { gql } from "apollo-boost";
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994
import { GET_QUEUED_SONGS } from "./queries";

const GRAPHQL_ENDPOINT = "wss://apollo-react-music.herokuapp.com/v1/graphql";

<<<<<<< HEAD
const cache = new InMemoryCache();

const client = new ApolloClient({
  link: new GraphQLWsLink(
    createClient({
      url: GRAPHQL_ENDPOINT,
    })
  ),
  cache,
=======
const client = new ApolloClient({
  link: new WebSocketLink({
    uri: GRAPHQL_ENDPOINT,
    options: {
      reconnect: true,
    },
  }),
  cache: new InMemoryCache(),
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994
  typeDefs: gql`
    type Song {
      id: uuid!
      thumbnail: String!
      duration: Float!
      url: String!
      artist: String!
      title: String!
    }

    input SongInput {
      id: uuid!
      thumbnail: String!
      duration: Float!
      url: String!
      artist: String!
      title: String!
    }

    type Query {
      queue: [Song]!
    }

    type Mutation {
      addOrRemoveFromQueue(input: SongInput!): [Song]!
    }
  `,
  resolvers: {
    Mutation: {
      addOrRemoveFromQueue: (_, { input }, { cache }) => {
        const data = cache.readQuery({
          query: GET_QUEUED_SONGS,
        });
        if (data) {
          const { queue } = data;
          const isInQueue = queue.some((song) => song.id === input.id);
          const newQueue = isInQueue
            ? queue.filter((song) => song.id !== input.id)
            : [...queue, input];
          cache.writeQuery({
            query: GET_QUEUED_SONGS,
            data: { queue: newQueue },
          });
          return newQueue;
        }
        return [];
      },
    },
  },
});

const itemInQueue = localStorage.getItem("queue");
const hasQueue = Boolean(itemInQueue);

<<<<<<< HEAD
cache.writeQuery({
  query: GET_QUEUED_SONGS,
  data: { queue: hasQueue ? JSON.parse(itemInQueue) : [] },
});
=======
const data = {
  queue: hasQueue ? JSON.parse(itemInQueue) : [],
};

client.writeData({ data });
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994

export default client;
