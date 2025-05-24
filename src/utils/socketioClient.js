import io from "socket.io-client";

class SocketIOClient {
  constructor(url, roomId, peerId) {
    this.socket = io(url, {
      transports: ["websocket"],
      path: "/mediasoup",
      query: {
        roomId: roomId,
        peerId: peerId,
      },
      auth: {
        //   token: getAuthToken()
      },
      reconnection: true, // 启用重连
      reconnectionAttempts: 3, // 设置重连次数为3次
      reconnectionDelay: 1000, // 设置重连延迟为1秒
      reconnectionDelayMax: 5000, // 设置最大重连延迟为5秒
      timeout: 20000, // 设置连接超时时间为20秒
    });

    this.socket.on("connect", () => {
      console.log("Socket connected");
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    this.eventHandlers = {};
  }

  // 封装请求方法
  request(method, data) {
    return new Promise((resolve, reject) => {
      const message = {
        method: method,
        data: data,
      };
      this.socket.emit("request", message, (response) => {
        if (response.error) {
          reject(response.error);
        } else if (response.code !== 200) {
          reject(new Error(response.message));
        } else {
          resolve(response.data);
        }
      });
    });
  }

  // 封装事件监听方法
  on(event, handler) {
    if (this.eventHandlers[event]) {
      this.socket.off(event, this.eventHandlers[event]);
    }
    this.eventHandlers[event] = handler;
    this.socket.on(event, handler);
  }

  // 清除特定事件监听
  off(event) {
    if (this.eventHandlers[event]) {
      this.socket.off(event, this.eventHandlers[event]);
      delete this.eventHandlers[event];
    }
  }

  // 关闭socket连接
  close() {
    this.socket.disconnect();
  }
}

export default SocketIOClient;
