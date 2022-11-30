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
import { OptionProps } from "./type";
import { Dropdown } from "./Components/Dropdown";
import { DropdownBtn } from "./Components/DropdownBtn";
import { DropdownContent } from "./Components/DropdownContent";
import Mike from "./Components/Icon/mikeIcon";
import Timer from "./timer";
import { getMediaDevicesRole } from "./getMediaDevices";

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

    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/

    const handleStart = () => {
        setStart(true);
        getMediaDevicesRole();
    };

    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/

    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    if (isOnly) {
        return (
            <div className={`item_isOnly`}>
                <textarea className="iptContent" placeholder="请通过语音或打字输入..." />

                <div className="btnContainer">
                    <Dropdown
                        trigger={"hover"}
                        triangle={{
                            width: "9px",
                            height: "4px",
                            color: "rgba(33,33,33,0.8)",
                        }}
                        placement="ct"
                        show={start ? false : undefined}
                        delayOnShow={1000}
                        disable={start}
                    >
                        <DropdownBtn
                            className="startBtn"
                            onClick={handleStart}
                            style={
                                start
                                    ? { opacity: 0, pointerEvents: "none", visibility: "hidden" }
                                    : undefined
                            }
                        >
                            <Mike className="btn_icon" />
                        </DropdownBtn>
                        <DropdownContent className="" bodyClassName="dropdownBody_content">
                            点击一下，用语音代替打字
                        </DropdownContent>
                    </Dropdown>

                    <div
                        className="stopBtn"
                        style={
                            start
                                ? undefined
                                : { opacity: 0, pointerEvents: "none", visibility: "hidden" }
                        }
                    >
                        <Timer
                            status={start}
                            handleClick={() => {
                                setStart(false);
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return <div className={`item`}></div>;
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Temp;
