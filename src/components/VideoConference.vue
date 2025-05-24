<template>
  <div class="h-screen items-center relative">
    <div class="flex justify-center items-center gradient-bg">
      <MediasoupRTC
        class="justify-center items-center w-3/4 h-3/4 flex"
      ></MediasoupRTC>
    </div>

    <!-- 工具栏区域 -->
    <div
      class="absolute bottom-10 left-1/2 transform -translate-x-1/2 justify-center items-center space-x-8 z-10"
    >
      <!-- 设置 -->
      <el-tooltip content="设置" placement="bottom">
        <button
          class="w-8 h-8 transform transition-transform hover:scale-110"
          @click="showSettingsDialog = true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-full h-full"
            viewBox="0 0 640 512"
          >
            <path
              d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"
            />
          </svg>
        </button>
      </el-tooltip>

      <!-- 话筒 -->
      <!-- <el-tooltip :content="micIcon[currentMicState].content" placement="bottom">
        <button class="w-8 h-8 transform hover:scale-110" @click="muteMic">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-full h-full" viewBox="0 0 640 512">
            <path v-bind:d="micIcon[currentMicState].path" />
          </svg>
        </button>
      </el-tooltip> -->
      <!-- 摄像头 -->
      <el-tooltip
        :content="camIcon[currentCamState].content"
        placement="bottom"
      >
        <button
          class="w-8 h-8 transform transition-transform hover:scale-110"
          @click="muteCam"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-full h-full"
            viewBox="0 0 640 512"
          >
            <path v-bind:d="camIcon[currentCamState].path" />
          </svg>
        </button>
      </el-tooltip>

      <!-- 桌面共享 -->
      <!-- <el-tooltip :content="screenShareIcon[currentScreenShareState].content" placement="bottom">
        <button class="w-8 h-8 transform transition-transform hover:scale-110" @click="screenShare">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-full h-full"
            viewBox="0 0 640 512"
            :style="{ fill: screenShareIcon[currentScreenShareState].color }"
          >
            <path
              d="M64 0C28.7 0 0 28.7 0 64V352c0 35.3 28.7 64 64 64H240l-10.7 32H160c-17.7 0-32 14.3-32 32s14.3 32 32 32H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H346.7L336 416H512c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H64zM512 64V352H64V64H512z"
            />
          </svg>
        </button>
      </el-tooltip> -->
      <!-- 扬声器 -->
      <!-- <el-tooltip :content="speakerIcon[currentSpeakerState].content" placement="bottom">
        <button class="w-8 h-8 transform transition-transform hover:scale-110" @click="muteSpeaker">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-full h-full" viewBox="0 0 640 512">
            <path v-bind:d="speakerIcon[currentSpeakerState].path" />
          </svg>
        </button>
      </el-tooltip> -->

      <!-- call -->
      <el-tooltip
        :content="callIcon[currentPublishState].content"
        placement="bottom"
      >
        <button
          class="w-8 h-8 transform transition-transform hover:scale-110"
          @click="onCall"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-full h-full"
            viewBox="0 0 640 512"
          >
            <path v-bind:d="callIcon[currentPublishState].path" />
          </svg>
        </button>
      </el-tooltip>

      <!-- call -->
      <el-tooltip content="分享" placement="bottom">
        <button
          id="share-button"
          class="w-8 h-8 transform transition-transform hover:scale-110"
          @click="shareRoom"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-full h-full"
            viewBox="0 0 640 512"
          >
            <path
              d="M307 34.8c-11.5 5.1-19 16.6-19 29.2v64H176C78.8 128 0 206.8 0 304C0 417.3 81.5 467.9 100.2 478.1c2.5 1.4 5.3 1.9 8.1 1.9c10.9 0 19.7-8.9 19.7-19.7c0-7.5-4.3-14.4-9.8-19.5C108.8 431.9 96 414.4 96 384c0-53 43-96 96-96h96v64c0 12.6 7.4 24.1 19 29.2s25 3 34.4-5.4l160-144c6.7-6.1 10.6-14.7 10.6-23.8s-3.8-17.7-10.6-23.8l-160-144c-9.4-8.5-22.9-10.6-34.4-5.4z"
            />
          </svg>
        </button>
      </el-tooltip>
      <!-- 全屏按钮 -->
      <el-tooltip
        :content="fullIcon[currentFullState].content"
        placement="bottom"
      >
        <button
          class="m-4 w-8 h-8 transform transition-transform hover:scale-110"
          @click="toggleFullScreen"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-full h-full"
            viewBox="0 0 640 512"
          >
            <path v-bind:d="fullIcon[currentFullState].path" />
          </svg>
        </button>
      </el-tooltip>
      <el-tooltip content="退出" placement="bottom">
        <button
          id="exit-button"
          class="w-8 h-8 transform transition-transform hover:scale-110"
          @click="exitRoom"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-full h-full"
            viewBox="0 0 640 512"
          >
            <path
              d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"
            />
          </svg>
        </button>
      </el-tooltip>
    </div>
    <!-- 视频窗口区域 -->

    <el-dialog
      v-model="showSettingsDialog"
      title="设置"
      :visible="showSettingsDialog"
      :center="true"
      width="30%"
      @close="showSettingsDialog = false"
      class="rounded-lg bg-white p-4 shadow-md"
    >
      <div>
        <h2 class="text-lg font-semibold mb-2">视频输入设备</h2>
        <el-select
          v-model="selectedVideoInputDevice"
          placeholder="选择视频输入设备"
          @change="handleVideoInputDeviceChange"
          class="w-full mb-4"
        >
          <el-option
            v-for="device in videoInputDevices"
            :key="device.deviceId"
            :label="device.label"
            :value="device.deviceId"
          ></el-option>
        </el-select>
        <!-- <h2 class="text-lg font-semibold mb-2">音频输入设备</h2>
        <el-select
          v-model="selectedAudioInputDevice"
          placeholder="选择音频输入设备"
          @change="handleAudioInputDeviceChange"
          class="w-full mb-4"
        >
          <el-option
            v-for="device in devices.audioInputDevices"
            :key="device.deviceId"
            :label="device.label"
            :value="device.deviceId"
          ></el-option>
        </el-select>
        <h2 class="text-lg font-semibold mb-2">音频输出设备</h2>
        <el-select
          v-model="selectedAudioOutputDevice"
          placeholder="选择音频输出设备"
          @change="handleAudioOutputDeviceChange"
          class="w-full"
        >
          <el-option
            v-for="device in devices.audioOutputDevices"
            :key="device.deviceId"
            :label="device.label"
            :value="device.deviceId"
          ></el-option>
        </el-select> -->
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MediasoupRTC from "@/components/MediasoupRTCInstance.vue";
import ClipboardJS from "clipboard";
import { useMeStore } from "@/store/me";
import { computed } from "vue";

