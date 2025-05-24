// store.js

import { defineStore } from "pinia";

export const useChatStore = defineStore("chatStore", {
  state: () => ({
    asrMessage: "",
    typingMessage: "",
  }),
  getters: {
    getAsrMessage: (state) => state.asrMessage,
    getTypingMessage: (state) => state.typingMessage,
  },
  actions: {
    setAsrMessage(newMessage) {
      this.asrMessage = newMessage;
    },
    setTypingMessage(newMessage) {
      this.typingMessage = newMessage;
    },
  },
});
