/**
 * @file css过渡
 * @date 2022-09-08
 * @author xuejie.he
 * @lastModify xuejie.he 2022-09-08
 */

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import "../Transition/style.scss";
import { setStyle } from "../Transition/Unit/addStyle";
import { forceReflow } from "../Transition/Unit/forceReflow";
import { getTransitionAttr } from "../Transition/Unit/getTransitionAttr";
import {
    GetClassNameProps,
    initClassName,
    InitClassNameProps,
} from "../Transition/Unit/initClassName";
import { SizeProps } from "../Kite/Unit/type";
import { deepCloneData } from "../../unit";

/**
 * 过滤数组
 * @param { Array<string>} original 原始的数组
 * @param { Array<string>} exclude 剔除的数组
 * @returns {string[]} 新的数组
 */
const filterArray = (original: Array<string>, exclude: Array<string>): Array<string> => {
    const arr: string[] = [];
    for (let i = 0; i < original.length; i++) {
        let status = false;
        for (let j = 0; j < exclude.length; ) {
            if (original[i] === exclude[j]) {
                status = true;
                j = exclude.length;
            } else {
                ++j;
            }
        }
        if (!status) {
            arr.push(original[i]);
        }
    }
    return arr;
};

export enum ActionType {
    /**
     * 赋值过渡类名
     */
    SetClassNameAction = "SETCLASSNAME",
    /**
     * 切换可见状态
     * 合并了 获取宽高 和 切换可见状态
     */
    SwitchVisibleStatusAction = "SWITCHVISIBLESTATUS",
    /**
     * 初始化宽高
     */
    InitSizeAction = "INITSIZE",
    /**
     * 在获取宽高之后
     */
    AfterReadyAction = "AFTERREADY",
}
/**
 * 赋值过渡类名
 */
interface SetClassNameAction {
    type: ActionType.SetClassNameAction;
    payload: InitClassNameProps;
}

/**
 * 切换可见状态
 * 合并了 获取宽高 和 切换可见状态
 */
interface SwitchVisibleStatusAction {
    type: ActionType.SwitchVisibleStatusAction;
    payload: {
        value: boolean;
        isTransition: boolean;
    };
}
/**
 * 初始化宽高
 * 获取宽高
 */
interface InitSizeAction {
    type: ActionType.InitSizeAction;
    payload: {
        value: boolean;
        /**
         * 这里返回的不是原来的element
         * 是克隆的element
         */
        callback: (res: HTMLDivElement | null) => void;
    };
}

export function compareFn<T>(newData: T, oldData: T): T {
    if (typeof newData === "object" || typeof oldData === "object") {
        if (JSON.stringify(newData) === JSON.stringify(oldData)) {
            return oldData;
        }

        return newData;
    }

    return newData;
}

/**
 * 切换可见状态
 * 合并了 获取宽高 和 切换可见状态
 */

interface AfterReadyAction {
    type: ActionType.AfterReadyAction;
    payload: {
        value: boolean;
        isTransition: boolean;
    };
}

type TransitionAction =
    | SetClassNameAction
    | SwitchVisibleStatusAction
    | InitSizeAction
    | AfterReadyAction;

/**
 * transition-clock  用来获取过渡之前的数据
 * @param style: React.CSSProperties | undefined,
 * @param onTransitionStart 过渡开始
 * @param onTransitionEnd 过渡结束
 * @param onTransitionCancel 过渡取消
 * @param onTransitionCancel 过渡取消
 * @param root 要变化的节点
 * @returns
 */