const meStore = useMeStore();
export default {
  components: {
    MediasoupRTC,
  },
  data() {
    return {
      videoInputDevices: computed(() => meStore.getVideoInputDevices),
      // selectedAudioInputDevice: sessionStorage.getItem('selectedAudioInputDevice')
      //   ? sessionStorage.getItem('selectedAudioInputDevice')
      //   : '',
      // selectedAudioOutputDevice: '',
      selectedVideoInputDevice: sessionStorage.getItem(
        "selectedVideoInputDevice"
      )
        ? sessionStorage.getItem("selectedVideoInputDevice")
        : "",
      showSettingsDialog: false, // 控制设置窗口的显示状态
      currentMicState: "unmute", // computed(() => store.currentMicState), // 默认为 "unmute"
      currentCamState: "unmute", // computed(() => store.currentCamState), // 默认为 "unmute"
      currentPublishState: "publish", // computed(() => store.currentPublishState), // 默认为 "publish"
      currentSpeakerState: "unmute", // computed(() => store.currentSpeakerState), // 默认为 "unmute"
      currentScreenShareState: "unshare", // computed(() => store.currentScreenShareState), // 默认为 "unshare"
      isFullScreen: false, // 新增全屏状态变量
      currentFullState: "maximize",
      micIcon: {
        mute: {
          content: "取消静音",
          path: "M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L472.1 344.7c15.2-26 23.9-56.3 23.9-88.7V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 21.2-5.1 41.1-14.2 58.7L416 300.8V96c0-53-43-96-96-96s-96 43-96 96v54.3L38.8 5.1zM344 430.4c20.4-2.8 39.7-9.1 57.3-18.2l-43.1-33.9C346.1 382 333.3 384 320 384c-70.7 0-128-57.3-128-128v-8.7L144.7 210c-.5 1.9-.7 3.9-.7 6v40c0 89.1 66.2 162.7 152 174.4V464H248c-13.3 0-24 10.7-24 24s10.7 24 24 24h72 72c13.3 0 24-10.7 24-24s-10.7-24-24-24H344V430.4z",
        },
        unmute: {
          content: "静音",
          path: "M192 0C139 0 96 43 96 96V256c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h72 72c13.3 0 24-10.7 24-24s-10.7-24-24-24H216V430.4c85.8-11.7 152-85.3 152-174.4V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128s-128-57.3-128-128V216z",
        },
      },
      camIcon: {
        unmute: {
          content: "关闭摄像头",
          path: "M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128zM559.1 99.8c10.4 5.6 16.9 16.4 16.9 28.2V384c0 11.8-6.5 22.6-16.9 28.2s-23 5-32.9-1.6l-96-64L416 337.1V320 192 174.9l14.2-9.5 96-64c9.8-6.5 22.4-7.2 32.9-1.6z",
        },
        mute: {
          content: "打开摄像头",
          path: "M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7l-86.4-67.7 13.8 9.2c9.8 6.5 22.4 7.2 32.9 1.6s16.9-16.4 16.9-28.2V128c0-11.8-6.5-22.6-16.9-28.2s-23-5-32.9 1.6l-96 64L448 174.9V192 320v5.8l-32-25.1V128c0-35.3-28.7-64-64-64H113.9L38.8 5.1zM407 416.7L32.3 121.5c-.2 2.1-.3 4.3-.3 6.5V384c0 35.3 28.7 64 64 64H352c23.4 0 43.9-12.6 55-31.3z",
        },
      },
      screenShareIcon: {
        share: {
          content: "取消共享",
          color: "#e71313",
        },
        unshare: {
          content: "共享桌面",
          color: "",
        },
      },
      speakerIcon: {
        mute: {
          content: "打开扬声器",
          path: "M301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM425 167l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z",
        },
        unmute: {
          content: "关闭扬声器",
          path: "M533.6 32.5C598.5 85.3 640 165.8 640 256s-41.5 170.8-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z",
        },
      },

      callIcon: {
        publish: {
          content: "下麦",
          path: "M228.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C76.1 30.2 64 46 64 64c0 107.4 37.8 206 100.8 283.1L9.2 469.1c-10.4 8.2-12.3 23.3-4.1 33.7s23.3 12.3 33.7 4.1l592-464c10.4-8.2 12.3-23.3 4.1-33.7s-23.3-12.3-33.7-4.1L253 278c-17.8-21.5-32.9-45.2-45-70.7L257.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96zm96.8 319l-91.3 72C310.7 476 407.1 512 512 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L368.7 368c-15-7.1-29.3-15.2-43-24.3z",
        },
        unpublish: {
          content: "上麦",
          path: "M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z",
        },
      },
      fullIcon: {
        maximize: {
          content: "全屏",
          path: "M200 32H56C42.7 32 32 42.7 32 56V200c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2l40-40 79 79-79 79L73 295c-6.9-6.9-17.2-8.9-26.2-5.2S32 302.3 32 312V456c0 13.3 10.7 24 24 24H200c9.7 0 18.5-5.8 22.2-14.8s1.7-19.3-5.2-26.2l-40-40 79-79 79 79-40 40c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H456c13.3 0 24-10.7 24-24V312c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2l-40 40-79-79 79-79 40 40c6.9 6.9 17.2 8.9 26.2 5.2s14.8-12.5 14.8-22.2V56c0-13.3-10.7-24-24-24H312c-9.7 0-18.5 5.8-22.2 14.8s-1.7 19.3 5.2 26.2l40 40-79 79-79-79 40-40c6.9-6.9 8.9-17.2 5.2-26.2S209.7 32 200 32z",
        },
        minimize: {
          content: "退出全屏",
          path: "M456 224H312c-13.3 0-24-10.7-24-24V56c0-9.7 5.8-18.5 14.8-22.2s19.3-1.7 26.2 5.2l40 40L442.3 5.7C446 2 450.9 0 456 0s10 2 13.7 5.7l36.7 36.7C510 46 512 50.9 512 56s-2 10-5.7 13.7L433 143l40 40c6.9 6.9 8.9 17.2 5.2 26.2s-12.5 14.8-22.2 14.8zm0 64c9.7 0 18.5 5.8 22.2 14.8s1.7 19.3-5.2 26.2l-40 40 73.4 73.4c3.6 3.6 5.7 8.5 5.7 13.7s-2 10-5.7 13.7l-36.7 36.7C466 510 461.1 512 456 512s-10-2-13.7-5.7L369 433l-40 40c-6.9 6.9-17.2 8.9-26.2 5.2s-14.8-12.5-14.8-22.2V312c0-13.3 10.7-24 24-24H456zm-256 0c13.3 0 24 10.7 24 24V456c0 9.7-5.8 18.5-14.8 22.2s-19.3 1.7-26.2-5.2l-40-40L69.7 506.3C66 510 61.1 512 56 512s-10-2-13.7-5.7L5.7 469.7C2 466 0 461.1 0 456s2-10 5.7-13.7L79 369 39 329c-6.9-6.9-8.9-17.2-5.2-26.2s12.5-14.8 22.2-14.8H200zM56 224c-9.7 0-18.5-5.8-22.2-14.8s-1.7-19.3 5.2-26.2l40-40L5.7 69.7C2 66 0 61.1 0 56s2-10 5.7-13.7L42.3 5.7C46 2 50.9 0 56 0s10 2 13.7 5.7L143 79l40-40c6.9-6.9 17.2-8.9 26.2-5.2s14.8 12.5 14.8 22.2V200c0 13.3-10.7 24-24 24H56z",
        },
      },

      loginData: JSON.parse(sessionStorage.getItem("loginData")),
    };
  },
  methods: {
    // async handleAudioInputDeviceChange() {
    //   // 处理音频输入设备选择变化的逻辑
    //   console.log('选择的音频输入设备：', this.selectedAudioInputDevice)

    // },
    // async handleAudioOutputDeviceChange() {
    //   // 处理音频输出设备选择变化的逻辑
    //   console.log('选择的音频输出设备：', this.selectedAudioOutputDevice)
    // },
    async handleVideoInputDeviceChange() {
      // 处理视频输入设备选择变化的逻辑
      console.log("选择的视频输入设备：", this.selectedVideoInputDevice);
      if (window.roomClient) {
        window.roomClient.changeVideoInputDevice(this.selectedVideoInputDevice);
      }
    },

    // async muteMic() {

    // },

    async muteCam() {},

    // async screenShare() {

    // },

    async muteSpeaker() {
      const documentElement = document.documentElement || document.body;
      // store.changeSpeakerState(documentElement.muted ? 'unmute' : 'mute')
      if (documentElement.muted) {
        documentElement.muted = false; // 取消静音
        console.log("Tab is unmuted");
      } else {
        documentElement.muted = true; // 静音
        console.log("Tab is muted");
      }
    },

    async onCall() {},

    shareRoom() {
      const roomId = sessionStorage.getItem("inavId"); // Replace with your roomId
      const shareUrl = `${window.location.origin}${
        import.meta.env.BASE_URL
      }?roomId=${roomId}`;
      // 初始化ClipboardJS实例，传递按钮元素和文本
      const clipboard = new ClipboardJS("#share-button", {
        text: () => shareUrl, // shareUrl是你的分享链接
      });
      console.log(this.devices);

      // 处理复制成功和失败的事件
      clipboard.once("success", (e) => {
        this.$message.success("链接已成功复制到剪贴板");
        e.clearSelection(); // 清除选中的文本
      });

      clipboard.on("error", (e) => {
        this.$message.error("复制到剪贴板失败");
      });
    },
    exitRoom() {
      this.$confirm("确认离开房间？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          sessionStorage.clear();
          this.$router.push("/");
        })
        .catch(() => {
          // 用户点击了取消，不执行任何操作
        });
    },

    // 全屏切换方法
    toggleFullScreen() {
      if (!document.fullscreenElement) {
        document.documentElement
          .requestFullscreen()
          .then(() => {
            this.isFullScreen = true; // 设置全屏状态为 true
          })
          .catch((e) => {
            console.error(
              `Error attempting to enable full-screen mode: ${e.message} (${e.name})`
            );
          });
      } else {
        document.exitFullscreen().then(() => {
          this.isFullScreen = false; // 设置全屏状态为 false
        });
      }
      if (this.isFullScreen) {
        this.currentFullState = "minimize";
      } else {
        this.currentFullState = "maximize";
      }
    },
    init() {
      // 监听全屏状态变化
      document.addEventListener("fullscreenchange", () => {
        this.isFullScreen = !!document.fullscreenElement;
        if (this.isFullScreen) {
          this.currentFullState = "minimize";
        } else {
          this.currentFullState = "maximize";
        }
      });
    },
  },

  created() {
    this.init();
  },
};
</script>

<style scoped>
/* 在这里添加样式，根据需要自定义样式 */
</style>
