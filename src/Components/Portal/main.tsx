/**
 * @file
 * @date 2022-10-19
 * @author xuejie.he
 * @lastModify xuejie.he 2022-10-19
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { forwardRef, memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { addEventList, EventParams, removeEventList } from "./Unit/eventListener";
import { mountElement } from "./Unit/mount";
import { ActionType, useCssTransition } from "../Hooks/useCssTransition";
import { setStyle } from "../Transition/Unit/addStyle";
import { AutoPositionResult, main } from "../Kite/Unit/autoPosition";
import { getScrollValue } from "../Kite/Unit/getScrollValue";
import { getTriangle } from "../Kite/Unit/getTriangle";
import { listenDomChange } from "../Kite/Unit/listenDomChange";
import { toFixed } from "../Kite/Unit/toFixed";
import { getTransitionClass, TransitionClassProps } from "../Kite/Unit/transitionClass";
import Triangle from "../Kite/Unit/triangle";
import { MainProps, SizeProps } from "../Kite/Unit/type";
import "./style.scss";
import { deepCloneData } from "../../unit";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
interface TempProps
    extends React.HTMLAttributes<HTMLDivElement>,
        Omit<MainProps, "handlePositionChange"> {
    root?: Element;
    show?: boolean;
    hashId?: string;
    children?: React.ReactNode;
    isTransition: boolean;
}
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const Temp = forwardRef<HTMLDivElement, TempProps>(
    (
        {
            root,
            placement = "cb",
            direction = "vertical",
            offset,
            triangle,
            animate,

            handleTransitionStart,
            handleTransitionEnd,
            handleTransitionCancel,
            style,
            className,
            mount,
            show,
            hashId,
            bodyClassName,
            isTransition,
            children,
            ...props
        },
        ref,
    ) => {
        Temp.displayName = "PositionPortal";
        /* <------------------------------------ **** STATE START **** ------------------------------------ */
        /************* This section will include this component HOOK function *************/

        const positionalRef = useRef<string>();
        const [positional, setPositional] = useState<AutoPositionResult>();
        const autoPositionFn = useRef(main());
        const transitionEnd = useRef(true);

        const [initStyle, setInitStyle] = useState(style);

        /**
         * 用来diff比较
         */
        const portalSize = useRef<SizeProps>();
        const triangleSize = useRef<SizeProps>();
        /**
         * root节点的属性
         */
        const rootAttr = useRef<{
            width: number;
            height: number;
            left: number;
            top: number;
        }>();

        const directionRef = useRef(direction);
        const placementRef = useRef(placement);
        const portalOffsetRef = useRef(offset);
        const triangleOffsetRef = useRef(triangle);
        const animationRef = useRef(animate);
        const styleRef = useRef(style);
        const rootRef = useRef(root);
        const mountRef = useRef(mount);

        const portalRef = useRef<HTMLDivElement | null>(null);

        const oldShow = useRef<boolean>();

        const [refresh, setRefresh] = useState(0);

        const [dispatch, currentClassName, currentStyle] = useCssTransition(
            initStyle,
            () => {
                handleTransitionStart?.();
            },
            () => {
                handleTransitionEnd?.();
                transitionEnd.current = true;
                setRefresh((pre) => ++pre);
            },

            () => {
                handleTransitionCancel?.();
            },
            portalRef.current,
        );

        const dispatchRef = useRef(dispatch);

        const needSwitchVisible = useRef(false);

        const isTransitionRef = useRef(isTransition);

        /* <------------------------------------ **** STATE END **** ------------------------------------ */
        /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
        /************* This section will include this component parameter *************/

        /**
         * 将监听的数据转化为静态变量
         * start
         */
        useLayoutEffect(() => {
            rootRef.current = root;
        }, [root]);
        useLayoutEffect(() => {
            directionRef.current = direction;
        }, [direction]);
        useLayoutEffect(() => {
            dispatchRef.current = dispatch;
        }, [dispatch]);
        useLayoutEffect(() => {
            placementRef.current = placement;
        }, [placement]);
        useLayoutEffect(() => {
            portalOffsetRef.current = offset;
        }, [offset]);
        useLayoutEffect(() => {
            triangleOffsetRef.current = triangle;
        }, [triangle]);
        useLayoutEffect(() => {
            animationRef.current = animate;
        }, [animate]);
        useLayoutEffect(() => {
            styleRef.current = style;
        }, [style]);
        useLayoutEffect(() => {
            mountRef.current = mount;
        }, [mount]);
        useLayoutEffect(() => {
            isTransitionRef.current = isTransition;
        }, [isTransition]);

        /**
         * end
         * 将监听的数据转化为静态变量
         */

        useLayoutEffect(() => {
            return () => {
                needSwitchVisible.current = false;
                oldShow.current === undefined;
            };
        }, []);

        useEffect(() => {
            if (typeof show === "boolean") {
                const setSize = (el: HTMLDivElement | null) => {
                    if (!el) {
                        return;
                    }
                    const rect = el.getBoundingClientRect();
                    portalSize.current = {
                        width: rect.width,
                        height: rect.height,
                    };

                    const triangleNode = getTriangle(el, "kite_triangle");
                    if (triangleNode) {
                        const _rect = triangleNode.getBoundingClientRect();
                        triangleSize.current = {
                            width: _rect.width,
                            height: _rect.height,
                        };
                    }
                    needSwitchVisible.current = true;

                    setRefresh((pre) => ++pre);
                };

                if (oldShow.current === undefined && show === false) {
                    false;
                } else {
                    transitionEnd.current = false;
                    dispatchRef.current({
                        type: ActionType.InitSizeAction,
                        payload: {
                            value: show,
                            callback: setSize,
                        },
                    });
                }
            }

            oldShow.current = show;
        }, [show]);

        useEffect(() => {
            const diffChild = () => {
                const el = portalRef.current;
                if (!el || window.getComputedStyle(el, null).display === "none") {
                    return;
                }

                const rect = el.getBoundingClientRect();

                portalSize.current = {
                    width: rect.width,
                    height: rect.height,
                };
            };

            const diffRoot = () => {
                const el = rootRef.current;
                if (!el) {
                    return;
                }

                const rect = el.getBoundingClientRect();

                rootAttr.current = {
                    width: rect.width,
                    height: rect.height,
                    left: rect.left,
                    top: rect.top,
                };
            };

            const mainFn = () => {
                if (!oldShow.current || !transitionEnd.current) {
                    return;
                }
                diffChild();
                diffRoot();
                setRefresh((pre) => ++pre);
            };

            let timer: null | number = null;
            const resizeFn = () => {
                timer && window.clearTimeout(timer);
                timer = window.setTimeout(() => {
                    timer = null;
                    mainFn();
                });
            };

            const event: EventParams[] = [
                {
                    type: "scroll",
                    listener: mainFn,
                    option: true,
                },
                {
                    type: "resize",
                    listener: resizeFn,
                },
            ];

            addEventList(window, event);

            return () => {
                timer && window.clearTimeout(timer);
                removeEventList(window, event);
            };
        }, []);
        /**
         * 监听 kite的root element的变化
         * 如果 top、left、width、height和之前不同 就得重新计算位置
         */
        useLayoutEffect(() => {
            const fn = () => {
                if (!root || !oldShow.current || !transitionEnd.current) {
                    return;
                }

                const rect = root.getBoundingClientRect();

                const data = rootAttr.current;
                if (
                    data &&
                    rect.top === data.top &&
                    rect.left === data.left &&
                    rect.width === data.width &&
                    rect.height === data.height
                ) {
                    return;
                }

                rootAttr.current = {
                    width: rect.width,
                    height: rect.height,
                    left: rect.left,
                    top: rect.top,
                };
                // 计算fn
                setRefresh((pre) => ++pre);
            };

            let observer: MutationObserver | null = null;

            if (root) {
                const rect = root.getBoundingClientRect();
                rootAttr.current = {
                    width: rect.width,
                    height: rect.height,
                    left: rect.left,
                    top: rect.top,
                };
                observer = listenDomChange(root, fn);
            }
            return () => {
                observer?.disconnect();
            };
        }, [root]);

        /**
         * 比较children element的变化
         */
        useEffect(() => {
            const fn = () => {
                const el = portalRef.current;
                if (!el || !oldShow.current || !transitionEnd.current) {
                    return;
                }

                const rect = el.getBoundingClientRect();
                if (
                    portalSize.current &&
                    rect.width === portalSize.current.width &&
                    rect.height === portalSize.current.height
                ) {
                    return;
                }
                // 计算fn
                portalSize.current = {
                    width: rect.width,
                    height: rect.height,
                };
                setRefresh((pre) => ++pre);
            };

            let observer: MutationObserver | null = null;

            if (portalRef.current) {
                observer = listenDomChange(portalRef.current, fn);
            }
            return () => {
                observer?.disconnect();
            };
        }, []);

        useEffect(() => {
            if (oldShow.current && transitionEnd.current) {
                setRefresh((pre) => ++pre);
            }
        }, [root, direction, placement, offset, triangle, mount]);

        useEffect(() => {
            const portal = portalRef.current;
            const btn = rootRef.current;
            /**
             * 设置portal的位置
             */
            const setLatLng = (res: AutoPositionResult | undefined) => {
                if (res) {
                    let left = toFixed(res.menu[0]);
                    let top = toFixed(res.menu[1]);
                    if (mountRef.current) {
                        const pRect = mountRef.current.getBoundingClientRect();
                        const scrollData = getScrollValue();

                        if (pRect) {
                            const x = pRect.left + scrollData.x;
                            const y = pRect.top + scrollData.y;
                            left = toFixed(res.menu[0] - x);
                            top = toFixed(res.menu[1] - y);
                        }
                    }

                    if (portal) {
                        setStyle(
                            portal,
                            Object.assign({}, styleRef.current, {
                                left: `${left}px`,
                                top: `${top}px`,
                            }),
                        );
                    }
                    setInitStyle(
                        Object.assign({}, styleRef.current, {
                            left: `${left}px`,
                            top: `${top}px`,
                        }),
                    );
                }
            };

            /***
             * 赋值过渡所需要的class name
             */
            const setTransitionClass = (position: AutoPositionResult | undefined) => {
                let classList: undefined | TransitionClassProps = undefined;

                const arr = placementRef.current.split("");
                const x = arr[0] as "l" | "r" | "c";
                const y = arr[1] as "t" | "b" | "c";
                switch (directionRef.current) {
                    case "horizontal":
                        if (x === "l") {
                            classList = position?.reverse
                                ? getTransitionClass("r", y, directionRef.current)
                                : getTransitionClass("l", y, directionRef.current);
                        } else {
                            classList = position?.reverse
                                ? getTransitionClass("l", y, directionRef.current)
                                : getTransitionClass("r", y, directionRef.current);
                        }
                        break;
                    case "vertical":
                        if (y === "t") {
                            classList = position?.reverse
                                ? getTransitionClass(x, "b", directionRef.current)
                                : getTransitionClass(x, "t", directionRef.current);
                        } else {
                            classList = position?.reverse
                                ? getTransitionClass(x, "t", directionRef.current)
                                : getTransitionClass(x, "b", directionRef.current);
                        }
                        break;
                }
                dispatchRef.current({
                    type: ActionType.SetClassNameAction,
                    payload: {
                        type: animationRef.current,
                        enterActive: classList.enter.active,
                        toEnter: classList.enter.to,
                        fromEnter: classList.enter.from,
                        leaveActive: classList.leave.active,
                        toLeave: classList.leave.to,
                        fromLeave: classList.leave.from,
                    },
                });
            };

            /**
             * 计算位置
             */

            if (refresh && typeof oldShow.current === "boolean" && btn) {
                const btnRect = btn.getBoundingClientRect();
                let data: AutoPositionResult | undefined = undefined;
                if (btnRect && portalSize.current) {
                    data = autoPositionFn.current({
                        btnRect,
                        triangleSize: [
                            triangleSize.current?.width ?? 0,
                            triangleSize.current?.height ?? 0,
                        ],
                        menuSize: portalSize.current,
                        direction: directionRef.current,
                        placement: placementRef.current,
                        offset: {
                            menu: portalOffsetRef.current,
                            triangle: triangleOffsetRef.current?.offset,
                        },
                    });
                }
                if (JSON.stringify(data) !== positionalRef.current) {
                    positionalRef.current = JSON.stringify(data);
                    setPositional(data ? { ...data } : undefined);
                    setLatLng(data);
                    setTransitionClass(data);
                }
                if (needSwitchVisible.current) {
                    dispatchRef.current({
                        type: ActionType.AfterReadyAction,
                        payload: {
                            value: oldShow.current,
                            isTransition: isTransitionRef.current,
                        },
                    });
                    needSwitchVisible.current = false;
                }
            }
        }, [refresh]);

        /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
        /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
        /************* This section will include this component general function *************/

        const getClassName = () => {
            const arr = [
                `kite_${direction}${placement.slice(0, 1).toUpperCase()}${placement.slice(1, 2)}`,
                ...deepCloneData(currentClassName),
            ];

            if (positional?.reverse) {
                arr.push("kite_reverse");
            }
            return arr.join(" ") + (className ? ` ${className}` : "");
        };

        /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
        return createPortal(
            <div
                key={hashId ? `${hashId}-main` : undefined}
                className={getClassName()}
                ref={(el) => {
                    portalRef.current = el;

                    if (typeof ref === "function") {
                        ref(el);
                    } else if (ref !== null) {
                        (ref as React.MutableRefObject<HTMLElement | null>).current = el;
                    }
                }}
                style={{ ...style, ...currentStyle }}
                {...props}
            >
                <Triangle
                    className={"kite_triangle"}
                    attr={triangle}
                    position={positional}
                    d={direction}
                    placement={placement}
                />

                <div className={"kite_body" + (bodyClassName ? ` ${bodyClassName}` : "")}>
                    {children}
                </div>
            </div>,
            mountElement(mount),
        );
    },
);
Temp.displayName = "PositionPortal";
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default memo(Temp);
