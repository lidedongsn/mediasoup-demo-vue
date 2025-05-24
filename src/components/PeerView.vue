<template>
  <div class="nickname">
    <template v-if="stream.peerId === me.id"
      >{{ stream.peerId }}（我）</template
    >
    <template v-else>{{ stream.peerId }}</template>
  </div>
  <div
    class="shadow-lg rounded-xl transform hover:shadow-xl transition-shadow"
    style="width: 100%; height: 100%; background-color: black; overflow: hidden"
  >
    <video
      ref="videoElem"
      style="width: 100%; height: 100%"
      muted
      playsinline
      webkit-playsinline
      x5-playsinline
      autoplay
    ></video>
  </div>

  <div class="absolute top-2 left-4">
    <el-popover
      placement="right"
      title="详细信息"
      :width="200"
      trigger="click"
      @hide="clearInterval"
    >
      <template #reference>
        <button
          class="w-8 h-8 transform transition-transform hover:scale-110"
          @click="showStreamInfo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1.5em"
            viewBox="0 0 512 512"
            style="filter: invert(90%)"
          >
            <path
              d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"
            />
          </svg>
        </button>
      </template>
      <div>
        <p class="text-sm text-gray-600 mb-2">
          用户名: {{ streamInfo.peerId }}
        </p>
        <p class="text-sm text-gray-600 mb-2">
          分辨率: {{ streamInfo.resolution }}
        </p>
        <p class="text-sm text-gray-600 mb-2">
          帧率: {{ streamInfo.frameRate }}
        </p>
        <p class="text-sm text-gray-600 mb-2">码率: {{ streamInfo.bitRate }}</p>
        <p class="text-sm text-gray-600 mb-2">
          RTT: {{ streamInfo.currentRoundTripTime }}
        </p>
        <p
          v-if="streamInfo.streamtype === 'producer'"
          class="text-sm text-gray-600 mb-2"
        >
          BWE: {{ streamInfo.availableOutgoingBitrate }}
        </p>
        <p
          v-if="streamInfo.streamtype === 'consumer'"
          class="text-sm text-gray-600 mb-2"
        >
          平均jitter延迟: {{ streamInfo.averageJitterBuffer }}
        </p>
        <div
          v-if="streamInfo.streamtype === 'producer'"
          class="my-2 flex items-center"
        >
          <div class="flex-1">
            <el-input
              v-model="targetBandwidth"
              placeholder="目标码率 (Kbps)"
              class="mb-2"
            />
          </div>
          <el-button type="primary" @click="setTargetBandwidth"
            >确定</el-button
          >
        </div>
        <div
          v-if="streamInfo.streamtype === 'consumer'"
          class="my-2 flex items-center"
        >
          <div class="flex-1">
            <el-input
              v-model="targetJitterBuffer"
              placeholder="目标缓存 (ms)"
              class="mb-2"
            />
          </div>
          <el-button type="primary" @click="setTargetJitterBuffer"
            >确定</el-button
          >
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script>
import { useMeStore } from "../store/me";

export default {
  props: {
    roomClient: {
      type: Object,
      required: true,
    },
    stream: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      streamInfo: {
        peerId: "",
        nickname: "",
        resolution: "0x0",
        frameRate: "0",
        bitRate: "0",
      },
      intervalId: null,
      lastReport: null,
      targetBandwidth: "",
      targetJitterBuffer: "",
    };
  },
  mounted() {
    this.setStreamToVideo();
  },
  computed: {
    me() {
      return useMeStore().getState;
    },
  },
  watch: {
    stream: {
      handler() {
        this.setStreamToVideo();
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    setStreamToVideo() {
      const videoElem = this.$refs.videoElem;
      if (this.stream.track.kind === "video" && videoElem) {
        videoElem.srcObject = new MediaStream([this.stream.track]);
      }
    },

    async showStreamInfo() {
      clearInterval(this.intervalId);
      // const text = "现在时间是："+new Date().toLocaleString();
      // this.roomClient.sendChatMessage(text)
      const stats = await (this.stream.type === "producer"
        ? this.roomClient.getVideoLocalStats()
        : this.roomClient.getConsumerLocalStats(this.stream.id));

      let streamInfo = {};
      stats.forEach((report) => {
        if (report.type === "candidate-pair") {
          streamInfo.currentRoundTripTime = `${
            report.currentRoundTripTime * 1000
          }ms`;
          if (this.stream.type === "producer") {
            streamInfo.availableOutgoingBitrate = `${
              report.availableOutgoingBitrate / 1000
            }Kbps`;
          }
        } else if (
          (report.type === "outbound-rtp" && report.kind === "video") ||
          (report.type === "inbound-rtp" && report.kind === "video")
        ) {
          if (!this.lastReport) {
            this.lastReport = report;
            return;
          }
          let bytesDelta = 0;
          if (this.stream.type === "producer") {
            bytesDelta = report.bytesSent - this.lastReport.bytesSent;
          } else if (this.stream.type === "consumer") {
            bytesDelta = report.bytesReceived - this.lastReport.bytesReceived;
          }
          const timeDelta =
            (report.timestamp - this.lastReport.timestamp) / 1000;
          const bitrate = ((8 * bytesDelta) / timeDelta / 1000).toFixed(2);
          const jitterBufferDelayDelta =
            report.jitterBufferDelay - this.lastReport.jitterBufferDelay;
          const jitterBufferEmittedCountDelta =
            report.jitterBufferEmittedCount -
            this.lastReport.jitterBufferEmittedCount;
          const averageJitterBuffer = (
            (jitterBufferDelayDelta / jitterBufferEmittedCountDelta) *
            1000
          ).toFixed(2);

          streamInfo = {
            peerId: this.stream.peerId,
            nickname: this.stream.peerId,
            streamtype: this.stream.type,
            resolution: `${report.frameWidth}x${report.frameHeight}`,
            frameRate: report.framesPerSecond,
            bitRate: `${bitrate}Kbps`,
            averageJitterBuffer: `${averageJitterBuffer} ms`,
            ssrc: report.ssrc,
            ...streamInfo,
          };
          this.lastReport = report;
        }
      });
      this.streamInfo = streamInfo;
      this.intervalId = setInterval(this.showStreamInfo, 1000);
    },
    clearInterval() {
      clearInterval(this.intervalId);
      this.intervalId = null;
    },
    setTargetBandwidth() {
      if (this.targetBandwidth) {
        this.roomClient.setProducerBandwidth(
          this.targetBandwidth
        );
      }
    },
    setTargetJitterBuffer() {
      if (this.targetJitterBuffer) {
        this.roomClient.setConsumerJitterBufferTarget(
          this.stream.id,
          this.targetJitterBuffer
        );
      }
    },
  },
};
</script>

<style scoped>
.stream-container {
  position: relative;
  padding: 5px;
  background-color: transparent;
}
.nickname {
  position: absolute;
  bottom: 15px;
  left: 15px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 2px 5px;
  border-radius: 4px;
  z-index: 99;
  max-width: 33.33%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
  color: white;
}
.el-button--primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}
</style>
