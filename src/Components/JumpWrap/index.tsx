/**
 * @file
 * @date 2022-08-25
 * @author xuejie.he
 * @lastModify xuejie.he 2022-08-25
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { useEffect, useRef, useState } from "react";
import { ScrollComponent, ScrollProps } from "../Scroll";
import { JumpContext } from "../Group/Unit/context";
import { useHashId } from "./../../Hooks/useHashId";
import "./style.scss";
import { getScrollBody } from "./Unit/getScrollBody";
import Triangle from "./Unit/triangle";
import { getElements, useActiveStatus } from "./Unit/useActiveStatus";
import { findParent } from "./Unit/findParent";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const JumpWrap: React.FC<ScrollProps> = ({ children, style, ...props }) => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/

    const id = useHashId("jumpWrap");

    const ref = useRef<HTMLDivElement | null>(null);

    const timer = useRef<number>();

    const [loading, setLoading] = useState(true);

    const { show, topActive, bottomActive, activeIndex, isBottom, update } = useActiveStatus(
        ref,
        id,
    );
    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/

    useEffect(() => {
        void document.fonts.ready.then(() => {
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        return () => {
            timer.current && window.clearTimeout(timer.current);
        };
    }, []);

    useEffect(() => {
        if (!loading) {
            update.current();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading]);

    useEffect(() => {
        let timer: null | number = null;
        const mainFn = () => {
            timer && window.clearTimeout(timer);
            timer = window.setTimeout(update.current);
        };

        window.addEventListener("resize", mainFn);
        return () => {
            window.removeEventListener("resize", mainFn);
            timer && window.clearTimeout(timer);
        };
    }, [update]);

    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/
    const jumpTo = (n: number) => {
        const scrollBody = getScrollBody(ref.current);
        if (!scrollBody) {
            return;
        }

        const arr = getElements(id);

        let index = n;
        if (index < 0) {
            index = 0;
        } else if (index >= arr.length) {
            index = arr.length - 1;
        }

        const toEl = document.querySelector(`.${id}[data-index="${index}"]`);
        if (toEl instanceof HTMLElement) {
            scrollBody.scrollTo({
                top: findParent(toEl, scrollBody),
                behavior: "smooth",
            });
        }
    };

    const handleScroll = () => {
        timer.current && window.clearTimeout(timer.current);
        timer.current = window.setTimeout(update.current, 50);
    };

    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    return (
        <JumpContext.Provider value={id}>
            <ScrollComponent
                handleBarChange={handleScroll}
                style={style}
                ref={ref}
                hidden={{ x: true }}
                {...props}
            >
                {children}
            </ScrollComponent>
            {show && (
                <div className="floating_button">
                    <div
                        className="toTop_button"
                        onClick={(e) => {
                            if (!topActive || !e.nativeEvent.cancelable) {
                                return;
                            }

                            jumpTo(activeIndex.current - 1);
                        }}
                    >
                        <Triangle
                            className="top_triangle"
                            color={topActive ? "#4D4D4D" : "#EBEBEB"}
                        />
                    </div>
                    <div
                        className="toBottom_button"
                        onClick={(e) => {
                            if (!bottomActive || isBottom || !e.nativeEvent.cancelable) {
                                return;
                            }
                            jumpTo(activeIndex.current + 1);
                        }}
                    >
                        <Triangle
                            className="bottom_triangle"
                            color={bottomActive && !isBottom ? "#4D4D4D" : "#EBEBEB"}
                        />
                    </div>
                </div>
            )}
        </JumpContext.Provider>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default JumpWrap;
