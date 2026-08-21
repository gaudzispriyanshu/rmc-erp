import { QueryClient, type DefaultOptions } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/errors";

const defaultOptions: DefaultOptions = {
  queries: {
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // never retry a request the server rejected on purpose
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  },
  mutations: {
    // creates are idempotency-key protected server-side, but a blind retry can
    // still confuse the UI — retry deliberately, per mutation.
    retry: 0,
  },
};

export function makeQueryClient() {
  return new QueryClient({ defaultOptions });
}
