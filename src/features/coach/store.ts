import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createId } from '@/lib/id';
import { persistStorage, STORAGE_KEYS } from '@/lib/storage';

import { streamCoachReply } from './client';
import { fallbackReply } from './fallback';
import type { CoachAction, CoachContext, CoachMessage } from './types';

interface CoachState {
  messages: CoachMessage[];
  busy: boolean;
  send: (
    text: string,
    ctx: CoachContext,
    onMeta?: (m: {
      latencyMs: number;
      streamed: boolean;
      fallback: boolean;
      error?: string;
    }) => void,
  ) => Promise<void>;
  clear: () => void;
}

const WELCOME: CoachMessage = {
  id: 'welcome',
  role: 'assistant',
  at: 0,
  text: "Hi, I'm your coach. Tell me how you feel or how much time you have and I'll suggest what to do next. I'm not a medical professional; for pain, injury or health conditions please see one.",
  source: 'fallback',
};

export const useCoachStore = create<CoachState>()(
  persist(
    (set, get) => ({
      messages: [WELCOME],
      busy: false,
      send: async (text, ctx, onMeta) => {
        const trimmed = text.trim();
        if (!trimmed || get().busy) return;
        const user: CoachMessage = {
          id: createId('u'),
          role: 'user',
          text: trimmed,
          at: Date.now(),
        };
        const draft: CoachMessage = {
          id: createId('a'),
          role: 'assistant',
          text: '',
          at: Date.now(),
          streaming: true,
          source: 'model',
        };
        set((s) => ({ messages: [...s.messages, user, draft], busy: true }));
        const t0 = Date.now();

        const patch = (p: Partial<CoachMessage>) =>
          set((s) => ({
            messages: s.messages.map((m) => (m.id === draft.id ? { ...m, ...p } : m)),
          }));

        const history = get()
          .messages.filter((m) => m.id !== 'welcome' && m.id !== draft.id && !m.error)
          .slice(-20)
          .map((m) => ({ role: m.role, text: m.text }));

        let acc = '';
        let actions: CoachAction[] | undefined;
        let finished = false;

        const finish = (meta: { streamed: boolean; fallback: boolean; error?: string }) => {
          if (finished) return;
          finished = true;
          patch({
            text: acc,
            streaming: false,
            actions,
            source: meta.fallback ? 'fallback' : 'model',
          });
          set({ busy: false });
          onMeta?.({ latencyMs: Date.now() - t0, ...meta });
        };

        const applyFallback = (reason: string) => {
          const fb = fallbackReply(trimmed, ctx);
          acc = fb.text;
          actions = fb.actions;
          finish({ streamed: false, fallback: true, error: reason });
        };

        await streamCoachReply(history, ctx, {
          onToken: (t) => {
            acc += t;
            patch({ text: acc });
          },
          onActions: (a) => {
            actions = a;
          },
          onDone: ({ streamed }) => {
            if (!acc.trim()) applyFallback('EMPTY');
            else finish({ streamed, fallback: false });
          },
          onError: (err) => applyFallback(err.message),
        });
      },
      clear: () => set({ messages: [WELCOME], busy: false }),
    }),
    {
      name: STORAGE_KEYS.coach,
      storage: persistStorage,
      partialize: (s) => ({ messages: s.messages.filter((m) => !m.streaming).slice(-50) }),
    },
  ),
);
