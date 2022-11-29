/**
 * @file
 * @date 2022-09-29
 * @author xuejie.he
 * @lastModify xuejie.he 2022-09-29
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { forwardRef, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { deepCloneData } from "../../unit";
import { useDropdownPropsContext } from "../Dropdown";
import { isCustom } from "../DropdownContent/Unit/isCustom";
import { TriggerProps } from "../Unit/type";
import { useDropdownContext } from "./../Dropdown/index";
import { useHashId } from "./../../Hooks/useHashId";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
export interface DropdownBtnProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Type of interaction
     */
    trigger?: TriggerProps | TriggerProps[];
    /**
     * children of this component
     */
    children?: React.ReactNode;
    /**
     * disable of this component
     */
    disable?: boolean;

    /**
     * dropdown拓展
     * 可以实现1对多、多对多的功能
     * 1、n 个btn 可以对应多个content 且事件可以分类管理
     */
    /**
     * hover事件对应的那个content、btn id
     */
    hoverId?: string;
    /**
     * focus事件对应的那个content、btn id
     */
    focusId?: string;
    /**
     * click事件对应的那个content、btn id
     */
    clickId?: string;
    /**
     * contextmenu事件对应的那个content、btn id
     */
    contextmenuId?: string;
}
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
export const DropdownBtn = forwardRef<HTMLDivElement, DropdownBtnProps>(
    (
        {
            trigger,
            onClick,
            onMouseEnter,
            onMouseLeave,
            onFocus,
            onBlur,
            onContextMenu,
            onMouseDown,
            children,
            disable,
            hoverId,
            focusId,
            onMouseUp,
            clickId,
            contextmenuId,
            ...props
        },
        ref,
    ) => {
        DropdownBtn.displayName = "DropdownBtn";
        /* <------------------------------------ **** STATE START **** ------------------------------------ */
        /************* This section will include this component HOOK function *************/

        const {
            trigger: triggerContext,
            eventName,
            show,
            disable: gDisable,
        } = useDropdownPropsContext();

        const { btnIsClickRef, setBtnIsClick, btn } = useDropdownContext();

        const id = useHashId();

        const triggerValue = useMemo(() => {
            return trigger ? trigger : triggerContext;
        }, [triggerContext, trigger]);

        const disableVal = useMemo(() => disable ?? gDisable, [disable, gDisable]);

        const setBtnIsClickFn = useRef(setBtnIsClick);
        /* <------------------------------------ **** STATE END **** ------------------------------------ */
        /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
        /************* This section will include this component parameter *************/

        useLayoutEffect(() => {
            setBtnIsClickFn.current = setBtnIsClick;
        }, [setBtnIsClick]);

        useEffect(() => {
            const event = new CustomEvent(eventName, {
                detail: {
                    event: "changeShow",
                    id,
                },
            });
            document.dispatchEvent(event);
        }, [show, eventName, id]);

        useEffect(() => {
            btnIsClickRef.current[id] = {
                clickId,
                contextmenuId,
                disable: disableVal,
                trigger: triggerValue,
            };
            setBtnIsClickFn.current((pre) => {
                if (JSON.stringify(pre) === JSON.stringify(btnIsClickRef.current)) {
                    return pre;
                }
                return deepCloneData(btnIsClickRef.current);
            });
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [clickId, contextmenuId, triggerValue, disableVal, eventName, id]);

        /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
        /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
        /************* This section will include this component general function *************/
        /**
         * 点击事件
         */
        const handleClick = () => {
            if (disableVal) {
                return;
            }

            if (triggerValue === "click" || triggerValue?.includes("click")) {
                const event = new CustomEvent(eventName, {
                    detail: {
                        event: "click",
                        id,
                        eventId: clickId,
                        //是否做内部的交互
                        /**
                         * 如果有自定义的展示状态
                         * 则取消内部的交互
                         */
                        todo: !isCustom(show),
                    },
                });
                document.dispatchEvent(event);
            }
        };

        /**
         * hover事件
         */
        const handleMouseEnter = () => {
            if (disableVal) {
                return;
            }
            /**
             * 如果有自定义的展示状态
             * 则取消内部的交互
             */
            if (isCustom(show)) {
                return;
            }
            if (triggerValue === "hover" || triggerValue?.includes("hover")) {
                const event = new CustomEvent(eventName, {
                    detail: {
                        event: "mouseenter",
                        id,
                        eventId: hoverId,
                    },
                });
                document.dispatchEvent(event);
            }
        };

        /**
         * hover事件
         */
        const handleMouseLeave = () => {
            if (disableVal) {
                return;
            }

            /**
             * 如果有自定义的展示状态
             * 则取消内部的交互
             */
            if (isCustom(show)) {
                return;
            }

            if (triggerValue === "hover" || triggerValue?.includes("hover")) {
                const event = new CustomEvent(eventName, {
                    detail: {
                        event: "mouseleave",
                        id,
                        eventId: hoverId,
                    },
                });
                document.dispatchEvent(event);
            }
        };

        /**
         * focus事件
         */
        const handleFocus = () => {
            if (disableVal) {
                return;
            }

            /**
             * 如果有自定义的展示状态
             * 则取消内部的交互
             */
            if (isCustom(show)) {
                return;
            }

            if (triggerValue === "focus" || triggerValue?.includes("focus")) {
                const event = new CustomEvent(eventName, {
                    detail: {
                        event: "focus",
                        id,
                        eventId: focusId,
                    },
                });
                document.dispatchEvent(event);
            }
        };

        /**
         * focus事件
         */
        const handleBlur = () => {
            if (disableVal) {
                return;
            }

            /**
             * 如果有自定义的展示状态
             * 则取消内部的交互
             */
            if (isCustom(show)) {
                return;
            }

            if (triggerValue === "focus" || triggerValue?.includes("focus")) {
                const event = new CustomEvent(eventName, {
                    detail: {
                        event: "blur",
                        id,
                        eventId: focusId,
                    },
                });
                document.dispatchEvent(event);
            }
        };

        /**
         * contextmenu事件
         */
        const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
            if (disableVal) {
                return;
            }

            if (triggerValue === "contextmenu" || triggerValue?.includes("contextmenu")) {
                e.preventDefault();
                const event = new CustomEvent(eventName, {
                    detail: {
                        event: "contextmenu",
                        id,
                        eventId: contextmenuId,
                        //是否做内部的交互
                        /**
                         * 如果有自定义的展示状态
                         * 则取消内部的交互
                         */
                        todo: !isCustom(show),
                    },
                });
                document.dispatchEvent(event);
            }
        };

        /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
        return (
            <div
                ref={(el) => {
                    btn.current[id] = el;
                    if (typeof ref === "function") {
                        ref(el);
                    } else if (ref !== null) {
                        ref.current = el;
                    }
                }}
                onClick={(e) => {
                    onClick?.(e);
                    handleClick();
                }}
                onMouseEnter={(e) => {
                    onMouseEnter?.(e);
                    handleMouseEnter();
                }}
                onMouseLeave={(e) => {
                    onMouseLeave?.(e);
                    handleMouseLeave();
                }}
                onMouseDown={(e) => {
                    onMouseDown?.(e);
                }}
                onMouseUp={(e) => {
                    onMouseUp?.(e);
                }}
                onFocus={(e) => {
                    onFocus?.(e);
                    handleFocus();
                }}
                onBlur={(e) => {
                    onBlur?.(e);
                    handleBlur();
                }}
                tabIndex={
                    triggerValue === "focus" || triggerValue?.includes("focus") ? -1 : undefined
                }
                onContextMenu={(e) => {
                    onContextMenu?.(e);
                    handleContextMenu(e);
                }}
                {...props}
            >
                {children}
            </div>
        );
    },
);
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
DropdownBtn.displayName = "DropdownBtn";
