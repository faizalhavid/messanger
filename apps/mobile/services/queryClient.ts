import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

queryClient.setDefaultOptions({
    queries: {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        retry: 1, // Retry failed queries once
        staleTime: 1000 * 60 * 5, // 5 minutes
    },
    mutations: {
        retry: 1, // Retry failed mutations once
    },
    dehydrate: {
        shouldDehydrateQuery: (query) => {
            // Prevent dehydrate for queries that are not meant to be cached
            return query.state.data !== undefined && !query.state.isInvalidated;
        }
    },

});