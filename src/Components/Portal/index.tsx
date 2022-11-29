/**
 * @file
 * @date 2021-12-13
 * @author xuejie.he
 * @lastModify xuejie.he 2021-12-13
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { forwardRef, useLayoutEffect, useRef, useState } from "react";
import { MainProps } from "../Kite/Unit/type";
import Main from "./main";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
interface TempProps extends Omit<MainProps, "handlePositionChange"> {
    /**
     *
     */
    hashId?: string;

    /**
     * root节点
     */
    root?: Element;
    /**
     * show of Portal
     */
    show: boolean;
    /**
     * Remove when the element is hidden
     */
    removeOnHidden?: boolean;
    /**
     * Cache only works if removeOnHidden=true.
     * When cache=true, as long as the element has been rendered, it will no longer be removed.  The opposite is the state of cache=false.
     */
    cache?: boolean;
}

/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const Temp = forwardRef<HTMLDivElement, TempProps>(
    (
        {
            children,
            show,
            removeOnHidden = true,
            cache = true,
            handleTransitionEnd,
            handleTransitionStart,
            handleTransitionCancel,
            ...props
        },
        ref,
    ) => {
        Temp.displayName = "Portal";
        /* <------------------------------------ **** STATE START **** ------------------------------------ */
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
        /* <------------------------------------ **** STATE END **** ------------------------------------ */
        /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
        /************* This section will include this component parameter *************/

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

            return show;
        };

        const endFn = () => {
            const value = show ? undefined : true;
            setTransitionEnd(value);
            transitionEndRef.current = value;
        };
        /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
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
Temp.displayName = "Portal";
export default Temp;
