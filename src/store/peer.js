import { defineStore } from "pinia";

export const usePeerStore = defineStore({
  id: "peer",
  state: () => ({
    peers: [],
  }),
  actions: {
    setRoomState(payload) {
      if (payload.state === "closed") {
        this.peers = [];
      }
    },
    addPeer(payload) {
      const { peer } = payload;
      this.peers.push(peer);
    },
    removePeer(payload) {
      const { peerId } = payload;
      this.peers = this.peers.filter((peer) => peer.id !== peerId);
    },
    setPeerDisplayName(payload) {
      const { displayName, peerId } = payload;
      const peer = this.peers.find((peer) => peer.id === peerId);
      if (!peer) {
        throw new Error("No Peer found");
      }
      peer.displayName = displayName;
    },
    addProducer(payload) {
      const { producer, peerId } = payload;
      const peer = this.peers.find((peer) => peer.id === peerId);
      if (!peer) {
        throw new Error("No Peer found for new Producer");
      }
      peer.producers.push(producer.id);
    },
    removeProducer(payload) {
      const { producerId, peerId } = payload;
      const peer = this.peers.find((peer) => peer.id === peerId);
      if (!peer) {
        return; // Peer was closed before, so it's ok.
      }
      peer.producers = peer.producers.filter(
        (producer) => producer !== producerId
      );
    },
    addConsumer(payload) {
      const { consumer, peerId } = payload;
      const peer = this.peers.find((peer) => peer.id === peerId);
      if (!peer) {
        throw new Error("No Peer found for new Consumer");
      }
      peer.consumers.push(consumer.id);
    },
    removeConsumer(payload) {
      const { consumerId, peerId } = payload;
      const peer = this.peers.find((peer) => peer.id === peerId);
      if (!peer) {
        return; // Peer was closed before, so it's ok.
      }
      peer.consumers = peer.consumers.filter(
        (consumer) => consumer !== consumerId
      );
    },
    addDataConsumer(payload) {
      const { dataConsumer, peerId } = payload;
      if (!peerId) {
        return; // special case for bot DataConsumer.
      }
      const peer = this.peers.find((peer) => peer.peerId === peerId);
      if (!peer) {
        throw new Error("No Peer found for new DataConsumer");
      }
      peer.dataConsumers.push(dataConsumer.id);
    },
    removeDataConsumer(payload) {
      const { dataConsumerId, peerId } = payload;
      if (!peerId) {
        return; // special case for bot DataConsumer.
      }
      const peer = this.peers.find((peer) => peer.peerId === peerId);
      if (!peer) {
        return; // Peer was closed before, so it's ok.
      }
      peer.dataConsumers = peer.dataConsumers.filter(
        (dataConsumer) => dataConsumer !== dataConsumerId
      );
    },
    reset() {
      this.$reset();
    },
  },
  getters: {
    getState: (state) => state,
    getPeers: (state) => state.peers,
  },
});
