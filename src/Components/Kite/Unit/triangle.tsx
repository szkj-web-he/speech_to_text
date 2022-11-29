/**
 * @file
 * @date 2021-12-13
 * @author xuejie.he
 * @lastModify xuejie.he 2021-12-13
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React from "react";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
interface TriangleProps {
    attr?: {
        width: string;
        height: string;
        color?: string;
    };
    position?: {
        triangle: [number, number];
        menu: [number, number];
        reverse: boolean;
    };
    d: "vertical" | "horizontal";
    placement: "lb" | "rb" | "cb" | "lt" | "rt" | "ct" | "rc" | "lc";
    className: string;
}
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const Triangle: React.FC<TriangleProps> = ({ attr, position, d, placement, className }) => {
    if (attr) {
        const color = attr.color || "#fff";

        let style: React.CSSProperties = {};

        let isTop: boolean;
        let isLeft: boolean;

        switch (d) {
            case "horizontal":
                style = {
                    borderTop: `calc(${attr.height} / 2) solid transparent`,
                    borderBottom: `calc(${attr.height} / 2) solid transparent`,
                };

                isLeft =
                    (placement.startsWith("l") && !position?.reverse) ||
                    (placement.startsWith("r") && !!position?.reverse);
                if (isLeft) {
                    style.borderLeft = `${attr.width} solid ${color}`;
                    style.filter = "drop-shadow(1px 0 1px rgba(0, 0, 0, 0.2))";
                } else {
                    style.borderRight = `${attr.width} solid ${color}`;
                    style.filter = "drop-shadow(-1px 0 1px rgba(0, 0, 0, 0.2))";
                }

                break;
            case "vertical":
                style = {
                    borderLeft: `calc(${attr.width} / 2) solid transparent`,
                    borderRight: `calc(${attr.width} / 2) solid transparent`,
                };
                isTop =
                    (placement.endsWith("t") && !position?.reverse) ||
                    (placement.endsWith("b") && !!position?.reverse);
                if (isTop) {
                    style.borderTop = `${attr.height} solid ${color}`;
                    style.filter = "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2))";
                } else {
                    style.borderBottom = `${attr.height} solid ${color}`;
                    style.filter = "drop-shadow(0 -1px 1px rgba(0, 0, 0, 0.2))";
                }
                break;
        }
        if (position?.triangle) {
            style.transform = `translate(${position?.triangle[0]}px,${position?.triangle[1]}px)`;
        }

        return <div className={className} style={Object.assign({}, style)} />;
    } else {
        return <></>;
    }
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Triangle;
