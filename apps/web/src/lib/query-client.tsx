import { isServer, QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (error) => {
        console.log(error);
      },
    },
    queries: {
      enabled: !isServer,
    },
  },
});
