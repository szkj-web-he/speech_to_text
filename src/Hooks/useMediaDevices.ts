/**
 * 获取媒体设备
 */
import CryptoJS from "crypto-js";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { CustomNavigator } from "../type";

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

// const mainDomain = "api.dev.datareachable.net/datacoll/v2/dev/";
const mainDomain = "";

// const url = "v2/dev/ws/xfyun/rtasr/v1";
const url = "rtasr.xfyun.cn/v1/ws";

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
    const params = useRef("");

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
     * 参数
     */
    useEffect(() => {
        const appId = "4a6a32c6";
        const secretKey = "ebbe49206100e5e36d6821e70704261f";
        const ts = Math.floor(new Date().getTime() / 1000).toString(); //new Date().getTime()/1000+'';
        const signa = CryptoJS.MD5(appId + ts).toString();
        const signatureSha = CryptoJS.HmacSHA1(signa, secretKey);
        let signature: string = CryptoJS.enc.Base64.stringify(signatureSha);
        signature = encodeURIComponent(signature);
        params.current = `?appid=${appId}&ts=${ts}&signa=${signature}`;
    }, []);

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
                    console.log("message");
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
            console.log("生命周期结束时移除设备");
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
            startTimer.current = undefined;
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

        /**
         * 当WebSocket创建成功时
         */
        const handleOpen = () => {
            setLoading(false);
            /**
             * 当讲述者说一会
             * 不然没有音频数据
             */
            startTimer.current = window.setTimeout(() => {
                startTimer.current = undefined;
                if (destroy.current || wsRef.current?.readyState !== 1) {
                    return;
                }

                const audioData = bufferRef.current.splice(0, 1280);
                wsRef.current.send(new Int8Array(audioData));

                intervalTimer.current = window.setInterval(intervalSend, 40);
            }, 500);
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
        const handleMessageError = (res: {
            action: "started" | "result" | "error";
            code: string;
            desc: string;
            sid: string;
            data?: string;
        }) => {
            switch (res.code) {
                case "10105":
                    alert("未授权许可");
                    break;
                case "10106":
                    alert("参数错误");
                    break;
                case "10107":
                    alert("参数错误");
                    break;
                case "10110":
                    alert("未授权许可");
                    break;
                case "10202":
                    alert("请检查网络是否正常,稍后请重试");
                    break;
                case "10204":
                    alert("请检查网络是否正常,稍后请重试");
                    break;
                case "10205":
                    alert("请检查网络是否正常,稍后请重试");
                    break;
                case "16003":
                    alert("基础组件异常,稍后请重试");
                    break;
                case "10800":
                    alert("超过授权的连接数,请联系开发人员");
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
        const handleMessage = (e: MessageEvent<string>) => {
            const res = JSON.parse(e.data) as {
                action: "started" | "result" | "error";
                code: string;
                desc: string;
                sid: string;
                data?: string;
            };

            const data = res.data ? (JSON.parse(res.data) as Record<"cn", LangData>) : undefined;

            if (res.code !== "0") {
                handleMessageError(res);
                return;
            }

            switch (res.action) {
                case "result":
                    if (data) {
                        mapText(data[lang]);
                    }
                    break;
                case "error":
                    handleMessageError(res);
                    break;
            }
        };

        /**
         * 监听onerror事件
         */
        const handleError = () => {
            //发生错误的时候会自动断开链接

            cancelFnRef.current();
            reset();
        };

        /**
         * 监听onclose事件
         */
        const handleClose = () => {
            reset();
        };

        /**
         * 创建WebSocket
         */
        const createWebSocket = () => {
            const ws = (wsRef.current = new WebSocket(
                `wss://${mainDomain}${url}${params.current}&lang=${lang}`,
            ));
            //当建立链接时
            ws.onopen = handleOpen;

            //当接受到消息时
            ws.onmessage = handleMessage;

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

        // 当开始录音时
        if (status) {
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
