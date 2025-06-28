import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

queryClient.setDefaultOptions({
  queries: {
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    retry: 3, // Retry failed queries three times
    staleTime: 1000 * 60 * 2, // 2 minutes stale time
  },
  mutations: {
    retry: 3, // Retry failed mutations three times
  },
  dehydrate: {
    shouldDehydrateQuery: (query) => {
      // Prevent dehydrate for queries that are not meant to be cached
      return query.state.data !== undefined && !query.state.isInvalidated;
    },
  },
});
