import protooClient from 'protoo-client';

import * as mediasoupClient from "mediasoup-client";
import Logger from "./Logger";
import { getProtooUrl } from "./urlFactory";
import * as cookiesManager from "./cookiesManager";

import { useRoomStore } from "@/store/room";
import { usePeerStore } from "@/store/peer";
import { useProducerStore } from "@/store/producer";
import { useConsumerStore } from "@/store/consumer";
import { useNotificationStore } from "@/store/notifications";
import { useDataProducerStore } from "@/store/dataProducer";
import { useDataConsumerStore } from "@/store/dataConsumer";
import { useMeStore } from "@/store/me";

const VIDEO_CONSTRAINS = {
  qvga: { width: { ideal: 320 }, height: { ideal: 180 } },
  vga: { width: { ideal: 640 }, height: { ideal: 360 } }, // frameRate: { ideal: 10, max: 15 } },
  hd: { width: { exact: 1280 }, height: { exact: 720 } },
};

const PC_PROPRIETARY_CONSTRAINTS = {
  // optional : [ { googDscp: true } ]
};

const EXTERNAL_VIDEO_SRC = "/resources/videos/video-audio-stereo.mp4";

const logger = new Logger("RoomClient");

// let store;
const roomStore = useRoomStore();
const peerStore = usePeerStore();
const producerStore = useProducerStore();
const consumerStore = useConsumerStore();
const notificationStore = useNotificationStore();
const dataProducerStore = useDataProducerStore();
const dataConsumerStore = useDataConsumerStore();
const meStore = useMeStore();
export default class RoomClient {
  // /**
  //  * @param  {Object} data
  //  * @param  {Object} data.store - The Redux store.
  //  */
  // static init(data)
  // {
  // 	store = data.store;
  // }

  constructor({
    roomId,
    peerId,
    displayName,
    device,
    handlerName,
    forceTcp,
    produce,
    consume,
    datachannel,
    enableWebcamLayers,
    enableSharingLayers,
    webcamScalabilityMode,
    sharingScalabilityMode,
    numSimulcastStreams,
    forceVP8,
    forceH264,
    forceVP9,
    externalVideo,
    e2eKey,
    consumerReplicas,
  }) {
    logger.debug("mediasoup-client version: %s", mediasoupClient.version);
    logger.debug(
      'constructor() [roomId:"%s", peerId:"%s", displayName:"%s", device:%s]',
      roomId,
      peerId,
      displayName,
      device.flag
    );

    // Closed flag.
    // @type {Boolean}
    this._closed = false;

    this._roomId = roomId;

    this._peerId = peerId;
    // Display name.
    // @type {String}
    this._displayName = displayName;

    // Device info.
    // @type {Object}
    this._device = device;

    // Custom mediasoup-client handler name (to override default browser
    // detection if desired).
    // @type {String}
    this._handlerName = handlerName;

    // Whether we want to force RTC over TCP.
    // @type {Boolean}
    this._forceTcp = forceTcp;

    // Whether we want to produce audio/video.
    // @type {Boolean}
    this._produce = produce;

    // Whether we should consume.
    // @type {Boolean}
    this._consume = consume;

    // Whether we want DataChannels.
    // @type {Boolean}
    this._useDataChannel = false; // Boolean(datachannel);

    // Force VP8 codec for sending.
    // @type {Boolean}
    this._forceVP8 = Boolean(forceVP8);

    // Force H264 codec for sending.
    // @type {Boolean}
    this._forceH264 = Boolean(forceH264);

    // Force VP9 codec for sending.
    // @type {Boolean}
    this._forceVP9 = Boolean(forceVP9);

    // Whether simulcast or SVC should be used for webcam.
    // @type {Boolean}
    this._enableWebcamLayers = Boolean(enableWebcamLayers);

    // Whether simulcast or SVC should be used in desktop sharing.
    // @type {Boolean}
    this._enableSharingLayers = Boolean(enableSharingLayers);

    // Scalability mode for webcam.
    // @type {String}
    this._webcamScalabilityMode = webcamScalabilityMode;

    // Scalability mode for sharing.
    // @type {String}
    this._sharingScalabilityMode = sharingScalabilityMode;

    // Number of simuclast streams for webcam and sharing.
    // @type {Number}
    this._numSimulcastStreams = numSimulcastStreams;

    // External video.
    // @type {HTMLVideoElement}
    this._externalVideo = null;

    // Enabled end-to-end encryption.
    this._e2eKey = e2eKey;

    // MediaStream of the external video.
    // @type {MediaStream}
    this._externalVideoStream = null;

    // Next expected dataChannel test number.
    // @type {Number}
    this._nextDataChannelTestNumber = 0;

    if (externalVideo) {
      this._externalVideo = document.createElement("video");

      this._externalVideo.controls = true;
      this._externalVideo.muted = true;
      this._externalVideo.loop = true;
      this._externalVideo.setAttribute("playsinline", "");
      this._externalVideo.src = EXTERNAL_VIDEO_SRC;

      this._externalVideo
        .play()
        .catch((error) => logger.warn("externalVideo.play() failed:%o", error));
    }

    // websocket URL.
    // @type {String}
    this._wsUrl = getProtooUrl({ roomId, peerId, consumerReplicas });

    // socket.io-client instance.
    // @type {}
    this._socket = null;

    // mediasoup-client Device instance.
    // @type {mediasoupClient.Device}
    this._mediasoupDevice = null;

    // mediasoup Transport for sending.
    // @type {mediasoupClient.Transport}
    this._sendTransport = null;

    // mediasoup Transport for receiving.
    // @type {mediasoupClient.Transport}
    this._recvTransport = null;

    // Local mic mediasoup Producer.
    // @type {mediasoupClient.Producer}
    this._micProducer = null;

    // Local webcam mediasoup Producer.
    // @type {mediasoupClient.Producer}
    this._webcamProducer = null;

    // Local share mediasoup Producer.
    // @type {mediasoupClient.Producer}
    this._shareProducer = null;

    // Local chat DataProducer.
    // @type {mediasoupClient.DataProducer}
    this._chatDataProducer = null;

    // Local bot DataProducer.
    // @type {mediasoupClient.DataProducer}
    this._botDataProducer = null;

    // mediasoup Consumers.
    // @type {Map<String, mediasoupClient.Consumer>}
    this._consumers = new Map();

    // mediasoup DataConsumers.
    // @type {Map<String, mediasoupClient.DataConsumer>}
    this._dataConsumers = new Map();

    // Map of webcam MediaDeviceInfos indexed by deviceId.
    // @type {Map<String, MediaDeviceInfos>}
    this._webcams = new Map();

    // Local Webcam.
    // @type {Object} with:
    // - {MediaDeviceInfo} [device]
    // - {String} [resolution] - 'qvga' / 'vga' / 'hd'.
    this._webcam = {
      device: null,
      resolution: "hd",
    };

    // if (this._e2eKey && e2e.isSupported())
    // {
    // 	e2e.setCryptoKey('setCryptoKey', this._e2eKey, true);
    // }
  }

  close() {
    if (this._closed) return;

    this._closed = true;

    logger.debug("close()");

    // Close socket.io Client
    this._socket.close();

    // Close mediasoup Transports.
    if (this._sendTransport) this._sendTransport.close();

    if (this._recvTransport) this._recvTransport.close();
    roomStore.reset();
    peerStore.reset();
    producerStore.reset();
    consumerStore.reset();
    notificationStore.reset();
    dataProducerStore.reset();
    dataConsumerStore.reset();
    meStore.reset();

    roomStore.setRoomState("closed");
  }

