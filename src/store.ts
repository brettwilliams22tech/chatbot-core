import { atom, createStore, useAtomValue } from "jotai";

import { Message } from "./types";

export const botStore = createStore();

type BotState = {
  sessionId: string | null;
  connected: boolean;
  isChatOpen: boolean;
};

export const botAtom = atom({
  sessionId: null,
  connected: false,
  isChatOpen: false,
} as BotState);

export const messagesAtom = atom<Message[]>([]);

export const useMessages = () => {
  return useAtomValue(messagesAtom);
};

export const updateBotAtom = (state: Partial<BotState>) => {
  botStore.set(botAtom, (pState) => ({ ...pState, ...state }));
};
