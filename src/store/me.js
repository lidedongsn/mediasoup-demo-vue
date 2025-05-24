import { defineStore } from "pinia";

export const useMeStore = defineStore({
  id: "me",
  state: () => ({
    id: "",
    displayName: "",
    displayNameSet: false, // true if got from cookie or manually set.
    device: { flag: "", name: "", version: "" },
    videoInputDevices: [],
    canSendMic: true,
    canSendWebcam: true,
    canChangeWebcam: false,
    webcamInProgress: false,
    shareInProgress: false,
    audioOnly: false,
    audioOnlyInProgress: false,
    audioMuted: false,
    restartIceInProgress: false,
  }),
  actions: {
    setRoomState(payload) {
      if (payload.state === "closed") {
        this.webcamInProgress = false;
        this.shareInProgress = false;
        this.audioOnly = false;
        this.audioOnlyInProgress = false;
        this.audioMuted = false;
        this.restartIceInProgress = false;
      }
    },

    setMe(payload) {
      const { id, displayName, displayNameSet, device } = payload;
      this.id = id;
      this.displayName = displayName;
      this.displayNameSet = displayNameSet;
      this.device = device;
    },

    setMediaCapabilities(payload) {
      const { canSendMic, canSendWebcam } = payload;

      this.canSendMic = canSendMic;
      this.canSendWebcam = canSendWebcam;
    },

    setVideoInputDevices(payload) {
      const { videoInputDevices } = payload;
      this.videoInputDevices = videoInputDevices;
    },

    setCanChangeWebcam(payload) {
      const { canChangeWebcam } = payload;

      this.canChangeWebcam = canChangeWebcam;
    },

    setWebcamInProgress(payload) {
      const { flag } = payload;

      this.webcamInProgress = flag;
    },

    setShareInProgress(payload) {
      const { flag } = payload;

      this.shareInProgress = flag;
    },

    setDisplayName(payload) {
      const { displayName } = payload;

      if (displayName) {
        this.displayName = displayName;
      }
    },

    setAudioOnlyState(payload) {
      const { enabled } = payload;

      this.audioOnly = enabled;
    },

    setAudioOnlyInProgress(payload) {
      const { flag } = payload;

      this.audioOnlyInProgress = flag;
    },

    setAudioMutedState(payload) {
      const { enabled } = payload;

      this.audioMuted = enabled;
    },

    setRestartIceInProgress(payload) {
      const { flag } = payload;

      this.restartIceInProgress = flag;
    },
    reset() {
      this.$reset();
    },
  },
  getters: {
    getState: (state) => state,
    getVideoInputDevices: (state) => state.videoInputDevices,
    getAudioOnly: (state) => state.audioOnly,
  },
});