  async join() {
    const protooTransport = new protooClient.WebSocketTransport(
          this._wsUrl
        );
    
    this._socket =  new protooClient.Peer(protooTransport);

    roomStore.setRoomState("connecting");

    this._socket.on("open", () => {
      roomStore.setRoomState("connected");
      logger.debug("connected to mediasoup WebSocket server");
      this._joinRoom()
    });
    this._socket.on("reconnect", (attempt) => {
      roomStore.setRoomState("connecting");
      logger.warn(`reconnecting ${attempt} to SocketIO WebSocket server...`);
    });

    this._socket.on("failed", () => {
      notificationStore.notify({
        type: "error",
        text: "WebSocket connection failed",
      });
    });

    this._socket.on("disconnect", () => {
      notificationStore.notify({
        type: "error",
        text: "WebSocket disconnected",
      });

      // Close mediasoup Transports.
      if (this._sendTransport) {
        this._sendTransport.close();
        this._sendTransport = null;
      }

      if (this._recvTransport) {
        this._recvTransport.close();
        this._recvTransport = null;
      }

      roomStore.setRoomState("closed");
    });

    this._socket.on("close", () => {
      if (this._closed) return;

      this.close();
    });

    // eslint-disable-next-line no-unused-vars
    this._socket.on("request", async (request, accept, reject) => {
      logger.debug(
        'proto "request" event [method:%s, data:%o]',
        request.method,
        request.data
      );

      switch (request.method) {
        case "newConsumer": {
          if (!this._consume) {
            // reject(403, 'I do not want to consume')

            break;
          }

          const {
            peerId,
            producerId,
            id,
            kind,
            rtpParameters,
            type,
            appData,
            producerPaused,
          } = request.data;

          try {
            const consumer = await this._recvTransport.consume({
              id,
              producerId,
              kind,
              rtpParameters,
              // NOTE: Force streamId to be same in mic and webcam and different
              // in screen sharing so libwebrtc will just try to sync mic and
              // webcam streams from the same remote peer.
              streamId: `${peerId}-${appData.share ? "share" : "mic-webcam"}`,
              appData: { ...appData, peerId }, // Trick.
            });

            // Store in the map.
            this._consumers.set(consumer.id, consumer);

            consumer.on("transportclose", () => {
              this._consumers.delete(consumer.id);
            });

            const { spatialLayers, temporalLayers } =
              mediasoupClient.parseScalabilityMode(
                consumer.rtpParameters.encodings[0].scalabilityMode
              );

            peerStore.addConsumer({
              consumer: {
                id: consumer.id,
                displayName: consumer.displayName,
                type: type,
                locallyPaused: false,
                remotelyPaused: producerPaused,
                rtpParameters: consumer.rtpParameters,
                spatialLayers: spatialLayers,
                temporalLayers: temporalLayers,
                preferredSpatialLayer: spatialLayers - 1,
                preferredTemporalLayer: temporalLayers - 1,
                priority: 1,
                codec: consumer.rtpParameters.codecs[0].mimeType.split("/")[1],
                track: consumer.track,
              },
              peerId,
            });
            consumerStore.addConsumer({
              consumer: {
                id: consumer.id,
                displayName: consumer.displayName,
                type: type,
                peerId: peerId,
                locallyPaused: false,
                remotelyPaused: producerPaused,
                rtpParameters: consumer.rtpParameters,
                spatialLayers: spatialLayers,
                temporalLayers: temporalLayers,
                preferredSpatialLayer: spatialLayers - 1,
                preferredTemporalLayer: temporalLayers - 1,
                priority: 1,
                codec: consumer.rtpParameters.codecs[0].mimeType.split("/")[1],
                track: consumer.track,
              },
              peerId,
            });

            // We are ready. Answer the protoo request so the server will
						// resume this Consumer (which was paused for now if video).
						accept();

            // If audio-only mode is enabled, pause it.
            if (consumer.kind === "video" && meStore.getAudioOnly)
              this._pauseConsumer(consumer);
          } catch (error) {
            logger.error('"newConsumer" request failed:%o', error);

            notificationStore.notify({
              type: "error",
              text: `Error creating a Consumer: ${error}`,
            });

            throw error;
          }

          break;
        }

        case "newDataConsumer": {
          if (!this._consume) {
            reject(403, 'I do not want to data consume')

            break;
          }

          if (!this._useDataChannel) {
            reject(403, 'I do not want DataChannels')

            break;
          }

          const {
            peerId, // NOTE: Null if bot.
            dataProducerId,
            id,
            sctpStreamParameters,
            label,
            protocol,
            appData,
          } = request.data;

          try {
            const dataConsumer = await this._recvTransport.consumeData({
              id,
              dataProducerId,
              sctpStreamParameters,
              label,
              protocol,
              appData: { ...appData, peerId }, // Trick.
            });

            // Store in the map.
            this._dataConsumers.set(dataConsumer.id, dataConsumer);

            dataConsumer.on("transportclose", () => {
              this._dataConsumers.delete(dataConsumer.id);
            });

            dataConsumer.on("open", () => {
              logger.debug('DataConsumer "open" event');
            });

            dataConsumer.on("close", () => {
              logger.warn('DataConsumer "close" event');

              this._dataConsumers.delete(dataConsumer.id);

              notificationStore.notify({
                type: "error",
                text: "DataConsumer closed",
              });
            });

            dataConsumer.on("error", (error) => {
              logger.error('DataConsumer "error" event:%o', error);

              notificationStore.notify({
                type: "error",
                text: `DataConsumer error: ${error}`,
              });
            });

            dataConsumer.on("message", (message) => {
              logger.debug(
                'DataConsumer "message" event [streamId:%d]',
                dataConsumer.sctpStreamParameters.streamId
              );

              // TODO: For debugging.
              window.DC_MESSAGE = message;

              if (message instanceof ArrayBuffer) {
                const view = new DataView(message);
                const number = view.getUint32();

                if (number == Math.pow(2, 32) - 1) {
                  logger.warn("dataChannelTest finished!");

                  this._nextDataChannelTestNumber = 0;

                  return;
                }

                if (number > this._nextDataChannelTestNumber) {
                  logger.warn(
                    "dataChannelTest: %s packets missing",
                    number - this._nextDataChannelTestNumber
                  );
                }

                this._nextDataChannelTestNumber = number + 1;

                return;
              } else if (typeof message !== "string") {
                logger.warn('ignoring DataConsumer "message" (not a string)');

                return;
              }

              switch (dataConsumer.label) {
                case "chat": {
                  const { peers } = peerStore.getState;
                  const peersArray = Object.keys(peers).map(
                    (_peerId) => peers[_peerId]
                  );
                  const sendingPeer = peersArray.find((peer) =>
                    peer.dataConsumers.includes(dataConsumer.id)
                  );

                  if (!sendingPeer) {
                    logger.warn('DataConsumer "message" from unknown peer');

                    break;
                  }

                  notificationStore.notify({
                    title: `${sendingPeer.peerId} says:`,
                    text: message,
                    timeout: 5000,
                  });

                  break;
                }

                case "bot": {
                  notificationStore.notify({
                    title: "Message from Bot:",
                    text: message,
                    timeout: 5000,
                  });

                  break;
                }
              }
            });

            // TODO: REMOVE
            window.DC = dataConsumer;

            peerStore.addDataConsumer({
              dataConsumer: {
                id: dataConsumer.id,
                sctpStreamParameters: dataConsumer.sctpStreamParameters,
                label: dataConsumer.label,
                protocol: dataConsumer.protocol,
              },
              peerId,
            });
            // We are ready. Answer the protoo request.
						accept();
          } catch (error) {
            logger.error('"newDataConsumer" request failed:%o', error);

            notificationStore.notify({
              type: "error",
              text: `Error creating a DataConsumer: ${error}`,
            });

            throw error;
          }

          break;
        }
      }
    });

    this._socket.on("notification", (notification) => {
      if (notification.method !== "downlinkBwe") {
        logger.debug(
          'proto "notification" event [method:%s, data:%o]',
          notification.method,
          notification.data
        );
      }

      switch (notification.method) {
        case "producerScore": {
          const { producerId, score } = notification.data;

          producerStore.setProducerScore({ producerId, score });

          break;
        }

        case "newPeer": {
          const peer = notification.data;

          peerStore.addPeer({
            peer: { ...peer, consumers: [], dataConsumers: [] },
          });

          notificationStore.notify({
            text: `${peer.id} has joined the room`,
          });

          break;
        }

        case "peerClosed": {
          const { peerId } = notification.data;

          peerStore.removePeer({ peerId });
          notificationStore.notify({
            text: `${peerId} has leaved the room`,
          });
          break;
        }

        case "peerDisplayNameChanged": {
          const { peerId, displayName, oldDisplayName } = notification.data;

          peerStore.setPeerDisplayName(displayName, peerId);

          notificationStore.notify({
            text: `${oldDisplayName} is now ${displayName}`,
          });

          break;
        }

        case "downlinkBwe": {
          // logger.debug("'downlinkBwe' event:%o", notification.data)

          break;
        }

        case "consumerClosed": {
          const { consumerId } = notification.data;
          const consumer = this._consumers.get(consumerId);

          if (!consumer) break;

          consumer.close();
          this._consumers.delete(consumerId);

          const { peerId } = consumer.appData;

          peerStore.removeConsumer({
            consumerId,
            peerId,
          });

          consumerStore.removeConsumer({
            consumerId,
            peerId,
          });
          break;
        }

        case "consumerPaused": {
          const { consumerId } = notification.data;
          const consumer = this._consumers.get(consumerId);

          if (!consumer) break;

          consumer.pause();

          consumerStore.setConsumerPaused(consumerId, "remote");

          break;
        }

        case "consumerResumed": {
          const { consumerId } = notification.data;
          const consumer = this._consumers.get(consumerId);

          if (!consumer) break;

          consumer.resume();

          consumerStore.setConsumerResumed(consumerId, "remote");

          break;
        }

        case "consumerLayersChanged": {
          const { consumerId, spatialLayer, temporalLayer } = notification.data;
          const consumer = this._consumers.get(consumerId);

          if (!consumer) break;

          consumerStore.setConsumerCurrentLayers(
            consumerId,
            spatialLayer,
            temporalLayer
          );

          break;
        }

        case "consumerScore": {
          const { consumerId, score } = notification.data;

          consumerStore.setConsumerScore(consumerId, score);

          break;
        }

        case "dataConsumerClosed": {
          const { dataConsumerId } = notification.data;
          const dataConsumer = this._dataConsumers.get(dataConsumerId);

          if (!dataConsumer) break;

          dataConsumer.close();
          this._dataConsumers.delete(dataConsumerId);

          const { peerId } = dataConsumer.appData;

          peerStore.removeDataConsumer(dataConsumerId, peerId);

          break;
        }

        case "activeSpeaker": {
          const { peerId } = notification.data;

          roomStore.setRoomActiveSpeaker(peerId);

          break;
        }

        default: {
          logger.error(
            'unknown protoo notification.method "%s"',
            notification.method
          );
        }
      }
    });
  }

