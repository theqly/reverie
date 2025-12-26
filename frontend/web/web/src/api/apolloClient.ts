// const GRAPHQL_URL = 'http://localhost:4000/graphql';
const GRAPHQL_URL = '/api';   // TODO: убрать, когда 07-12-2025 frontend-main вольют в main, где будет фикс проблемы, для которой сейчас этот костыль

import {
  getAccessToken,
  isAccessTokenExpired,
} from '../auth/tokenStorage';

import {
  refreshAccessToken,
  redirectToLogin,
} from '../auth/authService';

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
  ApolloLink
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';

const httpLink = new HttpLink({
  uri: GRAPHQL_URL,

  credentials: 'include', // 'include' | 'same-origin' | 'omit'

  headers: {
    'Content-Type': 'application/json',
  },
});


const authLink = setContext(async (_, { headers }) => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    redirectToLogin();
    return { headers };
  }

  if (isAccessTokenExpired()) {
    try {
      await refreshAccessToken();
    } catch (error) {
      redirectToLogin();
      return { headers };
    }
  }

  const freshAccessToken = getAccessToken();

  return {
    headers: {
      ...headers,
      Authorization: `Bearer ${freshAccessToken}`,
    },
  };
});


const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Path: ${path}`,
        { locations, extensions }
      );

      if (extensions?.code === 'UNAUTHENTICATED') {
        console.log('Пользователь не авторизован');
        window.location.href = '/login';
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError.message}`);
    console.error('Детали:', networkError);
  }

  console.log('Operation:', operation.operationName);
  console.log('Variables:', operation.variables);
});

const loggingLink = new ApolloLink((operation, forward) => {
  console.log(`🚀 GraphQL Request: ${operation.operationName}`);
  console.log('Variables:', operation.variables);
  console.log('Query:', operation.query.loc?.source.body);

  const startTime = Date.now();

  return forward(operation).map((response) => {
    const elapsed = Date.now() - startTime;
    console.log(`✅ Response for ${operation.operationName} (${elapsed}ms):`, response);
    return response;
  });
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