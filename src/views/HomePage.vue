<template>
  <div class="flex h-screen gradient-bg">
    <!-- 主区域 - 视频窗口 -->
    <div class="flex-1 rounded-lg gradient-bg">
      <video-conference />
    </div>

    <!-- 右侧 - 聊天和在线用户列表 -->
    <div class="w-1/5 flex flex-col">
      <!-- 在这里添加聊天和在线用户列表组件 -->
      <el-tabs
        type="border-card"
        class="flex-1 rounded-lg text-black gradient-bg"
      >
        <el-tab-pane label="事件" class="flex-1 rounded-lg text-black">
          <Notifications />
        </el-tab-pane>
        <el-tab-pane label="成员列表" class="flex-1 rounded-lg text-black">
          <ul>
            <li
              v-for="peer in allPeers"
              :key="peer.id"
              class="flex items-center space-x-2 mb-2"
            >
              <el-avatar class="bg-blue-400 text-white">
                {{ peer.id }}
              </el-avatar>

              <img
                :src="defaultAvatar"
                alt="头像"
                class="w-6 h-6 rounded-full"
              />
              <!-- 添加头像 -->
              <span>
                {{ peer.id }}
                <!-- 如果当前遍历到的 peer 的 id 等于当前用户的 id，则在名字后面添加（"我"） -->
                <template v-if="peer.id === me.id"> (我) </template>
              </span>
            </li>
          </ul>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import defaultAvatar from "../assets/default-avatar.png";

import VideoConference from "@/components/VideoConference.vue"; // 根据你的项目路径进行调整
import Notifications from "@/components/Notifications.vue";
import { useMeStore } from "../store/me";
import { usePeerStore } from "@/store/peer"; // 导入你的 store，根据实际路径进行调整
export default {
  components: {
    Notifications,
    VideoConference,
  },

  setup() {
    return {
      defaultAvatar: defaultAvatar,
    };
  },
  computed: {
    me() {
      const meStore = useMeStore();
      return meStore.getState;
    },

    peers() {
      // 获取在线用户列表
      const peerStore = usePeerStore();
      return peerStore.getPeers;
    },
    allPeers() {
      const remotePeers = this.peers;
      const me = this.me;
      // 确保当前用户在列表中
      if (!remotePeers.some((peer) => peer.id === me.id)) {
        return [me, ...remotePeers];
      }

      return remotePeers;
    },
  },
};
</script>

<style scoped>
/* 在这里添加样式，根据需要自定义样式 */
</style>
