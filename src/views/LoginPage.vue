<template>
  <div class="min-h-screen flex items-center justify-center gradient-bg">
    <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 class="text-3xl font-semibold text-center text-blue-700 mb-4">
        MediasoupRTC
      </h2>
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
// ... (import statements)
export default {
  components: {
    // ... (Element Plus components)
  },
  data() {
    return {
      formData: {
        roomId: "",
        userId: "",
        produce: false,
      },
      loginData: {
        roomId: "",
        userId: "",
        produce: false,
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
        this.loginData = {
          roomId: this.formData.roomId,
          userId: this.formData.userId,
          produce: this.formData.produce,
        };
        sessionStorage.setItem("loginData", JSON.stringify(this.loginData));
        this.$router.push({ name: "HomePage" });
      } catch (err) {
        this.$message.error("登录失败！");
      }
    },
    // ... (other methods)
  },
  created() {
    //判断loginData是否已经存在，存在则清空
    if (sessionStorage.getItem("loginData")) {
      sessionStorage.removeItem("loginData");
    }
  },
  // ...
};
</script>
