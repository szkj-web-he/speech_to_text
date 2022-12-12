/**
 * @file
 * @date 2022-08-08
 * @author xuejie.he
 * @lastModify xuejie.he 2022-08-08
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { useEffect, useRef, useState } from "react";
import { Dropdown } from "./Components/Dropdown";
import { DropdownBtn } from "./Components/DropdownBtn";
import { DropdownContent } from "./Components/DropdownContent";
import Mike from "./Components/Icon/mikeIcon";
import { useMediaDevices } from "./Hooks/useMediaDevices";
import Timer from "./timer";
import { OptionProps } from "./type";
import { useMobile } from "./Components/Scroll/Unit/useMobile";
import { useLayoutEffect } from "react";

/* 
<------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
interface TempProps {
    /**
     *
     */
    show: boolean;

    setShow: (value: boolean) => void;
    /**
     * 当前的选项的值
     */
    data: OptionProps;
    /**
     * value
     */
    defaultValue: string;
    /**
     * value改变
     */
    setValue: (res: string) => void;

    /**
     * 是不是独生子
     */
    isOnly: boolean;
}
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const Temp: React.FC<TempProps> = ({ show, setShow, data, defaultValue, setValue, isOnly }) => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/
    // const [start, setStart] = useState(false);

    const messageData = useRef<{ value: string; start: number }>();

    const timer = useRef<number>();

    const mobileStatus = useMobile();

    const delayTimer = useRef<number>();

    const [delayLoading, setDelayLoading] = useState(false);

    const destroy = useRef(false);

    const [fn, isPending] = useMediaDevices(
        (res) => {
            const node = ref.current;
            if (!node) {
                return;
            }
            let msgData = messageData.current ? { ...messageData.current } : undefined;

            const value = node.value;
            const valArr = value.split("");

            const rangeStart = node.selectionStart;
            const rangeEnd = node.selectionEnd;
            let point = 0;

            if (msgData) {
                valArr.splice(msgData.start, msgData.value.length, res.value);
                point = msgData.start + res.value.length;
            } else {
                if (rangeStart === rangeEnd) {
                    valArr.splice(rangeStart, 0, res.value);
                } else {
                    valArr.splice(rangeStart, rangeEnd - rangeStart, res.value);
                }
                point = rangeStart + res.value.length;
            }

            if (res.type === "1") {
                msgData = { start: msgData?.start ?? rangeStart, value: res.value };
            } else {
                msgData = undefined;
            }

            messageData.current = msgData;
            node.value = valArr.join("");

            node.setSelectionRange(point, point);
            setValue(node.value);
        },
        () => {
            setShow(false);
            setDelayLoading(true);
            delayTimer.current = window.setTimeout(() => {
                if (destroy.current) {
                    return;
                }
                setDelayLoading(false);
            }, 1000);
        },
    );

    const ref = useRef<HTMLTextAreaElement | null>(null);

    const focusStatus = useRef(false);

    const showRef = useRef<boolean>();

    const fnRef = useRef(fn);
    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/

    useLayoutEffect(() => {
        fnRef.current = fn;
    }, [fn]);

    useLayoutEffect(() => {
        if (typeof showRef.current === "boolean") {
            delayTimer.current && window.clearTimeout(delayTimer.current);
            fnRef.current(show);
        }
        showRef.current = show;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show]);

    const handleStart = () => {
        setShow(true);
        if (!focusStatus.current) {
            ref.current?.focus();
        }
    };

    const handleStop = () => {
        setShow(false);
    };

    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/

    useEffect(() => {
        destroy.current = false;
        return () => {
            destroy.current = true;
            if (timer.current) {
                window.clearTimeout(timer.current);
            }
            if (delayTimer.current) {
                window.clearTimeout(delayTimer.current);
            }
        };
    }, []);

    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */

    return (
        <div className={"item"}>
            {isOnly ? undefined : (
                <div
                    className="item_head"
                    dangerouslySetInnerHTML={{
                        __html: data.content,
                    }}
                />
            )}
            <div className={isOnly ? "item_col" : "item_row"}>
                <textarea
                    className="iptContent"
                    placeholder="请通过语音或打字输入..."
                    ref={ref}
                    defaultValue={defaultValue}
                    onFocus={() => {
                        focusStatus.current = true;
                    }}
                    onBlur={(e) => {
                        focusStatus.current = false;
                        setValue(e.currentTarget.value);
                    }}
                    onInput={(e) => {
                        timer.current && window.clearTimeout(timer.current);
                        const value = e.currentTarget.value.trim();
                        timer.current = window.setTimeout(() => {
                            timer.current = undefined;
                            setValue(value);
                        });
                    }}
                />

                <div className="btnContainer">
                    <Dropdown
                        delayOnShow={1000}
                        trigger={
                            show || isPending || mobileStatus || delayLoading ? undefined : "hover"
                        }
                        placement="ct"
                        triangle={{
                            width: "9px",
                            height: "4px",
                            color: "rgba(33,33,33,0.8)",
                        }}
                    >
                        <DropdownBtn
                            className="startBtn"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={handleStart}
                            style={
                                !show && !isPending && !delayLoading
                                    ? undefined
                                    : { opacity: "0", pointerEvents: "none" }
                            }
                        >
                            <Mike className="btn_icon" />
                        </DropdownBtn>
                        <DropdownContent bodyClassName="dropdownBody_content">
                            点击一下，用语音代替打字
                        </DropdownContent>
                    </Dropdown>
                    <div
                        className="btn_loading"
                        style={isPending || delayLoading ? undefined : { display: "none" }}
                    >
                        loading···
                    </div>
                    <div
                        className="stopBtn"
                        style={
                            show && !isPending && !delayLoading ? undefined : { display: "none" }
                        }
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        <Timer status={show} handleClick={handleStop} />
                    </div>
                </div>
            </div>
        </div>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Temp;
