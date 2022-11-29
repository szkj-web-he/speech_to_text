/**
 * @file
 * @date 2021-12-21
 * @author xuejie.he
 * @lastModify xuejie.he 2021-12-21
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import { SplitCols } from "../../Hooks/useOptions";
import React, { forwardRef, useEffect, useState } from "react";
import { ColProps } from "../Col";
import "./style.scss";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
export interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * children of this component
     */
    children: React.ReactElement<ColProps> | Array<React.ReactElement<ColProps>>;
    /**
     * Vertical align of this component
     */
    align?: "top" | "middle" | "bottom" | "stretch";
    /**
     * justify align of this component
     */
    justify?: "center" | "left" | "right";
    /**
     * className of this component
     */
    className?: string;
    /**
     * style of this component
     */
    style?: React.CSSProperties;
    /**
     * Is the beam visible?
     */
    debug?: boolean;
}

/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
export const Row: React.FC<RowProps> = forwardRef<HTMLDivElement, RowProps>(
    ({ children, align = "top", justify = "left", className, style, debug, ...props }, ref) => {
        Row.displayName = "Row";
        /* <------------------------------------ **** STATE START **** ------------------------------------ */
        /************* This section will include this component HOOK function *************/
        const [cols, setCols] = useState(SplitCols);

        useEffect(() => {
            const fn = () => {
                setCols(SplitCols());
            };
            if (debug) {
                window.addEventListener("resize", fn);
            }
            return () => {
                window.removeEventListener("resize", fn);
            };
        }, [debug]);

        /* <------------------------------------ **** STATE END **** ------------------------------------ */
        /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
        /************* This section will include this component parameter *************/
        /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
        /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
        /************* This section will include this component general function *************/

        const arr = ["gridRow_wrap"];
        arr.push(`gridRow_align${align}`);
        arr.push(`gridRow_justify${justify}`);
        className && arr.push(className);

        let beam = <></>;
        if (debug) {
            arr.push("gridRow_wrap_debug");

            beam = (
                <ul className={"gridRow_debugWrap"}>
                    {new Array(cols === 2 ? 4 : 12).fill("").map((_, n) => {
                        return <li className={"gridRow_debugItem"} key={`rowDebug${n}`} />;
                    })}
                </ul>
            );
        }
        return (
            <div className={arr.join(" ")} ref={ref} {...props} style={style}>
                {children}
                {beam}
            </div>
        );

        /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    },
);
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
Row.displayName = "Row";
