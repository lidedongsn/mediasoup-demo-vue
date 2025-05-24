import { defineStore } from "pinia";

export const usePubState = defineStore({
  id: "pubState",
  state: () => ({
    currentMicState: "unmute",
    currentCamState: "unmute",
    currentPublishState: "publish",
    currentSpeakerState: "unmute",
    currentScreenShareState: "unshare",
  }),
  actions: {
    // 示例：更改麦克风状态
    changeMicState(newState) {
      this.currentMicState = newState;
    },

    // 示例：更改摄像头状态
    changeCamState(newState) {
      this.currentCamState = newState;
    },

    // 示例：更改发布状态
    changePublishState(newState) {
      this.currentPublishState = newState;
    },

    // 示例：更改扬声器状态
    changeSpeakerState(newState) {
      this.currentSpeakerState = newState;
    },

    // 示例：更改屏幕共享状态
    changeScreenShareState(newState) {
      this.currentScreenShareState = newState;
    },
  },
});
