// store.js

import { defineStore } from "pinia";

export const useConsumerStore = defineStore({
  id: "consumer",
  state: () => ({
    consumers: [],
  }),
  actions: {
    setRoomState(payload) {
      if (payload.state === "closed") {
        this.consumers = [];
      }
    },
    addConsumer(payload) {
      this.consumers.push(payload.consumer);
    },
    removeConsumer(payload) {
      const { consumerId } = payload;
      this.consumers = this.consumers.filter(
        (consumer) => consumer.id !== consumerId
      );
    },
    setConsumerPaused(payload) {
      const { consumerId, originator } = payload;
      const consumer = this.consumers.find(
        (consumer) => consumer.id === consumerId
      );
      if (originator === "local") {
        this.$patch(consumer, { locallyPaused: true });
      } else {
        this.$patch(consumer, { remotelyPaused: true });
      }
    },
    setConsumerResumed(payload) {
      const { consumerId, originator } = payload;
      const consumer = this.consumers.find(
        (consumer) => consumer.id === consumerId
      );
      if (originator === "local") {
        this.$patch(consumer, { locallyPaused: false });
      } else {
        this.$patch(consumer, { remotelyPaused: false });
      }
    },
    setConsumerCurrentLayers(payload) {
      const { consumerId, spatialLayer, temporalLayer } = payload;
      const consumer = this.consumers.find(
        (consumer) => consumer.id === consumerId
      );
      this.$patch(consumer, {
        currentSpatialLayer: spatialLayer,
        currentTemporalLayer: temporalLayer,
      });
    },
    setConsumerPreferredLayers(payload) {
      const { consumerId, spatialLayer, temporalLayer } = payload;
      const consumer = this.consumers.find(
        (consumer) => consumer.id === consumerId
      );
      this.$patch(consumer, {
        preferredSpatialLayer: spatialLayer,
        preferredTemporalLayer: temporalLayer,
      });
    },
    setConsumerPriority(payload) {
      const { consumerId, priority } = payload;
      const consumer = this.consumers.find(
        (consumer) => consumer.id === consumerId
      );
      this.$patch(consumer, { priority });
    },
    setConsumerTrack(payload) {
      const { consumerId, track } = payload;
      const consumer = this.consumers.find(
        (consumer) => consumer.id === consumerId
      );
      this.$patch(consumer, { track });
    },
    setConsumerScore(payload) {
      const { consumerId, score } = payload;
      const consumer = this.consumers.find(
        (consumer) => consumer.id === consumerId
      );
      this.$patch(consumer, { score });
    },
    reset() {
      this.$reset();
    },
  },
});
