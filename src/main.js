import { createApp } from "vue";

import App from "./App.vue";
import { store } from "./store";

import router from "./router";
import axios from "./tools/axios"; // 引入你的 Axios 实例

import ElementPlus from "element-plus";

import "element-plus/dist/index.css";

import "./index.css";

const app = createApp(App);
// 将 Axios 实例注册成 Vue 插件
app.config.globalProperties.$axios = axios;

app.use(ElementPlus);

app.use(store);
app.use(router);

app.mount("#app");
