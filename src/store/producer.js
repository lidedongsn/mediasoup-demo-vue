// store.js

import { defineStore } from "pinia";

export const useProducerStore = defineStore({
  id: "producer",
  state: () => ({
    producers: [],
  }),
  actions: {
    setRoomState(payload) {
      if (payload.state === "closed") {
        this.producers = [];
      }
    },
    addProducer(payload) {
      const { producer } = payload;
      this.producers.push(producer);
    },
    removeProducer(payload) {
      const { producerId } = payload;
      this.producers = this.producers.filter(
        (producer) => producer.id !== producerId
      );
    },
    setProducerPaused(payload) {
      const { producerId } = payload;
      const producer = this.producers.find(
        (producer) => producer.id === producerId
      );
      producer.paused = true;
    },
    setProducerResumed(payload) {
      const { producerId } = payload;
      const producer = this.producers.find(
        (producer) => producer.id === producerId
      );
      producer.paused = false;
    },
    setProducerTrack(payload) {
      const { producerId, track } = payload;
      const producer = this.producers.find(
        (producer) => producer.id === producerId
      );
      producer.track = track;
    },
    setProducerScore(payload) {
      const { producerId, score } = payload;
      const producer = this.producers.find(
        (producer) => producer.id === producerId
      );
      producer.score = score;
    },
    reset() {
      this.$reset();
    },
  },
});
