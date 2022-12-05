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
import { useMobile } from "./Components/Scroll/Unit/useMobile";
import { useMediaDevices } from "./Hooks/useMediaDevices";
import Timer from "./timer";
import { OptionProps } from "./type";

/* 
<------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
interface TempProps {
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
const Temp: React.FC<TempProps> = ({ data, defaultValue, setValue, isOnly }) => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/
    const [start, setStart] = useState(false);

    const messageData = useRef<{ value: string; start: number }>();

    const timer = useRef<number>();

    const [fn, openLoading, closeLoading] = useMediaDevices(
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
            setStart(false);
        },
    );

    const mobileStatus = useMobile();

    const ref = useRef<HTMLTextAreaElement | null>(null);

    const focusStatus = useRef(false);

    const inputVal = useRef<string>();

    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/

    const handleStart = () => {
        setStart(true);
        fn(true);
        if (!focusStatus.current) {
            ref.current?.focus();
        }
    };

    const handleStop = () => {
        if (start === true) {
            setStart(false);
            fn(false);
        }
    };

    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/

    useEffect(() => {
        return () => {
            if (timer.current) {
                window.clearTimeout(timer.current);
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
                        inputVal.current = e.currentTarget.value;
                        timer.current = window.setTimeout(() => {
                            timer.current = undefined;
                            setValue(e.currentTarget.value);
                        });
                    }}
                />

                <div className="btnContainer">
                    <Dropdown
                        delayOnShow={1000}
                        trigger={"hover"}
                        disable={start || openLoading || closeLoading || mobileStatus}
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
                                !start && !openLoading && !closeLoading
                                    ? undefined
                                    : { opacity: "0" }
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
                        style={openLoading || closeLoading ? undefined : { display: "none" }}
                    >
                        loading···
                    </div>

                    <div
                        className="stopBtn"
                        style={
                            start && !openLoading && !closeLoading ? undefined : { display: "none" }
                        }
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        <Timer status={start} handleClick={handleStop} />
                    </div>
                </div>
            </div>
        </div>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Temp;