export const useCssTransition = (
    style: React.CSSProperties | undefined,
    onTransitionStart: (() => void) | undefined,
    onTransitionEnd: (() => void) | undefined,
    onTransitionCancel: (() => void) | undefined,
    root: HTMLDivElement | null,
): [(action: TransitionAction) => void, string[], React.CSSProperties | undefined] => {
    /**
     * 过渡切换时的类名
     */
    const transitionClassName = useRef<GetClassNameProps>();

    const insertedClassName = useRef(["transition_hidden"]);

    const isTransition = useRef(false);

    /**
     * 判断是否准备好了
     * 如果过渡类型是 taller、wider的时候
     * 就得先获取宽高
     * 这里的ready就得是false
     *
     *
     */
    const [ready, setReady] = useState<{
        value: boolean;
        show?: boolean;
    }>({
        value: true,
    });

    const [show, setShow] = useState<boolean>();
    const showRef = useRef<boolean>();

    const animationName = useRef<InitClassNameProps["type"]>();

    const transitionStartFn = useRef(onTransitionStart);
    const transitionEndFn = useRef(onTransitionEnd);
    const transitionCancelFn = useRef(onTransitionCancel);

    const transitionStatus = useRef<{
        animation: boolean;
        isOver: boolean;
    }>({
        /**
         * 是否在执行过渡动画
         */
        animation: false,
        /**
         * 过渡事件是否结束
         */
        isOver: true,
    });

    const nodeSize = useRef<SizeProps>();

    const styleRef = useRef(style);

    const addStyleRef = useRef<React.CSSProperties>();

    const getSizeCallback = useRef<(res: HTMLDivElement | null) => void>();

    useLayoutEffect(() => {
        styleRef.current = style;
    }, [style]);
    useLayoutEffect(() => {
        transitionStartFn.current = onTransitionStart;
    }, [onTransitionStart]);
    useLayoutEffect(() => {
        transitionEndFn.current = onTransitionEnd;
    }, [onTransitionEnd]);
    useLayoutEffect(() => {
        transitionCancelFn.current = onTransitionCancel;
    }, [onTransitionCancel]);

    useLayoutEffect(() => {
        let timer: number | null = null;
        let destroy = false;
        let count = 0;
        let transitionAttr: ReturnType<typeof getTransitionAttr> | null = null;

        /**判断是否有过渡类名 */
        const hasClassClassValue = (res: "enter" | "leave") => {
            if (!transitionClassName.current) {
                return false;
            }
            const data = transitionClassName.current[res];
            const span = document.createElement("span");
            const rootClass = root?.getAttribute("class") ?? "";
            const rootStyle = root?.getAttribute("style");

            span.setAttribute("class", `${rootClass} ${data.active} ${data.from} ${data.to}`);
            rootStyle &&
                span.setAttribute(
                    "style",
                    `${rootStyle}position: absolute;opacity: 0;pointer-events: none;`,
                );
            document.body.append(span);
            const attr = getTransitionAttr(span);

            const status = attr.propCount || attr.timeout;
            span.remove();
            return status;
        };

        /**
         * 添加或删除className
         */
        const operationClassName = (type: "add" | "remove", cs: string[]) => {
            const arr: string[] = [];

            for (let i = 0; i < cs.length; i++) {
                if (cs[i]) {
                    arr.push(cs[i]);
                }
            }

            switch (type) {
                case "add":
                    root?.classList.add(...arr);
                    insertedClassName.current.push(...arr);
                    break;
                case "remove":
                    root?.classList.remove(...arr);
                    insertedClassName.current = filterArray(insertedClassName.current, arr);
                    break;
            }
        };

        /**
         * 声明周期结束时要执行的事件
         */
        const returnFn = () => {
            root?.removeEventListener("transitionend", transitionendWhenHidden, false);
            root?.removeEventListener("transitionend", transitionendWhenShow, false);
            destroy = true;
            if (timer) {
                window.clearTimeout(timer);
            }
        };

        const transitionClass = transitionClassName.current;

        if (!root || !transitionClass) {
            return;
        }

        /**
         * 当可见时
         * 过渡结束时
         */
        const transitionendWhenShow = (e: TransitionEvent) => {
            if (e.target === root) {
                ++count;
                if (count === transitionAttr?.propCount) {
                    enterEnd();
                }
            }
        };

        /**
         * 结束进入
         */
        const enterEnd = () => {
            timer && window.clearTimeout(timer);
            timer = null;
            transitionStatus.current.isOver = true;
            transitionStatus.current.animation = false;

            operationClassName("remove", insertedClassName.current);
            setStyle(root, styleRef.current);
            count = 0;
            transitionAttr = null;
            addStyleRef.current = undefined;

            transitionEndFn.current?.();
            root.removeEventListener("transitionend", transitionendWhenShow, false);
        };

        /**
         *  进入 后
         */
        const enterTo = () => {
            operationClassName("remove", [transitionClass.enter.from]);

            if (nodeSize.current) {
                switch (animationName.current) {
                    case "taller":
                        addStyleRef.current = {
                            height: `${nodeSize.current.height}px`,
                        };
                        break;
                    case "wider":
                        addStyleRef.current = {
                            width: `${nodeSize.current.width}px`,
                        };
                        break;
                    default:
                        break;
                }
            }
            if (addStyleRef.current) {
                setStyle(root, Object.assign({}, addStyleRef.current, styleRef.current));
            }

            operationClassName("add", [transitionClass.enter.to]);

            transitionAttr = getTransitionAttr(root);

            timer = window.setTimeout(() => {
                timer = null;
                if (destroy) {
                    return;
                }
                enterEnd();
            }, transitionAttr.timeout + 1);

            root.addEventListener("transitionend", transitionendWhenShow, false);
        };

        /**
         * 进入前
         *
         */
        const enterFrom = () => {
            operationClassName("add", [transitionClass.enter.from, transitionClass.enter.active]);
            operationClassName(
                "remove",
                filterArray(insertedClassName.current, [
                    transitionClass.enter.from,
                    transitionClass.enter.active,
                ]),
            );
            forceReflow();

            timer = window.setTimeout(() => {
                if (destroy) {
                    return;
                }
                enterTo();
            });
        };

        /**
         * 结束离开
         */
        const leaveEnd = () => {
            transitionStatus.current.animation = false;
            transitionStatus.current.isOver = true;

            operationClassName("remove", insertedClassName.current);
            operationClassName("add", ["transition_hidden"]);
            count = 0;
            transitionAttr = null;
            root.removeEventListener("transitionend", transitionendWhenHidden, false);

            timer && window.clearTimeout(timer);
            timer = null;
            transitionEndFn.current?.();
        };

        /**
         * 当transitionend事件结束时
         * 当可见度等于hidden
         */
        const transitionendWhenHidden = (e: TransitionEvent) => {
            if (e.target === root) {
                ++count;
                if (count === transitionAttr?.propCount) {
                    leaveEnd();
                }
            }
        };

        /**
         * 离开后
         */
        const leaveTo = () => {
            operationClassName("remove", [transitionClass.leave.from]);
            setStyle(root, styleRef.current);
            addStyleRef.current = undefined;
            operationClassName("add", [transitionClass.leave.to]);
            timer = window.setTimeout(() => {
                timer = null;
                if (destroy) {
                    return;
                }
                leaveEnd();
            }, (transitionAttr?.timeout ?? 0) + 1);
            root.addEventListener("transitionend", transitionendWhenHidden, false);
        };

        /**
         * 离开前
         */
        const leaveFrom = () => {
            if (nodeSize.current) {
                switch (animationName.current) {
                    case "taller":
                        addStyleRef.current = {
                            height: `${nodeSize.current.height}px`,
                        };
                        break;
                    case "wider":
                        addStyleRef.current = {
                            width: `${nodeSize.current.width}px`,
                        };
                        break;
                    default:
                        break;
                }
            }

            if (addStyleRef.current) {
                setStyle(root, Object.assign({}, addStyleRef.current, styleRef.current));
            }

            operationClassName("add", [transitionClass.leave.from, transitionClass.leave.active]);
            transitionAttr = getTransitionAttr(root);
            timer = window.setTimeout(() => {
                timer = null;
                if (destroy) {
                    return;
                }
                leaveTo();
            });
        };

        //转为可见
        const toVisible = () => {
            if (isTransition.current && hasClassClassValue("enter")) {
                transitionStatus.current.animation = true;
                enterFrom();
            } else {
                enterEnd();
            }
        };

        //转为不可见
        const toHidden = () => {
            if (isTransition.current && hasClassClassValue("leave")) {
                transitionStatus.current.animation = true;
                leaveFrom();
            } else {
                leaveEnd();
            }
        };

        /**
         * 当取消过渡动画的时候
         */
        const whenTransitionCancel = () => {
            if (transitionStatus.current.isOver === false) {
                transitionStatus.current.isOver = true;
                transitionCancelFn.current?.();
            }

            if (timer) {
                window.clearTimeout(timer);
                timer = null;
            }

            if (transitionStatus.current.animation) {
                addStyleRef.current = undefined;
                root && setStyle(root, styleRef.current);
                if (show) {
                    operationClassName("remove", insertedClassName.current);
                } else {
                    operationClassName("remove", insertedClassName.current);
                    operationClassName("add", ["transition_hidden"]);
                }
            }
        };

        if (ready.value && ready.show === show && typeof show === "boolean") {
            if (transitionStatus.current.isOver) {
                transitionStatus.current.isOver = false;
                transitionStartFn.current?.();
            }

            if (show) {
                toVisible();
            } else {
                toHidden();
            }

            return () => {
                returnFn();
                whenTransitionCancel();
            };
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, ready]);

    useLayoutEffect(() => {
        let sizeTimer: null | number = null;
        let destroy = false;
        let preClassValue: string[] | null = null;
        let addClassValue: string[] | null = null;

        //获取宽高
        const setSizeFn = (el: HTMLDivElement | null) => {
            const rect = el?.getBoundingClientRect();
            nodeSize.current = { width: rect?.width ?? 0, height: rect?.height ?? 0 };
            getSizeCallback.current?.(el);
        };

        /**
         * 添加或删除className
         */
        const operationClassName = (type: "add" | "remove", cs: string[]) => {
            const arr: string[] = [];

            for (let i = 0; i < cs.length; i++) {
                if (cs[i]) {
                    arr.push(cs[i]);
                }
            }

            switch (type) {
                case "add":
                    root?.classList.add(...arr);
                    insertedClassName.current.push(...arr);
                    break;
                case "remove":
                    root?.classList.remove(...arr);
                    insertedClassName.current = filterArray(insertedClassName.current, arr);
                    break;
            }
        };

        const resetFn = () => {
            preClassValue && operationClassName("add", preClassValue);
            addClassValue && addClassValue.length && operationClassName("remove", addClassValue);
        };
        /**
         * 当取消时
         */
        const whenCancel = () => {
            resetFn();
            if (!transitionStatus.current.isOver) {
                transitionStatus.current.isOver = true;
                transitionCancelFn.current?.();
            }
        };

        //延时执行
        const delayFn = () => {
            return new Promise((resolve) => {
                sizeTimer = window.setTimeout(() => {
                    sizeTimer = null;
                    if (destroy) {
                        whenCancel();
                        return;
                    }
                    resolve(undefined);
                });
            });
        };

        let isPending = false;

        /**
         * 过渡开始的回调
         */
        const startTransitionCallback = () => {
            if (!transitionStatus.current.isOver) {
                transitionStatus.current.isOver = false;
                transitionStartFn.current?.();
            }
        };

        if (!ready.value) {
            /**
             * 操作
             */
            const cloneNodeFn = () => {
                if (root) {
                    preClassValue = deepCloneData(insertedClassName.current);
                    addClassValue = ["transition_r__hidden"];
                    operationClassName("add", ["transition_r__hidden"]);
                    operationClassName(
                        "remove",
                        filterArray(insertedClassName.current, addClassValue),
                    );
                }
            };

            /**
             * 读取宽高的核心代码
             */

            const mainFn = () => {
                if (ready.show) {
                    startTransitionCallback();
                    isPending = true;

                    cloneNodeFn();

                    forceReflow();
                    void delayFn()
                        .then(() => {
                            setSizeFn(root);
                            resetFn();
                            forceReflow();
                            return delayFn();
                        })
                        .then(() => {
                            isPending = false;
                            setReady((pre) => {
                                return compareFn({ value: true, show: pre.show }, pre);
                            });
                        });
                } else if (ready.show === false) {
                    startTransitionCallback();
                    isPending = true;
                    forceReflow();
                    void delayFn().then(() => {
                        setSizeFn(root);
                        isPending = false;
                        forceReflow();
                        setReady((pre) => {
                            return compareFn({ value: true, show: pre.show }, pre);
                        });
                    });
                }
            };

            mainFn();
        }
        return () => {
            if (sizeTimer) {
                window.clearTimeout(sizeTimer);
            }
            destroy = true;
            if (isPending) {
                whenCancel();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready]);

    const dispatch = useCallback((action: TransitionAction) => {
        switch (action.type) {
            case ActionType.SetClassNameAction:
                animationName.current = action.payload.type;
                transitionClassName.current = initClassName(action.payload);
                break;
            case ActionType.SwitchVisibleStatusAction:
                if (showRef.current === action.payload.value) {
                    return;
                }
                if (showRef.current === undefined && action.payload.value === false) {
                    return;
                }
                showRef.current = action.payload.value;

                isTransition.current = action.payload.isTransition;

                if (animationName.current && ["taller", "wider"].includes(animationName.current)) {
                    setReady((pre) => {
                        return compareFn({ value: false, show: action.payload.value }, pre);
                    });
                } else {
                    setReady((pre) => {
                        return compareFn({ value: true, show: action.payload.value }, pre);
                    });
                }
                setShow(action.payload.value);
                break;

            case ActionType.InitSizeAction:
                // console.clear();
                if (showRef.current === action.payload.value) {
                    return;
                }
                if (showRef.current === undefined && action.payload.value === false) {
                    return;
                }

                showRef.current = action.payload.value;

                getSizeCallback.current = action.payload.callback;

                setReady((pre) => {
                    return compareFn({ value: false, show: action.payload.value }, pre);
                });

                break;

            case ActionType.AfterReadyAction:
                isTransition.current = action.payload.isTransition;
                setShow(action.payload.value);
                break;
        }
    }, []);
    return [dispatch, insertedClassName.current, addStyleRef.current];
};
