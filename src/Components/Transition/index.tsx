/**
 * @file transition component
 * @date 2021-11-26
 * @author xuejie.he
 * @lastModify xuejie.he 2021-11-26
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import { deepCloneData } from "../../unit";
import { ActionType, useCssTransition } from "../Hooks/useCssTransition";

/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */

export interface TransitionProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * is child component visible
     */
    show: boolean;
    /**
     * enter className
     * * Intersection of fromEnter and toEnter
     */
    enterActive?: string;
    /**
     * leave className
     * * Intersection of fromLeave and toLeave
     */
    leaveActive?: string;
    /**
     * ClassName when entering
     */
    toEnter?: string;
    /**
     * ClassName when leaving
     */
    toLeave?: string;
    /**
     * ClassName when starting to enter
     */
    fromEnter?: string;
    /**
     * ClassName when starting to leave
     */
    fromLeave?: string;
    /**
     * children of ReactNode
     */
    children?: React.ReactNode;
    /**
     * first animation
     */
    firstAnimation?: boolean;
    /**
     * The component library encapsulates several default animation libraries
     */
    animationType?:
        | "fade"
        | "zoom"
        | "taller"
        | "wider"
        | "inLeft"
        | "inRight"
        | "inTop"
        | "inBottom"
        | "slideDown"
        | "slideUp"
        | "slideLeft"
        | "slideRight";
    /**
     * ontransitionEnd callback
     */
    handleTransitionEnd?: () => void;

    /**
     * Remove when the element is hidden
     */
    removeOnHidden?: boolean;
    /**
     * Cache only works if removeOnHidden=true.
     * When cache=true, as long as the element has been rendered, it will no longer be removed.  The opposite is the state of cache=false.
     */
    cache?: boolean;
    /**
     * transitionStart callback
     */
    handleTransitionStart?: () => void;
    /**
     * transition cancel callback
     */
    handleTransitionCancel?: () => void;
}
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
export const Transition = forwardRef<HTMLDivElement, TransitionProps>(
    (
        {
            show,
            children,
            firstAnimation = false,
            handleTransitionEnd,
            handleTransitionStart,
            handleTransitionCancel,
            removeOnHidden = false,
            cache,
            ...props
        },
        ref,
    ) => {
        Transition.displayName = "Transition";
        /* <------------------------------------ **** HOOKS START **** ------------------------------------ */
        /************* This section will include this component HOOK function *************/

        /**
         * 计数器
         * 看看第几次转为可见状态
         */
        const count = useRef(0);

        /***
         * 记录上一次的show的状态
         */
        const oldShow = useRef<boolean>();

        /**
         * 过渡动画是否结束
         */
        const [, setTransitionEnd] = useState<boolean>();
        const transitionEndRef = useRef<boolean>();

        /* <------------------------------------ **** HOOKS END **** ------------------------------------ */

        useLayoutEffect(() => {
            return () => {
                oldShow.current = undefined;
            };
        }, []);

        {
            if (show !== oldShow.current) {
                const value = oldShow.current === undefined && show === false;
                setTransitionEnd(value);
                transitionEndRef.current = value;

                oldShow.current = show;

                if (show) {
                    ++count.current;
                }
            }
        }

        const haveTransition = () => {
            if (count.current) {
                return true;
            }

            return firstAnimation;
        };

        const endFn = () => {
            const value = show ? undefined : true;
            setTransitionEnd(value);
            transitionEndRef.current = value;
        };

        const node = (): React.ReactNode => (
            <Main
                show={show}
                ref={ref}
                isTransition={haveTransition()}
                handleTransitionStart={handleTransitionStart}
                handleTransitionEnd={() => {
                    handleTransitionEnd?.();
                    endFn();
                }}
                handleTransitionCancel={() => {
                    handleTransitionCancel?.();
                    endFn();
                }}
                {...props}
            >
                {children}
            </Main>
        );

        if (show) {
            return <>{node()}</>;
        }

        if (transitionEndRef.current && removeOnHidden && !cache) {
            return <></>;
        }

        if (transitionEndRef.current && removeOnHidden && cache && !count.current) {
            return <></>;
        }
        return <>{node()}</>;
    },
);
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
Transition.displayName = "Transition";

const Main = forwardRef<
    HTMLDivElement,
    Omit<TransitionProps, "removeOnHidden" | "cache" | "firstAnimation"> & { isTransition: boolean }
>(
    (
        {
            className,
            style,
            children,
            handleTransitionStart,
            handleTransitionEnd,
            handleTransitionCancel,
            animationType,
            enterActive,
            fromEnter,
            fromLeave,
            leaveActive,
            toEnter,
            toLeave,
            show,
            isTransition,
            ...props
        },
        ref,
    ) => {
        Main.displayName = "Main";
        const cloneRef = useRef<HTMLDivElement | null>(null);

        const [dispatch, classList, currentStyle] = useCssTransition(
            style,
            handleTransitionStart,
            handleTransitionEnd,
            handleTransitionCancel,
            cloneRef.current,
        );

        const dispatchRef = useRef(dispatch);

        const isTransitionRef = useRef(isTransition);

        useLayoutEffect(() => {
            isTransitionRef.current = isTransition;
        }, [isTransition]);

        useLayoutEffect(() => {
            dispatchRef.current({
                type: ActionType.SetClassNameAction,
                payload: {
                    type: animationType,
                    enterActive,
                    fromEnter,
                    fromLeave,
                    leaveActive,
                    toEnter,
                    toLeave,
                },
            });
        }, [animationType, enterActive, fromEnter, fromLeave, leaveActive, toEnter, toLeave]);

        useLayoutEffect(() => {
            dispatchRef.current = dispatch;
        }, [dispatch]);

        useEffect(() => {
            dispatchRef.current({
                type: ActionType.SwitchVisibleStatusAction,
                payload: {
                    value: show,
                    isTransition: isTransitionRef.current,
                },
            });
        }, [show]);

        const setClassName = () => {
            const arr = deepCloneData(classList);
            return arr.join(" ") + (className ? ` ${className}` : "");
        };

        return (
            <div
                ref={(el) => {
                    cloneRef.current = el;
                    if (typeof ref === "function") {
                        ref(el);
                    } else if (ref !== null) {
                        (ref as React.MutableRefObject<HTMLElement | null>).current = el;
                    }
                }}
                style={{ ...style, ...currentStyle }}
                className={setClassName()}
                {...props}
            >
                {children}
            </div>
        );
    },
);

Main.displayName = "Main";
