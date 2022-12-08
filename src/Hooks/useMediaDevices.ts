/**
 * 获取媒体设备
 */
import CryptoJS from "crypto-js";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ALiMessageProps, CustomNavigator, StartMessage } from "../type";

const recorderWorker = new Worker(new URL("../video.worker.ts", import.meta.url));

interface LangData {
    st: {
        bg: string;
        ed: string;
        type: "1" | "0";
        rt: Array<{
            ws: Array<{
                cw: Array<{
                    w: string;
                    wp: "n" | "s" | "p";
                }>;
                wb: number;
                we: number;
            }>;
        }>;
    };
}

const mainDomain = "api.dev.datareachable.net/datacoll/v2/dev/";
// const mainDomain = "192.168.10.5:3000/";

const url = "ws/xfyun/rtasr/v1";
/**
 * 获取媒体权限
 * @param handleStart 获取媒体权限成功
 * @param handlePending 和媒体交互中
 * @param handleCancel 取消和媒体交互
 * @returns
 */
export const useMediaDevices = (
    handlePending: (data: { value: string; type: "0" | "1" }) => void,
    handleCancel: () => void,
): [(status: boolean) => void, boolean] => {
    const mediaStreamRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const recorderRef = useRef<ScriptProcessorNode | null>(null);

    const contextRef = useRef<AudioContext | null>(null);

    const tracksRef = useRef<Array<MediaStreamTrack> | null>(null);

    const bufferRef = useRef<Array<number>>([]);

    const pendingFnRef = useRef(handlePending);

    const cancelFnRef = useRef(handleCancel);

    const [loading, setLoading] = useState(false);

    const closeTimer = useRef<number>();

    const destroy = useRef(false);

    const startTimer = useRef<number>();

    const intervalTimer = useRef<number>();

    const wsRef = useRef<WebSocket>();

    const pending = useRef(false);

    useLayoutEffect(() => {
        pendingFnRef.current = handlePending;
    }, [handlePending]);

    useLayoutEffect(() => {
        cancelFnRef.current = handleCancel;
    }, [handleCancel]);

    /**
     * getUserMedia的兼容处理
     */
    useEffect(() => {
        const n = navigator as CustomNavigator;

        if (n.mediaDevices === undefined) {
            n.mediaDevices = {};
        }
        if (n.mediaDevices.getUserMedia === undefined) {
            n.mediaDevices.getUserMedia = (constraints) => {
                const getUserMedia =
                    n.getUserMedia || n.webkitGetUserMedia || n.mozGetUserMedia || n.msGetUserMedia;
                if (!getUserMedia) {
                    return Promise.reject(
                        new Error("getUserMedia is not implemented in this browser"),
                    );
                }
                return new Promise((resolve, reject) => {
                    getUserMedia.prototype.call(navigator, constraints, resolve, reject);
                });
            };
        }
    }, []);

    /**
     * 建立和子线程的通讯渠道
     */
    useLayoutEffect(() => {
        const fn = (e: MessageEvent<{ type: "transform" | unknown; buffer: Array<number> }>) => {
            switch (e.data.type) {
                case "transform":
                    bufferRef.current.push(...e.data.buffer);
                    break;
                default:
                    break;
            }
        };

        recorderWorker.addEventListener("message", fn);
        return () => {
            recorderWorker.removeEventListener("message", fn);
        };
    }, []);

    useEffect(() => {
        destroy.current = false;
        return () => {
            destroy.current = true;
        };
    }, []);

    useEffect(() => {
        return () => {
            if (wsRef.current?.readyState === 1) {
                wsRef.current.send('{"end": true}');
                wsRef.current.close();
                wsRef.current = undefined;
            }

            tracksRef.current?.forEach((item) => item.stop());
            recorderRef.current && mediaStreamRef.current?.disconnect(recorderRef.current);
            recorderRef.current?.disconnect();
            contextRef.current?.close();
            contextRef.current = null;
            tracksRef.current = null;
            bufferRef.current = [];
            mediaStreamRef.current = null;
            recorderRef.current = null;
            startTimer.current && window.clearTimeout(startTimer.current);
            intervalTimer.current && window.clearInterval(intervalTimer.current);
            closeTimer.current && window.clearTimeout(closeTimer.current);
            startTimer.current = undefined;
            closeTimer.current = undefined;
            intervalTimer.current = undefined;
        };
    }, []);

    const fn = useCallback((status: boolean) => {
        const lang = "cn";

        /**
         * 重置
         */
        const reset = () => {
            tracksRef.current?.forEach((item) => item.stop());
            recorderRef.current && mediaStreamRef.current?.disconnect(recorderRef.current);
            recorderRef.current?.disconnect();
            contextRef.current?.close();
            contextRef.current = null;
            tracksRef.current = null;
            bufferRef.current = [];
            mediaStreamRef.current = null;
            recorderRef.current = null;
            startTimer.current && window.clearTimeout(startTimer.current);
            intervalTimer.current && window.clearInterval(intervalTimer.current);
            startTimer.current = undefined;
            intervalTimer.current = undefined;
        };

        /**
         * 成功获取设备
         */
        const getDeviceSuccess = (stream: MediaStream) => {
            console.log("111");
            /**
             * 音频轨迹存储起来
             * 在销毁时可以更快的终止
             */
            tracksRef.current = stream.getTracks();
            const context = (contextRef.current = new AudioContext());

            const mediaStream = (mediaStreamRef.current = context.createMediaStreamSource(stream));
            const recorder = (recorderRef.current = context.createScriptProcessor(0, 1, 1));
            mediaStream.connect(recorder);
            recorder.connect(context.destination);
            createWebSocket();
            recorder.onaudioprocess = (e) => {
                recorderWorker.postMessage({
                    type: "pending",
                    buffer: e.inputBuffer.getChannelData(0),
                });
            };
        };

        /**
         * 获取设备失败
         */
        const getDeviceFail = () => {
            console.log("222");
            alert("请求麦克风失败");
            reset();
            cancelFnRef.current();
            setLoading(false);
        };

        /**
         * 定时发送消息
         */
        const intervalSend = () => {
            if (destroy.current || wsRef.current?.readyState !== 1) {
                return;
            }
            const audioData = bufferRef.current.splice(0, 1280);
            if (audioData.length > 0) {
                wsRef.current.send(new Int8Array(audioData));
            }
        };

        const getParams = () => {
            const isoStr = new Date().toISOString();
            const key = "PRder3XcU7VmOSdB";
            const data = CryptoJS.HmacSHA1(isoStr, key);
            const str = CryptoJS.enc.Base64.stringify(data);
            return `{
            "time":"${decodeURIComponent(isoStr)}",
            "sign":"${decodeURIComponent(str)}"}`;
        };

        let openTimer = 0;

        /**
         * 当WebSocket创建成功时
         */
        const handleOpen = () => {
            setLoading(false);
            if (wsRef.current?.readyState !== 1) {
                return;
            }
            wsRef.current?.send(getParams());
            openTimer = Date.now();
        };

        /**
         * 过滤数据
         */
        const mapText = (data: LangData) => {
            let str = "";

            const rts = data.st.rt;
            for (let i = 0; i < rts.length; i++) {
                const wss = rts[i].ws;
                for (let j = 0; j < wss.length; j++) {
                    const cws = wss[j].cw;
                    for (let k = 0; k < cws.length; k++) {
                        str += cws[k].w;
                    }
                }
            }

            pendingFnRef.current({
                value: str,
                type: data.st.type,
            });
        };

        /**
         * 当websocket返回的code不正常时
         */
        const handleMessageError = (res: ALiMessageProps) => {
            switch (res.header.status) {
                case 40_000_000:
                    alert("参数不正确");
                    break;
                case 40_000_001:
                    alert("参数错误");
                    break;
                case 40_000_002:
                    alert("发送的message错误");
                    break;
                case 40_000_003:
                    alert("参数错误");
                    break;
                case 40_000_005:
                    alert("并发请求过多");
                    break;
                case 40_000_009:
                    alert("错误的消息头");
                    break;
                case 40_000_010:
                    alert("试用期已结束，并且未开通商用版、或账号欠费");
                    break;
                case 40_010_001:
                    alert("不支持的接口或参数");
                    break;
                case 40_010_003:
                    alert("客户端侧通用错误码");
                    break;
                case 40_010_004:
                    alert("在请求处理完成前客户端主动结束");
                    break;
                case 40_010_005:
                    alert("客户端发送了当前不支持的消息指令");
                    break;
                case 40_020_105:
                    alert("使用了不存在的Appkey");
                    break;
                case 40_020_106:
                    alert("调用时传递的Appkey和Token并非同一个账号UID所创建，导致不匹配");
                    break;
                case 403:
                    alert("使用的Token无效，例如Token不存在或者已过期");
                    break;
                case 41_000_003:
                    alert("无法获取该Appkey的路由信息");
                    break;
                case 41_010_101:
                    alert("不支持的采样率格式");
                    break;
                case 41_040_201:
                    alert("获取客户端发送的数据超时失败");
                    break;
                case 50_000_000:
                    alert("受机器负载、网络等因素导致的异常，通常为偶发出现");
                    break;
                case 50_000_001:
                    alert("受机器负载、网络等因素导致的异常，通常为偶发出现");
                    break;
                case 52_010_001:
                    alert("受机器负载、网络等因素导致的异常，通常为偶发出现");
                    break;
                default:
                    alert("发生未知错误,稍后请重试");
                    break;
            }

            //code不正常 还要做些什么
            cancelFnRef.current();
            reset();
        };

        /**
         * 接收到websocket返回的消息时
         */
        const handleMessageStart = (res: StartMessage) => {
            const code = res.header.status;
            //开始轮询
            const startInterval = () => {
                if (destroy.current || wsRef.current?.readyState !== 1) {
                    return;
                }
                const audioData = bufferRef.current.splice(0, 1280);
                wsRef.current.send(new Int8Array(audioData));

                intervalTimer.current = window.setInterval(intervalSend, 40);
            };

            if (code === 20_000_000) {
                const nowTime = Date.now();

                if (nowTime - openTimer > 500) {
                    startInterval();
                } else {
                    /**
                     * 当讲述者说一会
                     * 不然没有音频数据
                     */
                    startTimer.current = window.setTimeout(() => {
                        startTimer.current = undefined;
                        startInterval();
                    }, 500);
                }
                openTimer = 0;
                return;
            }
            handleMessageError(res);
            cancelFnRef.current();
            wsRef.current?.close();
        };

        // const handleMessage = (e: MessageEvent<string>) => {
        //     console.log("message", e);
        //     const res = JSON.parse(e.data) as {
        //         action: "started" | "result" | "error";
        //         code: string;
        //         desc: string;
        //         sid: string;
        //         data?: string;
        //     };

        //     const data = res.data ? (JSON.parse(res.data) as Record<"cn", LangData>) : undefined;

        //     if (res.code !== "0") {
        //         handleMessageError(res);
        //         return;
        //     }

        //     switch (res.action) {
        //         case "result":
        //             if (data) {
        //                 mapText(data[lang]);
        //             }
        //             break;
        //         case "error":
        //             handleMessageError(res);
        //             break;
        //     }
        // };

        /**
         * 监听onerror事件
         */
        const handleError = () => {
            //发生错误的时候会自动断开链接

            cancelFnRef.current();

            setLoading(false);
            reset();
            alert("链接失败,请检查网络");
        };

        /**
         * 监听onclose事件
         */
        const handleClose = (e) => {
            console.log("onclose", e);
            reset();
        };

        /**
         * 创建WebSocket
         */
        const createWebSocket = () => {
            const ws = (wsRef.current = new WebSocket(`wss://${mainDomain}${url}`));
            //当建立链接时
            ws.onopen = handleOpen;

            //当接受到消息时
            ws.onmessage = (e: MessageEvent<string>) => {
                console.log("message", e);
                // 接收到websocket返回的消息时
                const data = JSON.parse(e.data) as ALiMessageProps;

                switch (data.header.namespace) {
                    case "SpeechTranscriber":
                        handleMessageStart(data);
                        return;
                }
            };

            //当发生错误时
            ws.onerror = handleError;

            //当关闭时
            ws.onclose = handleClose;
        };

        const requestDevices = () => {
            navigator.mediaDevices
                .getUserMedia({
                    audio: true,
                    video: false,
                })
                .then(getDeviceSuccess)
                .catch(getDeviceFail);
        };

        console.log("status", status);
        // 当开始录音时
        if (status) {
            closeTimer.current && window.clearTimeout(closeTimer.current);
            setLoading(true);
            pending.current = true;
            requestDevices();
            return;
        }
        // 当中止录音时

        if (pending.current) {
            if (wsRef.current?.readyState === 1) {
                wsRef.current.send('{"end": true}');
                wsRef.current.close();
            }

            setLoading(true);
            tracksRef.current?.forEach((item) => item.stop());
            recorderRef.current?.disconnect();
            mediaStreamRef.current?.disconnect();
            contextRef.current?.close().then(() => {
                closeTimer.current = window.setTimeout(() => {
                    closeTimer.current = undefined;
                    if (destroy.current) {
                        return;
                    }
                    setLoading(false);
                }, 1000);
            });

            startTimer.current && window.clearTimeout(startTimer.current);
            intervalTimer.current && window.clearInterval(intervalTimer.current);

            contextRef.current = null;
            bufferRef.current = [];
            tracksRef.current = null;
            recorderRef.current = null;
            mediaStreamRef.current = null;
            pending.current = false;
            wsRef.current = undefined;
            startTimer.current = undefined;
            intervalTimer.current = undefined;
        } else {
            setLoading(false);
        }
    }, []);
    return [fn, loading];
};
