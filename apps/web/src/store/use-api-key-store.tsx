import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ApiKeyState {
  selectedApiKey: string | null;
}

interface ApiKeyActions {
  setSelectedApiKey: (key: string | null) => void;
  reset: () => void;
}

type ApiKeyStore = ApiKeyState & ApiKeyActions;

const initialApiKeyState: ApiKeyState = {
  selectedApiKey: null,
};

export const useApiKeyStore = create<ApiKeyStore>()(
  persist(
    (set) => ({
      ...initialApiKeyState,

      setSelectedApiKey: (key: string | null) => set({ selectedApiKey: key }),

      reset: () => set(initialApiKeyState),
    }),
    {
      name: 'api-key-storage',
    },
  ),
);
