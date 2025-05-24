import randomString from "@/utils/randomString";

import { defineStore } from "pinia";

export const useNotificationStore = defineStore({
  id: "notifications",
  state: () => ({
    notifications: [],
  }),
  actions: {
    notify({ text, title, type = "info", timeout }) {
      if (!timeout) {
        switch (type) {
          case "info":
            timeout = 3000;
            break;
          case "error":
            timeout = 5000;
            break;
        }
      }
      const currentTimeStamp = Date.now();

      const notification = {
        id: randomString(6),
        type,
        title,
        text,
        timestamp: currentTimeStamp,
        timeout,
      };

      this.addNotification(notification);

      setTimeout(() => {
        this.removeNotification(notification.id);
      }, timeout);
    },

    addNotification(payload) {
      const notification = payload;

      this.notifications.push(notification);
    },

    removeNotification(payload) {
      const { notificationId } = payload;

      this.notifications = this.notifications.filter(
        (notification) => notification.id !== notificationId
      );
    },

    removeAllNotifications() {
      this.notifications = [];
    },
    reset() {
      this.$reset();
    },
  },
});
