import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlaygroundRequestsState {
  requestCount: number;
  maxRequests: number;
}

interface PlaygroundRequestsActions {
  incrementRequestCount: () => void;
  resetRequestCount: () => void;
  hasRemainingRequests: () => boolean;
  getRemainingRequests: () => number;
}

type PlaygroundRequestsStore = PlaygroundRequestsState &
  PlaygroundRequestsActions;

const initialPlaygroundRequestsState: PlaygroundRequestsState = {
  requestCount: 0,
  maxRequests: 5,
};

export const usePlaygroundRequestsStore = create<PlaygroundRequestsStore>()(
  persist(
    (set, get) => ({
      ...initialPlaygroundRequestsState,

      incrementRequestCount: () =>
        set((state) => ({ requestCount: state.requestCount + 1 })),

      resetRequestCount: () => set({ requestCount: 0 }),

      hasRemainingRequests: () => get().requestCount < get().maxRequests,

      getRemainingRequests: () =>
        Math.max(0, get().maxRequests - get().requestCount),
    }),
    {
      name: 'playground-requests-storage',
    },
  ),
);
