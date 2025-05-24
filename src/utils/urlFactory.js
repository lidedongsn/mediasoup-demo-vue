// let protooPort = 4443

// if (window.location.hostname === 'dev-rtc.3km.tech') protooPort = 4444

export function getProtooUrl({ roomId, peerId, forceH264, forceVP9 }) {
  // 读取vite 环境变量VITE_SIGNLING_URL
  const hostname = import.meta.env.VITE_SIGNLING_URL // window.location.hostname
  let url = `wss://${hostname}/?roomId=${roomId}&peerId=${peerId}`
  // let url = `wss://dev-rtc.3km.tech:3001`;

  // if (forceH264) url = `${url}&forceH264=true`;
  // else if (forceVP9) url = `${url}&forceVP9=true`;

  return url;
}
