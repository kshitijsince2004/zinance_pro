
import React from 'react';
import { QueryClient as TanStackQueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new TanStackQueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface QueryClientProps {
  children: React.ReactNode;
}

export const QueryClient: React.FC<QueryClientProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
