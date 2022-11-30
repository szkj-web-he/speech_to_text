/**
 * @file
 * @date 2022-08-08
 * @author xuejie.he
 * @lastModify xuejie.he 2022-08-08
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { Fragment, useEffect, useState } from "react";
import { comms } from ".";
import Item from "./item";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const Temp: React.FC = () => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/

    const [state, setState] = useState(() => {
        const arr = comms.config.options ?? [];
        const data: Record<string, string> = {};
        for (let i = 0; i < arr.length; i++) {
            data[arr[i].code] = "";
        }
        return data;
    });

    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/

    useEffect(() => {
        comms.state = state;
    }, [state]);

    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/

    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    const cols = comms.config.options ?? [];

    return (
        <div className={`main`}>
            {cols.map((item, index) => {
                return (
                    <Fragment key={index}>
                        <Item
                            data={{ ...item }}
                            isOnly={cols.length < 2}
                            key={item.code}
                            value={state[item.code]}
                            setValue={(res) => {
                                setState((pre) => {
                                    const data = { ...pre };
                                    data[item.code] = res;
                                    return { ...data };
                                });
                            }}
                        />
                    </Fragment>
                );
            })}
        </div>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Temp;
