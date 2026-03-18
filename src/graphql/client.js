import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { GET_QUEUED_VIDEOS } from "./queries";

const GRAPHQL_ENDPOINT = "wss://enormous-catfish-15.hasura.app/v1/graphql";

const cache = new InMemoryCache();

const client = new ApolloClient({
  link: new GraphQLWsLink(
    createClient({
      url: GRAPHQL_ENDPOINT,
      connectionParams: {
        headers: {
          "x-hasura-role": "public",
        },
      },
    })
  ),
  cache,
  typeDefs: gql`
    type Video {
      id: uuid!
      thumbnail: String!
      duration: Float!
      url: String!
      artist: String!
      title: String!
    }

    input VideoInput {
      id: uuid!
      thumbnail: String!
      duration: Float!
      url: String!
      artist: String!
      title: String!
    }

    type Query {
      queue: [Video]!
    }

    type Mutation {
      addOrRemoveFromQueue(input: VideoInput!): [Video]!
    }
  `,
  resolvers: {
    Mutation: {
      addOrRemoveFromQueue: (_, { input }, { cache }) => {
        const data = cache.readQuery({
          query: GET_QUEUED_VIDEOS,
        });
        if (data) {
          const { queue } = data;
          const isInQueue = queue.some((video) => video.id === input.id);
          const newQueue = isInQueue
            ? queue.filter((video) => video.id !== input.id)
            : [...queue, input];
          cache.writeQuery({
            query: GET_QUEUED_VIDEOS,
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

cache.writeQuery({
  query: GET_QUEUED_VIDEOS,
  data: { queue: hasQueue ? JSON.parse(itemInQueue) : [] },
});

export default client;
