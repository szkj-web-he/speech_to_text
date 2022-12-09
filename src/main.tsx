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
import { Group } from "./Components/Group";
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
        const rows = comms.config.options?.[0] ?? [];
        const cols = comms.config.options?.[1] ?? [];

        const data: Record<string, Record<string, string>> = {};
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowData: Record<string, string> = {};
            for (let j = 0; j < cols.length; j++) {
                const col = cols[j];
                rowData[col.code] = "";
            }
            data[row.code] = rowData;
        }
        return data;
    });

    const [showData, setShowData] = useState(() => {
        const rows = comms.config.options?.[0] ?? [];
        const cols = comms.config.options?.[1] ?? [];

        const data: Record<string, boolean> = {};
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            for (let j = 0; j < cols.length; j++) {
                const col = cols[j];
                data[`${row.code as string}_${col.code as string}`] = false;
            }
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
    const rows = comms.config.options?.[0] ?? [];
    const cols = comms.config.options?.[1] ?? [];

    return (
        <div className={`main`}>
            {rows.map((row, n) => {
                return (
                    <Fragment key={row.code}>
                        <Group index={n}>
                            <div
                                className="row_head"
                                dangerouslySetInnerHTML={{
                                    __html: row.content,
                                }}
                            />
                            {cols.map((item, index) => {
                                return (
                                    <Fragment key={index}>
                                        <Item
                                            data={{ ...item }}
                                            isOnly={cols.length < 2}
                                            key={item.code}
                                            show={
                                                showData[
                                                    `${row.code as string}_${item.code as string}`
                                                ]
                                            }
                                            setShow={(res) => {
                                                const itemKey = `${row.code as string}_${
                                                    item.code as string
                                                }`;
                                                setShowData((pre) => {
                                                    const data = { ...pre };
                                                    for (const key in pre) {
                                                        data[key] = key === itemKey ? res : false;
                                                    }
                                                    return { ...data };
                                                });
                                            }}
                                            defaultValue={state[row.code][item.code]}
                                            setValue={(res) => {
                                                setState((pre) => {
                                                    const data = { ...pre };
                                                    data[row.code][item.code] = res;
                                                    return { ...data };
                                                });
                                            }}
                                        />
                                    </Fragment>
                                );
                            })}
                        </Group>
                        {n < rows.length - 1 ? <div className="group_hr" /> : <></>}
                    </Fragment>
                );
            })}
        </div>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Temp;
