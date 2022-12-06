/**
 * 获取媒体设备
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { CustomNavigator } from "../type";
const recorderWorker = new Worker(new URL("../video.worker.ts", import.meta.url));
import { useLayoutEffect } from "react";

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
): [(status: boolean) => void, boolean, boolean] => {
    const params = useRef("");

    const [start, setStart] = useState(false);

    const mediaStreamRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const recorderRef = useRef<ScriptProcessorNode | null>(null);
    const contextRef = useRef<AudioContext | null>(null);
    const tracksRef = useRef<Array<MediaStreamTrack> | null>(null);

    const bufferRef = useRef<Array<number>>([]);

    const pendingFnRef = useRef(handlePending);
    const cancelFnRef = useRef(handleCancel);

    const [openLoading, setOpenLoading] = useState(false);
    const [closeLoading, setCloseLoading] = useState(false);

    const closeTimer = useRef<number>();

    const destroy = useRef(false);

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
        const signa = hex_md5(appId + ts);
        const signatureSha = CryptoJSNew.HmacSHA1(signa, secretKey);
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
        if (start) {
            const fn = (
                e: MessageEvent<{ type: "transform" | unknown; buffer: Array<number> }>,
            ) => {
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
        }
    }, [start]);

    /**
     * 创建webSocket通讯
     */
    useLayoutEffect(() => {
        if (start) {
            const lang = "cn";

            const ws = new WebSocket(`wss://${mainDomain}${url}${params.current}&lang=${lang}`);
            /**
             * 0 => 结束
             * 1 => 开始
             */
            let state = 0;

            /**
             * 延时一段时间去读取buffer里的数据
             * 不然可能没有音频
             */
            let timeoutStart: number | null = null;
            /**
             * 轮询读取buffer数据
             */
            let handlerInterval: number | null = null;

            /**
             * 取消 连接
             */
            const cancelConnect = () => {
                setStart(false);
                tracksRef.current?.forEach((item) => item.stop());

                recorderRef.current?.disconnect();
                mediaStreamRef.current?.disconnect();
                contextRef.current?.close();
                contextRef.current = null;
                recorderRef.current = null;
                tracksRef.current = null;
                mediaStreamRef.current = null;
                bufferRef.current = [];
                state = 0;
                timeoutStart && window.clearTimeout(timeoutStart);
                handlerInterval && window.clearTimeout(handlerInterval);
            };

            /**
             * 间隔发送的信息
             */
            const intervalSend = () => {
                if (ws.readyState !== 1) {
                    handlerInterval && window.clearInterval(handlerInterval);
                    return;
                }
                if (bufferRef.current.length === 0) {
                    if (state === 0) {
                        ws.send('{"end": true}');
                        handlerInterval && window.clearInterval(handlerInterval);
                    }
                    return false;
                }
                const audioData = bufferRef.current.splice(0, 1280);
                if (audioData.length > 0) {
                    ws.send(new Int8Array(audioData));
                }
            };

            ws.onopen = () => {
                state = 1;
                timeoutStart = window.setTimeout(() => {
                    timeoutStart = null;
                    if (ws.readyState !== 1) {
                        return;
                    }
                    const audioData = bufferRef.current.splice(0, 1280);
                    ws.send(new Int8Array(audioData));

                    handlerInterval = window.setInterval(intervalSend, 40);
                }, 500);
            };

            ws.onmessage = (e: MessageEvent<string>) => {
                const jsonData = JSON.parse(e.data) as {
                    action: "started" | "result" | "error";
                    code: string;
                    desc: string;
                    sid: string;
                    data?: string;
                };

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

                const fn = () => {
                    const data = jsonData.data
                        ? (JSON.parse(jsonData.data) as Record<"cn", LangData>)
                        : undefined;
                    switch (jsonData.action) {
                        case "result":
                            if (data) {
                                mapText(data[lang]);
                            }

                            break;
                        case "error":
                            state = 0;
                            cancelFnRef.current();
                            break;
                    }
                };

                if (jsonData.code !== "0") {
                    cancelFnRef.current();
                    cancelConnect();
                    ws.close();
                }

                switch (jsonData.code) {
                    case "0":
                        fn();
                        break;
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
                        alert("发生未知,稍后请重试");
                        break;
                }
            };

            ws.onerror = () => {
                ws.close();
                cancelFnRef.current();
            };
            ws.onclose = () => {
                ws.send('{"end": true}');
                cancelConnect();
            };
            return () => {
                ws.close();
                timeoutStart && window.clearTimeout(timeoutStart);
                handlerInterval && window.clearInterval(handlerInterval);
            };
        }
    }, [start]);

    useEffect(() => {
        destroy.current = false;
        return () => {
            destroy.current = true;
            closeTimer.current && window.clearTimeout(closeTimer.current);
        };
    }, []);

    useEffect(() => {
        return () => {
            tracksRef.current?.forEach((item) => item.stop());
            recorderRef.current?.disconnect();
            mediaStreamRef.current?.disconnect();

            contextRef.current?.close();
            bufferRef.current = [];
            tracksRef.current = null;
            contextRef.current = null;
            recorderRef.current = null;
            mediaStreamRef.current = null;
        };
    }, []);

    const fn = useCallback((status: boolean) => {
        if (status) {
            setOpenLoading(true);

            navigator.mediaDevices
                .getUserMedia({
                    audio: true,
                    video: false,
                })
                .then((stream) => {
                    setStart(true);
                    tracksRef.current = stream.getTracks();
                    const context = (contextRef.current = new AudioContext());

                    const mediaStream = (mediaStreamRef.current =
                        context.createMediaStreamSource(stream));
                    const recorder = (recorderRef.current = context.createScriptProcessor(0, 1, 1));
                    mediaStream.connect(recorder);
                    recorder.connect(context.destination);
                    recorder.onaudioprocess = (e) => {
                        recorderWorker.postMessage({
                            type: "pending",
                            buffer: e.inputBuffer.getChannelData(0),
                        });
                    };
                })
                .catch(() => {
                    alert("请求麦克风失败");
                    setStart(false);
                    tracksRef.current?.forEach((item) => item.stop());
                    mediaStreamRef.current?.disconnect();
                    recorderRef.current?.disconnect();
                    contextRef.current?.close();
                    contextRef.current = null;
                    tracksRef.current = null;
                    bufferRef.current = [];
                    mediaStreamRef.current = null;
                    recorderRef.current = null;
                    cancelFnRef.current();
                })
                .finally(() => {
                    setOpenLoading(false);
                });
            return;
        }
        if (contextRef.current) {
            setCloseLoading(true);
        } else {
            setCloseLoading(false);
        }

        setStart(false);

        tracksRef.current?.forEach((item) => item.stop());
        recorderRef.current?.disconnect();
        mediaStreamRef.current?.disconnect();
        contextRef.current?.close().then(() => {
            closeTimer.current = window.setTimeout(() => {
                if (destroy.current) {
                    return;
                }
                setCloseLoading(false);
            }, 1000);
        });
        contextRef.current = null;
        bufferRef.current = [];
        tracksRef.current = null;
        recorderRef.current = null;
        mediaStreamRef.current = null;
    }, []);
    return [fn, openLoading, closeLoading];
};
