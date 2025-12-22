const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || '/api';

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
  ApolloLink
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { getToken, login } from '../services/authService';

const httpLink = new HttpLink({
  uri: GRAPHQL_URL,

  credentials: 'include', // 'include' | 'same-origin' | 'omit'

  headers: {
    'Content-Type': 'application/json',
  },
});


// Добавляет токен авторизации к запросу
const authLink = setContext((_, { headers }) => {
  // Используем токен из Keycloak
  const token = getToken();

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, path, extensions }) => {
      if (import.meta.env.DEV) {
        console.error(`[GraphQL error]: ${message}, Path: ${path}`);
      }

      if (extensions?.code === 'UNAUTHENTICATED') {
        login();
      }
    });
  }

  if (networkError && import.meta.env.DEV) {
    console.error(`[Network error]: ${networkError.message}`);
  }
});

// Logging only in development
const loggingLink = new ApolloLink((operation, forward) => {
  if (import.meta.env.DEV) {
    console.log(`[GraphQL] ${operation.operationName}`);
  }
  return forward(operation);
});

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        pin: {
          read(existing, { args, toReference }) {
            return existing || toReference({
              __typename: 'Pin',
              id: args?.id,
            });
          },
        },
      },
    },
    Pin: {
      keyFields: ['id'],
    },
  },
});


export const apolloClient = new ApolloClient({
  link: from([
    errorLink,
    authLink,
    loggingLink,
    httpLink,
  ]),

  cache,

  // Дефолтные настройки для всех запросов
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },

  name: 'reverie-client',

  version: '1.0.0',

  connectToDevTools: true,
});