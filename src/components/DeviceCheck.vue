<template>
  <div>
    <div v-if="step === 1">
      <!-- 步骤1：视频采集设备检测 -->
      <el-button @click="startVideoCapture">开始视频采集检测</el-button>
      <!-- 显示视频采集画面 -->
      <video ref="videoElement" autoplay></video>
    </div>

    <div v-else-if="step === 2">
      <!-- 步骤2：音频采集设备检测 -->
      <el-button @click="startAudioCapture">开始音频采集检测</el-button>
      <!-- 显示音频采集音量图形 -->
      <canvas ref="audioCanvas"></canvas>
    </div>

    <div v-else-if="step === 3">
      <!-- 步骤3：音频输出设备检测 -->
      <el-button @click="startAudioOutput">开始音频输出检测</el-button>
      <!-- 播放音乐以测试音频输出 -->
      <audio ref="audioElement" controls></audio>
    </div>

    <!-- 下一步按钮 -->
    <el-button v-if="step < 3" @click="nextStep">下一步</el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      step: 1,
      videoStream: null,
      audioContext: null,
      audioStream: null,
      audioOutputDeviceId: null,
      audioOutputTestUrl: "your-audio-test-url.mp3",
    };
  },
  methods: {
    startVideoCapture() {
      // 步骤1：获取视频流
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          this.videoStream = stream;
          this.$refs.videoElement.srcObject = stream;
        })
        .catch((error) => {
          console.error("Error accessing video device: ", error);
        });
    },

    startAudioCapture() {
      // 步骤2：获取音频流
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          this.audioStream = stream;
          const audioContext = new AudioContext();
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.connect(audioContext.destination);
          source.connect(analyser);

          const canvas = this.$refs.audioCanvas;
          const canvasCtx = canvas.getContext("2d");
          const drawVisual = () => {
            analyser.getByteFrequencyData(dataArray);
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            const barWidth = (canvas.width / dataArray.length) * 2.5;
            let x = 0;
            dataArray.forEach((value) => {
              const barHeight = value;
              canvasCtx.fillStyle = `rgb(${barHeight + 100},50,50)`;
              canvasCtx.fillRect(
                x,
                canvas.height - barHeight / 2,
                barWidth,
                barHeight / 2
              );
              x += barWidth;
            });
            requestAnimationFrame(drawVisual);
          };
          drawVisual();
        })
        .catch((error) => {
          console.error("Error accessing audio device: ", error);
        });
    },

    startAudioOutput() {
      // 步骤3：获取音频输出设备列表
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const audioOutputDevices = devices.filter(
            (device) => device.kind === "audiooutput"
          );
          if (audioOutputDevices.length > 0) {
            this.audioOutputDeviceId = audioOutputDevices[0].deviceId;
            this.$refs.audioElement
              .setSinkId(this.audioOutputDeviceId)
              .then(() => {
                this.$refs.audioElement.src = this.audioOutputTestUrl;
                this.$refs.audioElement.play();
              })
              .catch((error) => {
                console.error("Error setting audio output device: ", error);
              });
          }
        })
        .catch((error) => {
          console.error("Error enumerating audio output devices: ", error);
        });
    },

    nextStep() {
      this.step++;
    },
  },
};
</script>

<style>
/* 使用Tailwind CSS样式美化组件 */
</style>
