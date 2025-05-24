<template>
  <div :class="containerClass">
    <div
      v-for="stream in streams"
      :key="stream.id"
      class="stream-container transition-shadow"
    >
      <PeerView
        :stream="stream"
        v-if="roomClient !== null"
        :roomClient="roomClient"
      ></PeerView>
    </div>
  </div>
</template>

<script>
import PeerView from "@/components/PeerView.vue";
export default {
  props: {
    roomClient: {
      type: Object,
    },
    streams: {
      type: Array,
      required: true,
    },
  },
  components: {
    PeerView,
  },
  computed: {
    containerClass() {
      const numStreams = this.streams.length;
      if (numStreams === 1) {
        return "w-full";
      } else if (numStreams === 2) {
        return "w-full grid grid-cols-2";
      } else if (numStreams === 3) {
        return "w-full h-full grid grid-cols-2 grid-rows-2";
      } else if (numStreams === 4) {
        return "w-full h-full grid grid-cols-2 grid-rows-2";
      } else if (numStreams >= 5 && numStreams <= 9) {
        return "w-full h-full grid grid-cols-3 grid-rows-3";
      } else {
        return "w-full h-full"; // Default class if the number of peers doesn't match any specified case
      }
    },
  },
  watch: {},
  methods: {
    streamClass(index) {
      console.log("this.streams.length:", this.streams.length);
      const numStreams = this.streams.length;
      if (numStreams === 1) {
        return "w-full h-full";
      } else if (numStreams === 2) {
        return "w-full h-full";
      } else if (numStreams >= 3) {
        return "col-span-1 row-span-1";
      }
    },
  },
};
</script>

<style scoped>
/* Add Tailwind CSS classes here if needed */
.stream-container {
  position: relative;
  padding: 5px;
  background-color: transparent; /* 设置背景色为透明 */
  /* 其他样式 */
}
</style>
