import { defineStore } from "pinia";

export const useRoomStore = defineStore({
  id: "room",
  state: () => ({
    url: "",
    state: "", // new/connecting/connected/closed
    activeSpeakerId: "",
    statsPeerId: null,
    faceDetection: false,
    mediasoupClientHandler: "",
  }),
  actions: {
    setRoomUrl(payload) {
      this.url = payload.url;
    },

    setRoomState(payload) {
      const roomState = payload.state;

      if (roomState !== "connected") {
        this.state = roomState;
        this.activeSpeakerId = null;
        this.statsPeerId = null;
      } else {
        this.state = roomState;
      }
    },

    //SET_ROOM_MEDIASOUP_CLIENT_HANDLER
    setRoomMediasoupClientHandler(payload) {
      const { mediasoupClientHandler } = payload;

      this.mediasoupClientHandler = mediasoupClientHandler;
    },

    setRoomActiveSpeaker(payload) {
      const { peerId } = payload;

      this.activeSpeakerId = peerId;
    },

    setRoomStatsPeerId(payload) {
      const { peerId } = payload;

      if (this.statsPeerId === peerId) {
        this.statsPeerId = null;
      }

      this.statsPeerId = peerId;
    },

    setFaceDetection(payload) {
      const { flag } = payload;

      this.faceDetection = flag;
    },

    removePeer(payload) {
      const { peerId } = payload;

      if (peerId && peerId === this.activeSpeakerId) {
        this.activeSpeakerId = null;
      }

      if (peerId && peerId === this.statsPeerId) {
        this.statsPeerId = null;
      }
    },
    reset() {
      this.$reset();
    },
  },
});
