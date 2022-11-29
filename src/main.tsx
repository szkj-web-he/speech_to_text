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
import JumpWrap from "./Components/JumpWrap";
import { Row } from "./Components/Row";
import { ScrollComponent } from "./Components/Scroll";
import { useMapOptions } from "./Hooks/useOptions";
import Item from "./item";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const Temp: React.FC = () => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/
    const [options, isMobile] = useMapOptions();

    const [state, setState] = useState(() => {
        const arr = comms.config.options ?? [];
        const data: Record<string, null | number> = {};
        for (let i = 0; i < arr.length; i++) {
            data[arr[i].code] = null;
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
    return (
        <JumpWrap className="mainScroll">
            <ScrollComponent
                hidden={{ y: true }}
                className="horizontalScroll"
                bodyClassName="horizontalScrollBody"
            >
                <div className={`main${isMobile ? " mobile" : ""}`}>
                    {options.map((items, index) => {
                        return (
                            <Fragment key={index}>
                                <Group index={index} className={isMobile ? "optionsRow" : ""}>
                                    <Row>
                                        {items.map((item) => {
                                            return (
                                                <Item
                                                    data={{ ...item }}
                                                    key={item.code}
                                                    score={state[item.code] ?? 0}
                                                    setScore={(res) => {
                                                        setState((pre) => {
                                                            const data = { ...pre };
                                                            data[item.code] = res;
                                                            return { ...data };
                                                        });
                                                    }}
                                                    span={item.span as 1}
                                                    mobileStatus={isMobile}
                                                />
                                            );
                                        })}
                                    </Row>
                                </Group>
                                {index < options.length - 1 && !isMobile && <div className="hr" />}
                            </Fragment>
                        );
                    })}
                </div>
            </ScrollComponent>
        </JumpWrap>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Temp;
