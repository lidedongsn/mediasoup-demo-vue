<template>
  <div class="notifications flex flex-col space-y-4">
    <transition-group name="notification-fade" tag="div">
      <div
        v-for="notification in formattedNotifications"
        :key="notification.id"
        class="notification p-4 rounded-md shadow-md my-4"
        :class="[
          notification.type === 'error' ? 'bg-red-800' : 'bg-gray-800',
          notification.title ? 'bg-green-800' : 'bg-gray-800',
          { 'has-title': notification.title },
        ]"
        @click="onClick(notification.id)"
      >
        <div class="flex items-center justify-between">
          <span class="font-semibold text-white">{{
            notification.formattedTimestamp
          }}</span>
          <span
            v-if="notification.title"
            class="bg-blue-500 text-white px-2 py-1 rounded-sm"
            >{{ notification.title }}</span
          >
        </div>
        <p class="text-white mt-2">
          <span class="message">{{ notification.text }}</span>
        </p>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { useNotificationStore } from "@/store/notifications";

export default {
  data() {
    return {
      store: useNotificationStore(),
    };
  },
  computed: {
    notifications() {
      return this.store.notifications;
    },
    formattedNotifications() {
      return this.notifications.map((notification) => {
        // Format timestamp to HH:mm:ss
        const date = new Date(notification.timestamp);
        const formattedTime = `${date
          .getHours()
          .toString()
          .padStart(2, "0")}:${date
          .getMinutes()
          .toString()
          .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
        if (!notification.title) {
          this.setupAutoRemove(notification.id, notification.timeout);
        }
        return { ...notification, formattedTimestamp: formattedTime };
      });
    },
  },
  methods: {
    removeNotification(notificationId) {
      this.store.removeNotification({ notificationId });
    },
    onClick(notificationId) {
      // Handle notification click
      console.log("Notification clicked:", notificationId);
      // this.removeNotification(notificationId)
    },
    setupAutoRemove(notificationId, timeout) {
      setTimeout(() => {
        this.removeNotification(notificationId);
        // console.log('Auto-removed notification:', notificationId)
      }, timeout || 3000); // 3000 milliseconds = 3 seconds
    },
  },
};
</script>

<style scoped>
.notifications {
  max-height: 800px; /* Set your desired maximum height here */
  overflow-y: auto; /* Enable vertical scrolling */
}
.notification-fade-enter-active,
.notification-fade-leave-active {
  transition: opacity 0.5s;
}
.notification-fade-enter,
.notification-fade-leave-to {
  opacity: 0;
}
</style>
