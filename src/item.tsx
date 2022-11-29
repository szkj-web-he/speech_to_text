/**
 * @file
 * @date 2022-08-08
 * @author xuejie.he
 * @lastModify xuejie.he 2022-08-08
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import { useTouch } from "./Hooks/useTouch";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { drawBar, drawRadian, drawRing, getAngle, getScrollValue, pointOnCircle } from "./unit";
import { Col } from "./Components/Col";
import { OptionProps } from "./type";
import { getColor } from "./unit";
import { Dropdown } from "./Components/Dropdown";
import { DropdownBtn } from "./Components/DropdownBtn";
import { DropdownContent } from "./Components/DropdownContent";

/* 
<------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
interface TempProps {
    data: OptionProps;

    span: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

    mobileStatus: boolean;

    score: number;

    setScore: (res: number) => void;
}
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const Temp: React.FC<TempProps> = ({ data, score, setScore, span, mobileStatus }) => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/

    const c2d = useRef<CanvasRenderingContext2D | null>(null);

    const borderWidth = useMemo(() => {
        if (span === 3) {
            return 15;
        }
        if (span === 2 && mobileStatus) {
            return 12;
        }
        return 16;
    }, [mobileStatus, span]);

    const [moveScore, setMoveScore] = useState(0);

    const [moveStatus, setMoveStatus] = useState(false);

    const timer = useRef<number>();

    const scoreRef = useRef(score);

    const selectStartFn = useRef<typeof document.onselectstart | null>(null);

    const destroy = useRef(false);

    const ref = useTouch(borderWidth, setMoveScore, setMoveStatus, timer, setScore, () => {
        timer.current && window.clearTimeout(timer.current);

        const c = ref.current;
        if (!c) {
            return;
        }

        const ctx = c.getContext("2d");
        if (!ctx) {
            return;
        }

        if (score > 0) {
            drawRadian(c, borderWidth, score / 100, `rgb(${getColor(score / 100).join(",")})`);
        } else {
            drawRing(ctx, borderWidth);
        }
        drawBar(c, borderWidth, score / 100);
    });

    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/

    useLayoutEffect(() => {
        scoreRef.current = score;
    }, [score]);

    useEffect(() => {
        const draw = () => {
            if (c2d.current) {
                c2d.current.clearRect(0, 0, c2d.current.canvas.width, c2d.current.canvas.height);
            }
            const c = ref.current;
            if (!c) {
                return;
            }
            const parent = c.parentElement?.parentElement;
            if (!parent) {
                return;
            }

            const rect = parent.getBoundingClientRect();
            c.width = rect.width;
            c.height = rect.width;
            const ctx = (c2d.current = c.getContext("2d"));
            if (!ctx) {
                return;
            }
            if (scoreRef.current > 0) {
                drawRadian(
                    c,
                    borderWidth,
                    scoreRef.current / 100,
                    `rgb(${getColor(scoreRef.current / 100).join(",")})`,
                );
            } else {
                drawRing(ctx, borderWidth);
            }
            drawBar(c, borderWidth, scoreRef.current / 100);
        };

        let timer: null | number = null;
        const resizeFn = () => {
            timer && window.clearTimeout(timer);
            timer = window.setTimeout(() => {
                timer = null;
                draw();
            });
        };

        window.addEventListener("resize", resizeFn);
        draw();
        return () => {
            window.removeEventListener("resize", resizeFn);
            timer && window.clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [borderWidth]);

    useEffect(() => {
        destroy.current = false;
        return () => {
            destroy.current = true;
            timer.current && window.clearTimeout(timer.current);
        };
    }, []);

    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/

    /**
     * 画
     * @param el
     * @param x
     * @param y
     */
    const draw = (el: HTMLCanvasElement, x: number, y: number) => {
        const size = el.offsetWidth;
        const rect = el.getBoundingClientRect();
        const scrollData = getScrollValue();
        const left = x - (rect.left + scrollData.x);
        const top = y - (rect.top + scrollData.y);
        const r = size / 2 - 5;
        const value = getAngle(size / 2, size / 2, r, left, top);

        drawRadian(el, borderWidth, value, `rgba(${getColor(value).join(",")},0.3)`);
        setMoveScore(Math.round(value * 100));
    };

    /**
     * 预设值
     */
    const preset = (el: HTMLCanvasElement, x: number, y: number) => {
        timer.current && window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => {
            if (destroy.current) {
                return;
            }
            draw(el, x, y);
        });
    };

    /**
     * 还原
     */
    const reset = () => {
        timer.current && window.clearTimeout(timer.current);

        const c = ref.current;
        if (!c) {
            return;
        }

        const ctx = c.getContext("2d");
        if (!ctx) {
            return;
        }

        if (score > 0) {
            drawRadian(c, borderWidth, score / 100, `rgb(${getColor(score / 100).join(",")})`);
        } else {
            drawRing(ctx, borderWidth);
        }
        drawBar(c, borderWidth, score / 100);
    };
    /**
     * 确认值
     */
    const confirm = (el: HTMLCanvasElement, x: number, y: number) => {
        const size = el.offsetWidth;

        const rect = el.getBoundingClientRect();
        const scrollData = getScrollValue();
        const left = x - (rect.left + scrollData.x);
        const top = y - (rect.top + scrollData.y);
        const r = size / 2 - 5;
        const value = getAngle(size / 2, size / 2, r, left, top);

        drawRadian(el, borderWidth, value, `rgb(${getColor(value).join(",")})`);
        drawBar(el, borderWidth, value);
        setScore(Math.round(value * 100));
    };

    /**
     * 鼠标移动时
     * @param e
     * @returns
     */
    const handleMouseMove = (e: MouseEvent) => {
        if (mobileStatus) {
            return;
        }
        const el = ref.current;
        if (!el) {
            return;
        }
        preset(el, e.pageX, e.pageY);
    };

    /**
     * 移除监听
     */
    const removeHandle = () => {
        document.removeEventListener("mousemove", handleMouseMove, true);
        document.removeEventListener("mouseup", handleMouseUp, true);
        window.removeEventListener("blur", handleMouseCancel);
        document.onselectstart = selectStartFn.current;
        selectStartFn.current = null;
    };

    /**
     * 鼠标松开时
     */
    const handleMouseUp = (e: MouseEvent) => {
        removeHandle();
        if (mobileStatus) {
            return;
        }
        const el = ref.current;
        if (!el) {
            return;
        }

        timer.current && window.clearTimeout(timer.current);
        confirm(el, e.pageX, e.pageY);
        setMoveStatus(false);
    };
    /**
     * 取消确认时
     */
    const handleMouseCancel = () => {
        removeHandle();
        if (mobileStatus) {
            return;
        }
        timer.current && window.clearTimeout(timer.current);
        setMoveStatus(false);
        reset();
    };
    /**
     * 当鼠标按下时
     * @param e
     * @returns
     */
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!e.cancelable || mobileStatus) {
            return;
        }

        const status = pointOnCircle(e.currentTarget, e.pageX, e.pageY, borderWidth);

        if (!status) {
            return;
        }

        setMoveStatus(true);
        timer.current && window.clearTimeout(timer.current);
        draw(e.currentTarget, e.pageX, e.pageY);
        selectStartFn.current = document.onselectstart;
        document.onselectstart = () => false;
        window.getSelection()?.removeAllRanges();

        document.addEventListener("mousemove", handleMouseMove, true);
        document.addEventListener("mouseup", handleMouseUp, true);
        window.addEventListener("blur", handleMouseCancel);
    };
    const scoreValue = moveStatus ? moveScore : score;
    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    return (
        <Col className={`item`} span={span}>
            <div className={`item_content`}>
                <canvas ref={ref} className={"item_canvas"} onMouseDown={handleMouseDown} />
                <span
                    className={`item_value`}
                    style={
                        scoreValue ? { color: `rgb(${getColor(scoreValue / 100).join(",")})` } : {}
                    }
                >
                    {scoreValue}
                </span>
            </div>
            <Dropdown trigger={"hover"}>
                <DropdownBtn className="item_name">
                    <span dangerouslySetInnerHTML={{ __html: data.content }} />
                </DropdownBtn>
                <DropdownContent bodyClassName="dropdown_bodyContainer">
                    <div
                        dangerouslySetInnerHTML={{ __html: data.content }}
                        className="dropdown_content"
                    />
                </DropdownContent>
            </Dropdown>
        </Col>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Temp;
