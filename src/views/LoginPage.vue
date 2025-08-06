<template>
  <div class="min-h-screen flex items-center justify-center gradient-bg">
    <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 class="text-3xl font-semibold text-center text-blue-700 mb-4">
        MediasoupRTC
      </h2>
      <!-- 环境选择区域 -->
      <div class="mb-4">
        <label class="text-sm text-gray-800 mr-4">选择环境</label>
        <el-radio-group v-model="formData.env" class="mb-2">
          <el-radio :label="'dev'">开发环境</el-radio>
          <el-radio :label="'test'">测试环境</el-radio>
          <el-radio :label="'prod'">正式环境</el-radio>
          <el-radio :label="'custom'">自定义</el-radio>
        </el-radio-group>
        <div v-if="formData.env === 'custom'" class="mt-2">
          <input
            type="text"
            v-model="formData.customEnv"
            placeholder="请输入自定义 wss 地址"
            class="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
      </div>
      <div class="mb-4">
        <label for="room-id" class="text-sm text-gray-800">房间号</label>
        <input
          id="room-id"
          type="text"
          v-model="formData.roomId"
          class="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring focus:ring-blue-500"
        />
      </div>
      <div class="mb-4">
        <label for="user-id" class="text-sm text-gray-800">用户名</label>
        <input
          id="user-id"
          type="text"
          v-model="formData.userId"
          class="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring focus:ring-blue-500"
        />
      </div>
      <div class="mb-4">
        <label class="text-sm text-gray-800 mr-4">是否推流</label>
        <el-radio-group v-model="formData.produce" class="mb-2">
          <el-radio :label="false" class="mr-4">否</el-radio>
          <el-radio :label="true">是</el-radio>
        </el-radio-group>
      </div>
      <button
        class="w-full py-2 transition-transform transform bg-blue-700 hover:scale-105 hover:bg-blue-700 hover:shadow-md rounded-lg text-white font-semibold border border-blue-600"
        id="login_button"
        @click="login"
      >
        进入房间
      </button>
    </div>
  </div>
</template>

<script>
// ...existing code...
export default {
  // ...existing code...
  data() {
    return {
      formData: {
        roomId: "",
        userId: "",
        produce: false,
        env: "dev", // 默认开发环境
        customEnv: "",
      },
      loginData: {
        roomId: "",
        userId: "",
        produce: false,
        env: "",
        wss: "",
      },
    };
  },
  methods: {
    async login() {
      try {
        if (!this.formData.userId || !this.formData.roomId) {
          this.$message.error("请补充房间号或用户名！");
          return;
        }
        let wss = "";
        if (this.formData.env === "dev") {
          wss = "wss://192.168.4.9:4443";
        } else if (this.formData.env === "test") {
          wss = "wss://media-test.ikingtec.com:4443";
        } else if (this.formData.env === "prod") {
          wss = "wss://media.ikingtec.com:4443";
        } else if (this.formData.env === "custom") {
          if (!this.formData.customEnv) {
            this.$message.error("请输入自定义 wss 地址！");
            return;
          }
          wss = this.formData.customEnv;
        }
        this.loginData = {
          roomId: this.formData.roomId,
          userId: this.formData.userId,
          produce: this.formData.produce,
          env: this.formData.env,
          wss,
        };
        sessionStorage.setItem("loginData", JSON.stringify(this.loginData));
        this.$router.push({ name: "HomePage" });
      } catch (err) {
        this.$message.error("登录失败！");
      }
    },
    // ...existing code...
  },
  // ...existing code...
};
</script>
