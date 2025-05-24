<template>
  <div>
    <!-- <h1>WebRTC 设备检测引导页</h1> -->
    <!-- Add your DeviceCheck component here -->
    <DeviceCheck />
  </div>
</template>

<script>
import DeviceCheck from "@/components/DeviceCheck.vue"; // Import your DeviceCheck component

export default {
  components: {
    DeviceCheck, // Register the DeviceCheck component
  },
};
</script>
