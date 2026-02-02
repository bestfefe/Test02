
import { ApolloClient, InMemoryCache } from '@apollo/client/core';

export const apolloClient = new ApolloClient({
    uri: '/api/graphql', // ⚠️ 这里稍后可以改成你的真实地址
    cache: new InMemoryCache(),
});