  async enableMic() {
    logger.debug("enableMic()");

    if (this._micProducer) return;

    if (!this._mediasoupDevice.canProduce("audio")) {
      logger.error("enableMic() | cannot produce audio");

      return;
    }

    let track;

    try {
      if (!this._externalVideo) {
        logger.debug("enableMic() | calling getUserMedia()");

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        track = stream.getAudioTracks()[0];
      } else {
        const stream = await this._getExternalVideoStream();

        track = stream.getAudioTracks()[0].clone();
      }

      this._micProducer = await this._sendTransport.produce({
        track,
        codecOptions: {
          opusStereo: true,
          opusDtx: true,
          opusFec: true,
          opusNack: true,
        },
        // NOTE: for testing codec selection.
        // codec : this._mediasoupDevice.rtpCapabilities.codecs
        // 	.find((codec) => codec.mimeType.toLowerCase() === 'audio/pcma')
      });

      // if (this._e2eKey && e2e.isSupported())
      // {
      // 	e2e.setupSenderTransform(this._micProducer.rtpSender);
      // }

      producerStore.addProducer({
        producer: {
          id: this._micProducer.id,
          peerId: this._peerId,
          displayName: this._displayName,
          paused: this._micProducer.paused,
          track: this._micProducer.track,
          rtpParameters: this._micProducer.rtpParameters,
          codec:
            this._micProducer.rtpParameters.codecs[0].mimeType.split("/")[1],
        },
      });

      this._micProducer.on("transportclose", () => {
        this._micProducer = null;
      });

      this._micProducer.on("trackended", () => {
        notificationStore.notify({
          type: "error",
          text: "Microphone disconnected!",
        });

        this.disableMic().catch(() => {});
      });
    } catch (error) {
      logger.error("enableMic() | failed:%o", error);

      notificationStore.notify({
        type: "error",
        text: `Error enabling microphone: ${error}`,
      });

      if (track) track.stop();
    }
  }

  async disableMic() {
    logger.debug("disableMic()");

    if (!this._micProducer) return;

    this._micProducer.close();

    producerStore.removeProducer(this._micProducer.id);

    try {
      await this._socket.request("closeProducer", {
        producerId: this._micProducer.id,
      });
    } catch (error) {
      notificationStore.notify({
        type: "error",
        text: `Error closing server-side mic Producer: ${error}`,
      });
    }

    this._micProducer = null;
  }

  async muteMic() {
    logger.debug("muteMic()");

    this._micProducer.pause();

    try {
      await this._socket.request("pauseProducer", {
        producerId: this._micProducer.id,
      });

      producerStore.setProducerPaused(this._micProducer.id);
    } catch (error) {
      logger.error("muteMic() | failed: %o", error);

      notificationStore.notify({
        type: "error",
        text: `Error pausing server-side mic Producer: ${error}`,
      });
    }
  }

  async unmuteMic() {
    logger.debug("unmuteMic()");

    this._micProducer.resume();

    try {
      await this._socket.request("resumeProducer", {
        producerId: this._micProducer.id,
      });

      producerStore.setProducerResumed(this._micProducer.id);
    } catch (error) {
      logger.error("unmuteMic() | failed: %o", error);

      notificationStore.notify({
        type: "error",
        text: `Error resuming server-side mic Producer: ${error}`,
      });
    }
  }

  async enableWebcam() {
    logger.debug("enableWebcam()");

    if (this._webcamProducer) return;
    else if (this._shareProducer) await this.disableShare();

    if (!this._mediasoupDevice.canProduce("video")) {
      logger.error("enableWebcam() | cannot produce video");

      return;
    }

    let track;
    let device;

    meStore.setWebcamInProgress(true);

    try {
      if (!this._externalVideo) {
        await this._updateWebcams();
        device = this._webcam.device;

        const { resolution } = this._webcam;

        if (!device) throw new Error("no webcam devices");

        logger.debug("enableWebcam() | calling getUserMedia()");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { ideal: device.deviceId },
            ...VIDEO_CONSTRAINS[resolution],
          },
        });

