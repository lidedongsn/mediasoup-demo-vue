<template>
  <div class="bg-transparent">
    <PeerLayout
      :streams="streams"
      v-if="roomClientReady"
      :room-client="roomClient"
    ></PeerLayout>
  </div>
</template>

<script>
import PeerLayout from "@/components/PeerLayout.vue";

import RoomClient from "@/utils/RoomClient";
import deviceInfo from "@/utils/deviceInfo";
import Logger from "@/utils/Logger";
import domready from "domready";
import { useProducerStore } from "@/store/producer";
import { useConsumerStore } from "@/store/consumer";

const logger = new Logger("MediasoupRTCInstance");

export default {
  name: "MediasoupRTC",
  components: {
    PeerLayout,
  },
  data() {
    return {
      roomClient: null,
      roomClientReady: false,
    };
  },

  methods: {
    initializeRoomClient() {
      try {
        const loginData = JSON.parse(sessionStorage.getItem("loginData"));

        const { roomId, userId, produce, wss } = loginData;
        const peerId = userId;
        const displayName = userId;
        const handlerName = undefined;
        const forceTcp = false;
        const consume = true;
        const datachannel = true;
        const forceVP8 = false;
        const forceH264 = false;
        const forceVP9 = false;
        const enableWebcamLayers = false;
        const enableSharingLayers = false;
        const webcamScalabilityMode = undefined;
        const sharingScalabilityMode = undefined;
        const numSimulcastStreams = 0;
        const externalVideo = false;
        const device = deviceInfo();

        const roomClient = new RoomClient({
          wss,
          roomId,
          peerId,
          displayName,
          handlerName: handlerName,
          device,
          forceTcp,
          produce,
          consume,
          datachannel,
          forceVP8,
          forceH264,
          forceVP9,
          enableWebcamLayers,
          enableSharingLayers,
          webcamScalabilityMode,
          sharingScalabilityMode,
          numSimulcastStreams,
          externalVideo,
        });
        roomClient.join();
        this.roomClient = roomClient;
        this.roomClientReady = true;
        window.roomClient = roomClient;
      } catch (e) {
        console.error(e);
      }
    },
    handleBeforeUnload() {
      if (this.roomClient) {
        this.roomClient.close();
      }
    },
  },
  computed: {
    producers() {
      const producerStore = useProducerStore();
      return producerStore.producers;
    },
    consumers() {
      const consumerStore = useConsumerStore();
      return consumerStore.consumers;
    },
    streams() {
      const producerStore = useProducerStore();
      const consumerStore = useConsumerStore();
      return [
        ...producerStore.producers.map((producer) => ({
          ...producer,
          type: "producer",
        })),
        ...consumerStore.consumers.map((consumer) => ({
          ...consumer,
          type: "consumer",
        })),
      ];
    },
  },
  mounted() {
    domready(() => {
      logger.debug("DOM ready");
      this.initializeRoomClient();
      window.addEventListener("beforeunload", this.handleBeforeUnload);
    });
  },
  beforeUnmount() {
    if (this.roomClient) {
      this.roomClient.close();
    }
    window.removeEventListener("beforeunload", this.handleBeforeUnload);
  },
};
</script>
