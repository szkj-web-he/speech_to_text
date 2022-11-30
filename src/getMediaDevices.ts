const recorderWorker = new Worker(new URL("./video.worker.ts", import.meta.url));

interface CustomNavigator {
    mediaDevices?: {
        getUserMedia?: (constraints?: MediaStreamConstraints) => Promise<MediaStream>;
    };
    getUserMedia?: (constraints?: MediaStreamConstraints) => Promise<MediaStream>;
    webkitGetUserMedia?: (constraints?: MediaStreamConstraints) => Promise<MediaStream>;
    mozGetUserMedia?: (constraints?: MediaStreamConstraints) => Promise<MediaStream>;
    msGetUserMedia?: (constraints?: MediaStreamConstraints) => Promise<MediaStream>;
}

const mediaDevicesPolyfill = () => {
    // 老的浏览器可能根本没有实现 mediaDevices，所以我们可以先设置一个空的对象
    const n = navigator as CustomNavigator;

    if (n.mediaDevices === undefined) {
        n.mediaDevices = {};
    }
    if (n.mediaDevices.getUserMedia === undefined) {
        n.mediaDevices.getUserMedia = (constraints) => {
            const getUserMedia =
                n.getUserMedia || n.webkitGetUserMedia || n.mozGetUserMedia || n.msGetUserMedia;
            if (!getUserMedia) {
                return Promise.reject(new Error("getUserMedia is not implemented in this browser"));
            }
            return new Promise(function (resolve, reject) {
                getUserMedia.prototype.call(navigator, constraints, resolve, reject);
            });
        };
    }
};

const handleMessage = () => {
    recorderWorker.addEventListener("message", (e) => {
        console.log(e, "1111");
    });
};

const getVideoBuffer = (stream: MediaStream) => {
    const context = new AudioContext();

    const mediaStream = context.createMediaStreamSource(stream);
    const recorder = context.createScriptProcessor(0, 1, 1);
    mediaStream.connect(recorder);
    recorder.connect(context.destination);
    recorder.onaudioprocess = (e) => {
        recorderWorker.postMessage({
            type: "pending",
            buffer: e.inputBuffer.getChannelData(0),
        });
        handleMessage();
    };
};

/**
 * 获取媒体权限
 */
export const getMediaDevicesRole = (): void => {
    mediaDevicesPolyfill();

    navigator.mediaDevices
        .getUserMedia({
            audio: true,
            video: false,
        })
        .then(getVideoBuffer)
        .catch(() => {
            alert("请求麦克风失败");
            // getMediaFail(e);
        });
};