        track = stream.getVideoTracks()[0];
        // track.contentHint = "detail"; 
      } else {
        device = { label: "external video" };

        const stream = await this._getExternalVideoStream();

        track = stream.getVideoTracks()[0].clone();
      }

      let encodings = [
        {
            maxBitrate: 5000000,
            minBitrate: 1000000,
          maxFramerate: 30,
        },
      ];
      let codec;
      const codecOptions = {
        videoGoogleStartBitrate: 3000,
        videoGoogleMaxBitrate: 5000,
        videoGoogleMinBitrate: 800,
      };

      if (this._forceVP8) {
        codec = this._mediasoupDevice.rtpCapabilities.codecs.find(
          (c) => c.mimeType.toLowerCase() === "video/vp8"
        );

        if (!codec) {
          throw new Error("desired VP8 codec+configuration is not supported");
        }
      } else if (this._forceH264) {
        codec = this._mediasoupDevice.rtpCapabilities.codecs.find(
          (c) => c.mimeType.toLowerCase() === "video/h264"
        );

        if (!codec) {
          throw new Error("desired H264 codec+configuration is not supported");
        }
      } else if (this._forceVP9) {
        codec = this._mediasoupDevice.rtpCapabilities.codecs.find(
          (c) => c.mimeType.toLowerCase() === "video/vp9"
        );

        if (!codec) {
          throw new Error("desired VP9 codec+configuration is not supported");
        }
      }

      if (this._enableWebcamLayers) {
        // If VP9 is the only available video codec then use SVC.
        const firstVideoCodec =
          this._mediasoupDevice.rtpCapabilities.codecs.find(
            (c) => c.kind === "video"
          );

        // VP9 with SVC.
        if (
          (this._forceVP9 && codec) ||
          firstVideoCodec.mimeType.toLowerCase() === "video/vp9"
        ) {
          encodings = [
            {
              maxBitrate: 5000000,
              scalabilityMode: this._webcamScalabilityMode || "L3T3_KEY",
            },
          ];
        }
        // VP8 or H264 with simulcast.
        else {
          encodings = [
            {
              scaleResolutionDownBy: 1,
              maxBitrate: 5000000,
              scalabilityMode: this._webcamScalabilityMode || "L1T3",
            },
          ];

          if (this._numSimulcastStreams > 1) {
            encodings.unshift({
              scaleResolutionDownBy: 2,
              maxBitrate: 1000000,
              scalabilityMode: this._webcamScalabilityMode || "L1T3",
            });
          }

          if (this._numSimulcastStreams > 2) {
            encodings.unshift({
              scaleResolutionDownBy: 4,
              maxBitrate: 500000,
              scalabilityMode: this._webcamScalabilityMode || "L1T3",
            });
          }
        }
      }

      this._webcamProducer = await this._sendTransport.produce({
        track,
        encodings,
        codecOptions,
        codec,
      });

      // if (this._e2eKey && e2e.isSupported())
      // {
      // 	e2e.setupSenderTransform(this._webcamProducer.rtpSender);
      // }
      producerStore.addProducer({
        producer: {
          id: this._webcamProducer.id,
          peerId: this._peerId,
          displayName: this._displayName,
          deviceLabel: device.label,
          type: this._getWebcamType(device),
          paused: this._webcamProducer.paused,
          track: this._webcamProducer.track,
          rtpParameters: this._webcamProducer.rtpParameters,
          codec:
            this._webcamProducer.rtpParameters.codecs[0].mimeType.split("/")[1],
        },
      });

      this._webcamProducer.on("transportclose", () => {
        this._webcamProducer = null;
      });

      this._webcamProducer.on("trackended", () => {
        notificationStore.notify({
          type: "error",
          text: "Webcam disconnected!",
        });

        this.disableWebcam().catch(() => {});
      });
    } catch (error) {
      logger.error("enableWebcam() | failed:%o", error);

      notificationStore.notify({
        type: "error",
        text: `Error enabling webcam: ${error}`,
      });

      if (track) track.stop();
    }

    meStore.setWebcamInProgress(false);
  }

  async disableWebcam() {
    logger.debug("disableWebcam()");

    if (!this._webcamProducer) return;

    this._webcamProducer.close();

    producerStore.removeProducer(this._webcamProducer.id);

    try {
      await this._socket.request("closeProducer", {
        producerId: this._webcamProducer.id,
      });
    } catch (error) {
      notificationStore.notify({
        type: "error",
        text: `Error closing server-side webcam Producer: ${error}`,
      });
    }

    this._webcamProducer = null;
  }

  async changeVideoInputDevice(deviceId) {
    logger.debug("changeVideoInputDevice() [deviceId:%o]", deviceId);

    meStore.setWebcamInProgress(true);

    try {
      await this._updateWebcams();

      if (!this._webcams.has(deviceId)) throw new Error("unknown device");

      this._webcam.device = this._webcams.get(deviceId);
      logger.debug(
        "changeVideoInputDevice() | new selected webcam [device:%o]",
        this._webcam.device
      );

      // Reset video resolution to vga.
      this._webcam.resolution = "hd";

      if (!this._webcam.device) throw new Error("no webcam devices");

      // Closing the current video track before asking for a new one (mobiles do not like

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: this._webcam.device.deviceId },
          ...VIDEO_CONSTRAINS[this._webcam.resolution],
        },
      });

      const track = stream.getVideoTracks()[0];
      // track.contentHint = "detail"; 

      await this._webcamProducer.replaceTrack({ track });

      producerStore.setProducerTrack({
        producerId: this._webcamProducer.id,
        track,
      });
    } catch (error) {
      logger.error("changeVideoInputDevice() | failed: %o", error);

      notificationStore.notify({
        type: "error",
        text: `Could not change webcam: ${error}`,
      });
    }

    meStore.setWebcamInProgress(false);
  }

  async changeWebcam() {
    logger.debug("changeWebcam()");

    meStore.setWebcamInProgress(true);

    try {
      await this._updateWebcams();

      const array = Array.from(this._webcams.keys());
      const len = array.length;
      const deviceId = this._webcam.device
        ? this._webcam.device.deviceId
        : undefined;
      let idx = array.indexOf(deviceId);

      if (idx < len - 1) idx++;
      else idx = 0;

      this._webcam.device = this._webcams.get(array[idx]);

      logger.debug(
        "changeWebcam() | new selected webcam [device:%o]",
        this._webcam.device
      );

      // Reset video resolution to HD.
      this._webcam.resolution = "hd";

      if (!this._webcam.device) throw new Error("no webcam devices");

      // Closing the current video track before asking for a new one (mobiles do not like
      // having both front/back cameras open at the same time).
      this._webcamProducer.track.stop();

      logger.debug("changeWebcam() | calling getUserMedia()");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: this._webcam.device.deviceId },
          ...VIDEO_CONSTRAINS[this._webcam.resolution],
        },
      });

      const track = stream.getVideoTracks()[0];

      await this._webcamProducer.replaceTrack({ track });

      producerStore.setProducerTrack({
        producerId: this._webcamProducer.id,
        track,
      });
    } catch (error) {
      logger.error("changeWebcam() | failed: %o", error);

      notificationStore.notify({
        type: "error",
        text: `Could not change webcam: ${error}`,
      });
    }

    meStore.setWebcamInProgress(false);
  }

  async changeWebcamResolution() {
    logger.debug("changeWebcamResolution()");

    meStore.setWebcamInProgress(true);

    try {
      switch (this._webcam.resolution) {
        case "qvga":
          this._webcam.resolution = "vga";
          break;
        case "vga":
          this._webcam.resolution = "hd";
          break;
        case "hd":
          this._webcam.resolution = "qvga";
          break;
        default:
          this._webcam.resolution = "hd";
      }

      logger.debug("changeWebcamResolution() | calling getUserMedia()");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: this._webcam.device.deviceId },
          ...VIDEO_CONSTRAINS[this._webcam.resolution],
        },
      });

      const track = stream.getVideoTracks()[0];

      await this._webcamProducer.replaceTrack({ track });

      producerStore.setProducerTrack(this._webcamProducer.id, track);
    } catch (error) {
      logger.error("changeWebcamResolution() | failed: %o", error);

      notificationStore.notify({
        type: "error",
        text: `Could not change webcam resolution: ${error}`,
      });
    }

    meStore.setWebcamInProgress(false);
  }

  async enableShare() {
    logger.debug("enableShare()");

    if (this._shareProducer) return;
    else if (this._webcamProducer) await this.disableWebcam();

    if (!this._mediasoupDevice.canProduce("video")) {
      logger.error("enableShare() | cannot produce video");

      return;
    }

    let track;

    meStore.setShareInProgress(true);

    try {
      logger.debug("enableShare() | calling getUserMedia()");

      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: false,
        video: {
          displaySurface: "monitor",
          logicalSurface: true,
          cursor: true,
          width: { max: 1920 },
          height: { max: 1080 },
          frameRate: { max: 30 },
        },
      });

      // May mean cancelled (in some implementations).
      if (!stream) {
        meStore.setShareInProgress(true);

        return;
      }

      track = stream.getVideoTracks()[0];

      let encodings;
      let codec;
      const codecOptions = {
        videoGoogleStartBitrate: 1000,
      };

      if (this._forceVP8) {
        codec = this._mediasoupDevice.rtpCapabilities.codecs.find(
          (c) => c.mimeType.toLowerCase() === "video/vp8"
        );

        if (!codec) {
          throw new Error("desired VP8 codec+configuration is not supported");
        }
      } else if (this._forceH264) {
        codec = this._mediasoupDevice.rtpCapabilities.codecs.find(
          (c) => c.mimeType.toLowerCase() === "video/h264"
        );

        if (!codec) {
          throw new Error("desired H264 codec+configuration is not supported");
        }
      } else if (this._forceVP9) {
        codec = this._mediasoupDevice.rtpCapabilities.codecs.find(
          (c) => c.mimeType.toLowerCase() === "video/vp9"
        );

        if (!codec) {
          throw new Error("desired VP9 codec+configuration is not supported");
        }
      }

      if (this._enableSharingLayers) {
        // If VP9 is the only available video codec then use SVC.
        const firstVideoCodec =
          this._mediasoupDevice.rtpCapabilities.codecs.find(
            (c) => c.kind === "video"
          );

        // VP9 with SVC.
        if (
          (this._forceVP9 && codec) ||
          firstVideoCodec.mimeType.toLowerCase() === "video/vp9"
        ) {
          encodings = [
            {
              maxBitrate: 5000000,
              scalabilityMode: this._sharingScalabilityMode || "L3T3",
              dtx: true,
            },
          ];
        }
        // VP8 or H264 with simulcast.
        else {
          encodings = [
            {
              scaleResolutionDownBy: 1,
              maxBitrate: 5000000,
              scalabilityMode: this._sharingScalabilityMode || "L1T3",
              dtx: true,
            },
          ];

          if (this._numSimulcastStreams > 1) {
            encodings.unshift({
              scaleResolutionDownBy: 2,
              maxBitrate: 1000000,
              scalabilityMode: this._sharingScalabilityMode || "L1T3",
              dtx: true,
            });
          }

          if (this._numSimulcastStreams > 2) {
            encodings.unshift({
              scaleResolutionDownBy: 4,
              maxBitrate: 500000,
              scalabilityMode: this._sharingScalabilityMode || "L1T3",
              dtx: true,
            });
          }
        }
      }

      this._shareProducer = await this._sendTransport.produce({
        track,
        encodings,
        codecOptions,
        codec,
        appData: {
          share: true,
        },
      });

      // if (this._e2eKey && e2e.isSupported())
      // {
      // 	e2e.setupSenderTransform(this._shareProducer.rtpSender);
      // }

      producerStore.addProducer({
        producer: {
          id: this._shareProducer.id,
          peerId: this._peerId,
          displayName: this._displayName,
          type: "share",
          paused: this._shareProducer.paused,
          track: this._shareProducer.track,
          rtpParameters: this._shareProducer.rtpParameters,
          codec:
            this._shareProducer.rtpParameters.codecs[0].mimeType.split("/")[1],
        },
      });

      this._shareProducer.on("transportclose", () => {
        this._shareProducer = null;
      });

      this._shareProducer.on("trackended", () => {
        notificationStore.notify({
          type: "error",
          text: "Share disconnected!",
        });

        this.disableShare().catch(() => {});
      });
    } catch (error) {
      logger.error("enableShare() | failed:%o", error);

      if (error.name !== "NotAllowedError") {
        notificationStore.notify({
          type: "error",
          text: `Error sharing: ${error}`,
        });
      }

      if (track) track.stop();
    }

    meStore.setShareInProgress(false);
  }

  async disableShare() {
    logger.debug("disableShare()");

    if (!this._shareProducer) return;

    this._shareProducer.close();

    producerStore.removeProducer(this._shareProducer.id);

    try {
      await this._socket.request("closeProducer", {
        producerId: this._shareProducer.id,
      });
    } catch (error) {
      notificationStore.notify({
        type: "error",
        text: `Error closing server-side share Producer: ${error}`,
      });
    }

    this._shareProducer = null;
  }

  async enableAudioOnly() {
    logger.debug("enableAudioOnly()");

    meStore.setAudioOnlyInProgress(true);

    this.disableWebcam();

    for (const consumer of this._consumers.values()) {
      if (consumer.kind !== "video") continue;

      this._pauseConsumer(consumer);
    }

    meStore.setAudioOnlyState(true);

    meStore.setAudioOnlyInProgress(false);
  }

  async disableAudioOnly() {
    logger.debug("disableAudioOnly()");

    meStore.setAudioOnlyInProgress(true);

    if (
      !this._webcamProducer &&
      this._produce &&
      (cookiesManager.getDevices() || {}).webcamEnabled
    ) {
      this.enableWebcam();
    }

    for (const consumer of this._consumers.values()) {
      if (consumer.kind !== "video") continue;

      this._resumeConsumer(consumer);
    }

    meStore.setAudioOnlyState(false);

    meStore.setAudioOnlyInProgress(false);
  }

  async muteAudio() {
    logger.debug("muteAudio()");

    meStore.setAudioMutedState(true);
  }

  async unmuteAudio() {
    logger.debug("unmuteAudio()");

    meStore.setAudioMutedState(false);
  }

  async restartIce() {
    logger.debug("restartIce()");

    meStore.setRestartIceInProgress(true);

    try {
      if (this._sendTransport) {
        const iceParameters = await this._socket.request("restartIce", {
          transportId: this._sendTransport.id,
        });

        await this._sendTransport.restartIce({ iceParameters });
      }

      if (this._recvTransport) {
        const iceParameters = await this._socket.request("restartIce", {
          transportId: this._recvTransport.id,
        });

        await this._recvTransport.restartIce({ iceParameters });
      }

      notificationStore.notify({
        text: "ICE restarted",
      });
    } catch (error) {
      logger.error("restartIce() | failed:%o", error);

      notificationStore.notify({
        type: "error",
        text: `ICE restart failed: ${error}`,
      });
    }

    meStore.setRestartIceInProgress(false);
  }

  async setMaxSendingSpatialLayer(spatialLayer) {
    logger.debug("setMaxSendingSpatialLayer() [spatialLayer:%s]", spatialLayer);

    try {
      if (this._webcamProducer)
        await this._webcamProducer.setMaxSpatialLayer(spatialLayer);
      else if (this._shareProducer)
        await this._shareProducer.setMaxSpatialLayer(spatialLayer);
    } catch (error) {
      logger.error("setMaxSendingSpatialLayer() | failed:%o", error);

      notificationStore.notify({
        type: "error",
        text: `Error setting max sending video spatial layer: ${error}`,
      });
    }
  }

  async setConsumerPreferredLayers(consumerId, spatialLayer, temporalLayer) {
    logger.debug(
      "setConsumerPreferredLayers() [consumerId:%s, spatialLayer:%s, temporalLayer:%s]",
      consumerId,
      spatialLayer,
      temporalLayer
    );

    try {
      await this._socket.request("setConsumerPreferredLayers", {
        consumerId,
        spatialLayer,
        temporalLayer,
      });

      consumerStore.setConsumerPreferredLayers(
        consumerId,
        spatialLayer,
        temporalLayer
      );
    } catch (error) {
      logger.error("setConsumerPreferredLayers() | failed:%o", error);

      notificationStore.notify({
        type: "error",
        text: `Error setting Consumer preferred layers: ${error}`,
      });
    }
  }

  async setConsumerPriority(consumerId, priority) {
    logger.debug(
      "setConsumerPriority() [consumerId:%s, priority:%d]",
      consumerId,
      priority
    );

    try {
      await this._socket.request("setConsumerPriority", {
        consumerId,
        priority,
      });

      consumerStore.setConsumerPriority(consumerId, priority);
    } catch (error) {
      logger.error("setConsumerPriority() | failed:%o", error);

      notificationStore.notify({
        type: "error",
        text: `Error setting Consumer priority: ${error}`,
      });
    }
  }

  async requestConsumerKeyFrame(consumerId) {
    logger.debug("requestConsumerKeyFrame() [consumerId:%s]", consumerId);

    try {
      await this._socket.request("requestConsumerKeyFrame", { consumerId });

      notificationStore.notify({
        text: "Keyframe requested for video consumer",
      });
    } catch (error) {
      logger.error("requestConsumerKeyFrame() | failed:%o", error);

      notificationStore.notify({
        type: "error",
        text: `Error requesting key frame for Consumer: ${error}`,
      });
    }
  }

  async enableChatDataProducer() {
    logger.debug("enableChatDataProducer()");

    if (!this._useDataChannel) return;

    // NOTE: Should enable this code but it's useful for testing.
    // if (this._chatDataProducer)
    // 	return;

    try {
      // Create chat DataProducer.
      this._chatDataProducer = await this._sendTransport.produceData({
        ordered: false,
        maxRetransmits: 1,
        label: "chat",
        priority: "medium",
        appData: { info: "my-chat-DataProducer" },
      });

      dataProducerStore.addDataProducer({
        id: this._chatDataProducer.id,
        sctpStreamParameters: this._chatDataProducer.sctpStreamParameters,
        label: this._chatDataProducer.label,
        protocol: this._chatDataProducer.protocol,
      });

      this._chatDataProducer.on("transportclose", () => {
        this._chatDataProducer = null;
      });

      this._chatDataProducer.on("open", () => {
        logger.debug('chat DataProducer "open" event');
      });

      this._chatDataProducer.on("close", () => {
        logger.error('chat DataProducer "close" event');

        this._chatDataProducer = null;

        notificationStore.notify({
          type: "error",
          text: "Chat DataProducer closed",
        });
      });

      this._chatDataProducer.on("error", (error) => {
        logger.error('chat DataProducer "error" event:%o', error);

        notificationStore.notify({
          type: "error",
          text: `Chat DataProducer error: ${error}`,
        });
      });

      this._chatDataProducer.on("bufferedamountlow", () => {
        logger.debug('chat DataProducer "bufferedamountlow" event');
      });
    } catch (error) {
      logger.error("enableChatDataProducer() | failed:%o", error);

      notificationStore.notify({
        type: "error",
        text: `Error enabling chat DataProducer: ${error}`,
      });

      throw error;
    }
  }

  async enableBotDataProducer() {
    logger.debug("enableBotDataProducer()");

    if (!this._useDataChannel) return;

    // NOTE: Should enable this code but it's useful for testing.
    // if (this._botDataProducer)
    // 	return;

    try {
      // Create chat DataProducer.
      this._botDataProducer = await this._sendTransport.produceData({
        ordered: false,
        maxPacketLifeTime: 2000,
        label: "bot",
        priority: "medium",
        appData: { info: "my-bot-DataProducer" },
      });

      dataProducerStore.addDataProducer({
        id: this._botDataProducer.id,
        sctpStreamParameters: this._botDataProducer.sctpStreamParameters,
        label: this._botDataProducer.label,
        protocol: this._botDataProducer.protocol,
      });

      this._botDataProducer.on("transportclose", () => {
        this._botDataProducer = null;
      });

      this._botDataProducer.on("open", () => {
        logger.debug('bot DataProducer "open" event');
      });

      this._botDataProducer.on("close", () => {
        logger.error('bot DataProducer "close" event');

        this._botDataProducer = null;

        notificationStore.notify({
          type: "error",
          text: "Bot DataProducer closed",
        });
      });

      this._botDataProducer.on("error", (error) => {
        logger.error('bot DataProducer "error" event:%o', error);

        notificationStore.notify({
          type: "error",
          text: `Bot DataProducer error: ${error}`,
        });
      });

      this._botDataProducer.on("bufferedamountlow", () => {
        logger.debug('bot DataProducer "bufferedamountlow" event');
      });
    } catch (error) {
      logger.error("enableBotDataProducer() | failed:%o", error);

      notificationStore.notify({
        type: "error",
        text: `Error enabling bot DataProducer: ${error}`,
      });

      throw error;
    }
  }

  async sendChatMessage(text) {
    logger.debug('sendChatMessage() [text:"%s]', text);

    if (!this._chatDataProducer) {
      notificationStore.notify({
        type: "error",
        text: "No chat DataProducer",
      });

      return;
    }

    try {
      this._chatDataProducer.send(text);
    } catch (error) {
      logger.error("chat DataProducer.send() failed:%o", error);

      notificationStore.notify({
        type: "error",
        text: `chat DataProducer.send() failed: ${error}`,
      });
    }
  }

  async sendBotMessage(text) {
    logger.debug('sendBotMessage() [text:"%s]', text);

    if (!this._botDataProducer) {
      notificationStore.notify({
        type: "error",
        text: "No bot DataProducer",
      });

      return;
    }

    try {
      this._botDataProducer.send(text);
    } catch (error) {
      logger.error("bot DataProducer.send() failed:%o", error);

      notificationStore.notify({
        type: "error",
        text: `bot DataProducer.send() failed: ${error}`,
      });
    }
  }

  async changeDisplayName(displayName) {
    logger.debug('changeDisplayName() [displayName:"%s"]', displayName);

    // Store in cookie.
    cookiesManager.setUser({ displayName });

    try {
      await this._socket.request("changeDisplayName", { displayName });

      this._displayName = displayName;

      meStore.setDisplayName(displayName);

      notificationStore.notify({
        text: "Display name changed",
      });
    } catch (error) {
      logger.error("changeDisplayName() | failed: %o", error);

      notificationStore.notify({
        type: "error",
        text: `Could not change display name: ${error}`,
      });

      // We need to refresh the component for it to render the previous
      // displayName again.
      meStore.setDisplayName();
    }
  }

  async getSendTransportRemoteStats() {
    logger.debug("getSendTransportRemoteStats()");

    if (!this._sendTransport) return;

    return this._socket.request("getTransportStats", {
      transportId: this._sendTransport.id,
    });
  }

  async getRecvTransportRemoteStats() {
    logger.debug("getRecvTransportRemoteStats()");

    if (!this._recvTransport) return;

    return this._socket.request("getTransportStats", {
      transportId: this._recvTransport.id,
    });
  }

  async getAudioRemoteStats() {
    logger.debug("getAudioRemoteStats()");

    if (!this._micProducer) return;

    return this._socket.request("getProducerStats", {
      producerId: this._micProducer.id,
    });
  }

  async getVideoRemoteStats() {
    logger.debug("getVideoRemoteStats()");

    const producer = this._webcamProducer || this._shareProducer;

    if (!producer) return;

    return this._socket.request("getProducerStats", {
      producerId: producer.id,
    });
  }

  async getConsumerRemoteStats(consumerId) {
    logger.debug("getConsumerRemoteStats()");

    const consumer = this._consumers.get(consumerId);

    if (!consumer) return;

    return this._socket.request("getConsumerStats", { consumerId });
  }

  async getChatDataProducerRemoteStats() {
    logger.debug("getChatDataProducerRemoteStats()");

    const dataProducer = this._chatDataProducer;

    if (!dataProducer) return;

    return this._socket.request("getDataProducerStats", {
      dataProducerId: dataProducer.id,
    });
  }

  async getBotDataProducerRemoteStats() {
    logger.debug("getBotDataProducerRemoteStats()");

    const dataProducer = this._botDataProducer;

    if (!dataProducer) return;

    return this._socket.request("getDataProducerStats", {
      dataProducerId: dataProducer.id,
    });
  }

  async getDataConsumerRemoteStats(dataConsumerId) {
    logger.debug("getDataConsumerRemoteStats()");

    const dataConsumer = this._dataConsumers.get(dataConsumerId);

    if (!dataConsumer) return;

    return this._socket.request("getDataConsumerStats", { dataConsumerId });
  }

  async getSendTransportLocalStats() {
    logger.debug("getSendTransportLocalStats()");

    if (!this._sendTransport) return;

    return this._sendTransport.getStats();
  }

  async getRecvTransportLocalStats() {
    logger.debug("getRecvTransportLocalStats()");

    if (!this._recvTransport) return;

    return this._recvTransport.getStats();
  }

  async getAudioLocalStats() {
    logger.debug("getAudioLocalStats()");

    if (!this._micProducer) return;

    return this._micProducer.getStats();
  }

  async getVideoLocalStats() {
    logger.debug("getVideoLocalStats()");

    const producer = this._webcamProducer || this._shareProducer;

    if (!producer) return;

    return producer.getStats();
  }

  async getConsumerLocalStats(consumerId) {
    const consumer = this._consumers.get(consumerId);

    if (!consumer) return;

    return consumer.getStats();
  }
  async setConsumerJitterBufferTarget(consumerId, jitterBufferTarget) {
    const consumer = this._consumers.get(consumerId);

    if (!consumer) return;
    if (consumer.rtpReceiver.jitterBufferTarget !== undefined) {
      consumer.rtpReceiver.jitterBufferTarget = jitterBufferTarget
      // consumer.rtpReceiver.playoutDelayHint = jitterBufferTarget;
      logger.debug(
        "setConsumerJitterBufferTarget %s",
        consumer.rtpReceiver.jitterBufferTarget
      );
    }
  }

  async setProducerBandwidth(targetBandwidth) {
    const producer = this._webcamProducer;
    const parameters = producer._rtpSender.getParameters();
    if (!parameters.encodings) {
      parameters.encodings = [{}];
    }
    if (targetBandwidth === 'unlimited') {
      delete parameters.encodings[0].maxBitrate;
    } else {
      parameters.encodings[0].maxBitrate = targetBandwidth * 1000;
    }
    logger.debug(
      "setProducerBandwidth %s target: %s",
      parameters.encodings[0].maxBitrate, targetBandwidth
    );
    return producer._rtpSender.setParameters(parameters);
  }

  async applyNetworkThrottle({ uplink, downlink, rtt, secret, packetLoss }) {
    logger.debug(
      "applyNetworkThrottle() [uplink:%s, downlink:%s, rtt:%s, packetLoss:%s]",
      uplink,
      downlink,
      rtt,
      packetLoss
    );

    try {
      await this._socket.request("applyNetworkThrottle", {
        secret,
        uplink,
        downlink,
        rtt,
        packetLoss,
      });
    } catch (error) {
      logger.error("applyNetworkThrottle() | failed:%o", error);

      notificationStore.notify({
        type: "error",
        text: `Error applying network throttle: ${error}`,
      });
    }
  }

  async resetNetworkThrottle({ silent = false, secret }) {
    logger.debug("resetNetworkThrottle()");

    try {
      await this._socket.request("resetNetworkThrottle", { secret });
    } catch (error) {
      if (!silent) {
        logger.error("resetNetworkThrottle() | failed:%o", error);

        notificationStore.notify({
          type: "error",
          text: `Error resetting network throttle: ${error}`,
        });
      }
    }
  }

  async _joinRoom() {
    logger.debug("_joinRoom()");
    // lidedongsn
    const me = {
      id: this._peerId,
      displayName: this._displayName,
      device: this._device,
    };
    meStore.setMe(me);
    try {
      this._mediasoupDevice = new mediasoupClient.Device({
        handlerName: this._handlerName
      });

      roomStore.setRoomMediasoupClientHandler(
        this._mediasoupDevice.handlerName
      );

      const routerRtpCapabilities = await this._socket.request(
        "getRouterRtpCapabilities"
      );

      await this._mediasoupDevice.load({ routerRtpCapabilities });

      // NOTE: Stuff to play remote audios due to browsers' new autoplay policy.
      //
      // Just get access to the mic and DO NOT close the mic track for a while.
      // Super hack!
      // {
      //   const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      //   const audioTrack = stream.getAudioTracks()[0]

      //   audioTrack.enabled = false

      //   setTimeout(() => audioTrack.stop(), 120000)
      // }
      // Create mediasoup Transport for sending (unless we don't want to produce).
      // if (this._produce) {
      const transportInfo = await this._socket.request(
        "createWebRtcTransport",
        {
          forceTcp: this._forceTcp,
          producing: true,
          consuming: false,
          sctpCapabilities: this._useDataChannel
            ? this._mediasoupDevice.sctpCapabilities
            : undefined,
        }
      );

      const {
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters,
      } = transportInfo;

      this._sendTransport = this._mediasoupDevice.createSendTransport({
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters: {
          ...dtlsParameters,
          // Remote DTLS role. We know it's always 'auto' by default so, if
          // we want, we can force local WebRTC transport to be 'client' by
          // indicating 'server' here and vice-versa.
          role: "auto",
        },
        sctpParameters,
        iceServers: [],
        proprietaryConstraints: PC_PROPRIETARY_CONSTRAINTS,
        additionalSettings: {
          encodedInsertableStreams: false /*this._e2eKey && e2e.isSupported()*/,
        },
      });

      this._sendTransport.on(
        "connect",
        (
          { iceParameters, dtlsParameters },
          callback,
          errback // eslint-disable-line no-shadow
        ) => {
          this._socket
            .request("connectWebRtcTransport", {
              transportId: this._sendTransport.id,
              iceParameters,
              dtlsParameters,
            })
            .then(callback)
            .catch(errback);
        }
      );

      this._sendTransport.on(
        "produce",
        async ({ kind, rtpParameters }, callback, errback) => {
          try {
            // eslint-disable-next-line no-shadow
            const { id } = await this._socket.request("produce", {
              transportId: this._sendTransport.id,
              kind,
              rtpParameters,
              appData:{
                CameraType:"Visible",MissionId:"320222",Type:"video"
              },
            });

            callback({ id });
          } catch (error) {
            errback(error);
          }
        }
      );

      this._sendTransport.on(
        "producedata",
        async (
          { sctpStreamParameters, label, protocol, appData },
          callback,
          errback
        ) => {
          logger.debug(
            '"producedata" event: [sctpStreamParameters:%o, appData:%o]',
            sctpStreamParameters,
            appData
          );

          try {
            // eslint-disable-next-line no-shadow
            const { id } = await this._socket.request("produceData", {
              transportId: this._sendTransport.id,
              sctpStreamParameters,
              label,
              protocol,
              appData,
            });

            callback({ id });
          } catch (error) {
            errback(error);
          }
        }
      );
      // }

      // Create mediasoup Transport for receiving (unless we don't want to consume).
      if (this._consume) {
        const transportInfo = await this._socket.request(
          "createWebRtcTransport",
          {
            forceTcp: this._forceTcp,
            producing: false,
            consuming: true,
            sctpCapabilities: this._useDataChannel
              ? this._mediasoupDevice.sctpCapabilities
              : undefined,
          }
        );

        const {
          id,
          iceParameters,
          iceCandidates,
          dtlsParameters,
          sctpParameters,
        } = transportInfo;

        this._recvTransport = this._mediasoupDevice.createRecvTransport({
          id,
          iceParameters,
          iceCandidates,
          dtlsParameters: {
            ...dtlsParameters,
            // Remote DTLS role. We know it's always 'auto' by default so, if
            // we want, we can force local WebRTC transport to be 'client' by
            // indicating 'server' here and vice-versa.
            role: "auto",
          },
          sctpParameters,
          iceServers: [],
          additionalSettings: {
            encodedInsertableStreams: false /*this._e2eKey && e2e.isSupported()*/,
          },
        });
        this._recvTransport.on(
          "connect",
          (
            { iceParameters, dtlsParameters },
            callback,
            errback // eslint-disable-line no-shadow
          ) => {
            this._socket
              .request("connectWebRtcTransport", {
                transportId: this._recvTransport.id,
                iceParameters,
                dtlsParameters,
              })
              .then(callback)
              .catch(errback);
          }
        );
      }

      // Join now into the room.
      // NOTE: Don't send our RTP capabilities if we don't want to consume.
      const { peers } = await this._socket.request("join", {
        displayName: this._displayName,
        device: this._device,
        rtpCapabilities: this._consume
          ? this._mediasoupDevice.rtpCapabilities
          : undefined,
        sctpCapabilities:
          this._useDataChannel && this._consume
            ? this._mediasoupDevice.sctpCapabilities
            : undefined,
      });

      roomStore.setRoomState("connected");

      // Clean all the existing notifcations.
      notificationStore.removeAllNotifications();

      notificationStore.notify({
        text: "You are in the room!",
        timeout: 3000,
      });

      for (const peer of peers) {
        peerStore.addPeer({
          peer: { ...peer, consumers: [], dataConsumers: [] },
        });
      }

      // Enable mic/webcam.
      // if (this._produce) {
      // Set our media capabilities.
      meStore.setMediaCapabilities({
        canSendMic: this._mediasoupDevice.canProduce("audio"),
        canSendWebcam: this._mediasoupDevice.canProduce("video"),
      });

      // this.enableMic()

      // lidedongsn debug
      if (this._produce) {
        cookiesManager.setDevices({ webcamEnabled: true });
        const devicesCookie = cookiesManager.getDevices();

        if (
          !devicesCookie ||
          devicesCookie.webcamEnabled ||
          this._externalVideo
        ) {
          this.enableWebcam();
          // this.enableWebcam()
        }
      }

      this.enableChatDataProducer();

      this._sendTransport.on("connectionstatechange", (connectionState) => {
        if (connectionState === "connected") {
          // this.enableChatDataProducer()
          // this.enableBotDataProducer()
        }
        if (
          connectionState === "failed" ||
          connectionState === "disconnected" ||
          connectionState === "closed"
        ) {
          // Handle the disconnection
          logger.error("WebRTC connection state: %s", connectionState);
        } else {
          logger.debug("WebRTC connection state: %s", connectionState);
        }
      });
      // }

      // NOTE: For testing.
      if (window.SHOW_INFO) {
        const { me } = meStore.getState;

        roomStore.setRoomStatsPeerId(me.id);
      }
    } catch (error) {
      logger.error("_joinRoom() failed:%o", error);

      notificationStore.notify({
        type: "error",
        text: `Could not join the room: ${error}`,
      });

      this.close();
    }
  }

  async _updateWebcams() {
    logger.debug("_updateWebcams()");

    // Reset the list.
    this._webcams = new Map();

    logger.debug("_updateWebcams() | calling enumerateDevices()");

    const devices = await navigator.mediaDevices.enumerateDevices();

    for (const device of devices) {
      if (device.kind !== "videoinput") continue;

      this._webcams.set(device.deviceId, device);
    }

    const array = Array.from(this._webcams.values());
    const len = array.length;
    const currentWebcamId = this._webcam.device
      ? this._webcam.device.deviceId
      : undefined;
    meStore.setVideoInputDevices({ videoInputDevices: array });
    logger.debug("_updateWebcams() [webcams:%o]", array);

    if (len === 0) this._webcam.device = null;
    else if (!this._webcams.has(currentWebcamId))
      this._webcam.device = array[0];

    meStore.setCanChangeWebcam(this._webcams.size > 1);
  }

  _getWebcamType(device) {
    if (/(back|rear)/i.test(device.label)) {
      logger.debug("_getWebcamType() | it seems to be a back camera");

      return "back";
    } else {
      logger.debug("_getWebcamType() | it seems to be a front camera");

      return "front";
    }
  }

  async _pauseConsumer(consumer) {
    if (consumer.paused) return;

    try {
      await this._socket.request("pauseConsumer", { consumerId: consumer.id });

      consumer.pause();

      consumerStore.setConsumerPaused(consumer.id, "local");
    } catch (error) {
      logger.error("_pauseConsumer() | failed:%o", error);

      notificationStore.notify({
        type: "error",
        text: `Error pausing Consumer: ${error}`,
      });
    }
  }

  async _resumeConsumer(consumer) {
    if (!consumer.paused) return;

    try {
      await this._socket.request("resumeConsumer", { consumerId: consumer.id });

      consumer.resume();

      consumerStore.setConsumerResumed(consumer.id, "local");
    } catch (error) {
      logger.error("_resumeConsumer() | failed:%o", error);

      notificationStore.notify({
        type: "error",
        text: `Error resuming Consumer: ${error}`,
      });
    }
  }

  async _getExternalVideoStream() {
    if (this._externalVideoStream) return this._externalVideoStream;

    if (this._externalVideo.readyState < 3) {
      await new Promise((resolve) =>
        this._externalVideo.addEventListener("canplay", resolve)
      );
    }

    if (this._externalVideo.captureStream)
      this._externalVideoStream = this._externalVideo.captureStream();
    else if (this._externalVideo.mozCaptureStream)
      this._externalVideoStream = this._externalVideo.mozCaptureStream();
    else throw new Error("video.captureStream() not supported");

    return this._externalVideoStream;
  }
}
