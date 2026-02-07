import { create } from 'zustand';
import type { SavedArgument } from '@/lib/types';

const HISTORY_KEY = 'ace_attorney_history';

interface HistoryActions {
  saveArgument: (arg: Omit<SavedArgument, 'id' | 'createdAt' | 'starred' | 'is_public' | 'score'> & { score: number; is_public?: boolean }) => Promise<string>;
  toggleStar: (id: string) => void;
  deleteArgument: (id: string) => void;
  getArgument: (id: string) => SavedArgument | undefined;
  hydrate: () => Promise<void>;
  setUserId: (userId: string | null) => void;
}

interface HistoryState {
  arguments: SavedArgument[];
  userId: string | null;
}

export const useHistoryStore = create<HistoryState & HistoryActions>((set, get) => ({
  arguments: [],
  userId: null,

  setUserId: (userId) => set({ userId }),

  saveArgument: async (arg) => {
    const id = `arg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const saved: SavedArgument = {
      ...arg,
      id,
      createdAt: Date.now(),
      starred: false,
      is_public: arg.is_public ?? true,
    };
    set((state) => ({ arguments: [saved, ...state.arguments] }));
    setTimeout(() => persistLocal(get), 0);
    return id;
  },

  toggleStar: (id: string) => {
    set((state) => ({
      arguments: state.arguments.map((a) => (a.id === id ? { ...a, starred: !a.starred } : a)),
    }));
    persistLocal(get);
  },

  deleteArgument: (id: string) => {
    set((state) => ({ arguments: state.arguments.filter((a) => a.id !== id) }));
    persistLocal(get);
  },

  getArgument: (id: string) => get().arguments.find((a) => a.id === id),

  hydrate: async () => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) {
        const data = JSON.parse(raw) as SavedArgument[];
        const migrated = (Array.isArray(data) ? data : []).map((a) => ({
          ...a,
          score: a.score ?? 0,
          is_public: a.is_public ?? true,
        }));
        set({ arguments: migrated });
      }
    } catch { /* ignore */ }
  },
}));

function persistLocal(get: () => HistoryState) {
  try {
    const { arguments: args } = get();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(args));
  } catch { /* ignore */ }
}
