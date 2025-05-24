import { defineStore } from "pinia";

export const useDataConsumerStore = defineStore({
  id: "dataConsumer",
  state: () => ({
    dataConsumers: [],
  }),
  actions: {
    setRoomState(payload) {
      if (payload.state === "closed") {
        this.dataConsumers = [];
      }
    },

    addDataConsumer(payload) {
      const { dataConsumer } = payload;
      this.dataConsumers.push(dataConsumer);
    },

    removeDataConsumer(payload) {
      const { dataConsumerId } = payload;
      this.dataConsumers = this.dataConsumers.filter(
        (consumer) => consumer.id !== dataConsumerId
      );
    },
    reset() {
      this.$reset();
    },
  },
});
