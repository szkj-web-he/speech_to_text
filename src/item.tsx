/**
 * @file
 * @date 2022-08-08
 * @author xuejie.he
 * @lastModify xuejie.he 2022-08-08
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { useState } from "react";
import Mike from "./Components/Icon/mikeIcon";
import { useMediaDevices } from "./Hooks/useMediaDevices";
import Timer from "./timer";
import { OptionProps } from "./type";
import { useRef } from "react";
import { useEffect } from "react";

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
    value: string;
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
const Temp: React.FC<TempProps> = ({ data, value, setValue, isOnly }) => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/
    const [start, setStart] = useState(false);

    const textRef = useRef("");

    const [loading, setLoading] = useState(false);

    const fn = useMediaDevices(
        () => {
            setLoading(false);
        },
        (res) => {
            textRef.current += res ?? "";
            setValue(textRef.current);
        },
        () => {
            setLoading(false);
            setStart(false);
        },
    );

    const ref = useRef<HTMLTextAreaElement | null>(null);

    const focusStatus = useRef(false);

    const inputVal = useRef<string>();

    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/

    useEffect(() => {
        if (ref.current) {
            ref.current.value = value;
        }
    }, [value]);

    const handleStart = () => {
        setStart(true);
        setLoading(true);
        fn(true);
        if (!focusStatus.current) {
            ref.current?.focus();
        }
    };

    const handleStop = () => {
        setStart(false);
        setLoading(false);
        fn(false);
    };

    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/

    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    if (isOnly) {
        return (
            <div className={`item_isOnly`}>
                <textarea
                    className="iptContent"
                    placeholder="请通过语音或打字输入..."
                    ref={ref}
                    onFocus={() => {
                        focusStatus.current = true;
                    }}
                    onBlur={() => {
                        focusStatus.current = false;
                    }}
                    onInput={(e) => {
                        inputVal.current = e.currentTarget.value;
                        console.log(document.getSelection()?.getRangeAt(0));
                    }}
                />

                <div className="btnContainer">
                    <div
                        className="startBtn"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={handleStart}
                        title="点击一下，用语音代替打字"
                        style={start ? { display: "none" } : undefined}
                    >
                        <Mike className="btn_icon" />
                    </div>

                    <div
                        className="stopBtn"
                        style={start ? undefined : { display: "none" }}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        {loading ? (
                            <div className="stopBtnLoading">loading···</div>
                        ) : (
                            <Timer status={start} handleClick={handleStop} />
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return <div className={`item`}></div>;
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Temp;
