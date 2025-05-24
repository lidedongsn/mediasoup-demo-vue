// store.js

import { defineStore } from "pinia";

export const useDataProducerStore = defineStore({
  id: "dataProducer",
  state: () => ({
    dataProducers: [],
  }),
  actions: {
    setRoomState(payload) {
      if (payload.state === "closed") {
        this.dataProducers = [];
      }
    },
    addDataProducer(payload) {
      const { dataProducer } = payload;
      this.dataProducers.push(dataProducer);
    },
    removeDataProducer(payload) {
      const { dataProducerId } = payload;
      this.dataProducers = this.dataProducers.filter(
        (dataProducer) => dataProducer.id !== dataProducerId
      );
    },
    reset() {
      this.$reset();
    },
  },
});
