/**
 * @file transitionClass
 * @date 2022-01-06
 * @author xuejie.he
 * @lastModify xuejie.he 2022-01-06
 */

import "../../Portal/style.scss";

export interface TransitionClassProps {
    enter: {
        active: string;
        to: string;
        from: string;
    };
    leave: {
        active: string;
        to: string;
        from: string;
    };
}

export const getTransitionClass = (
    x: "l" | "r" | "c",
    y: "t" | "b" | "c",
    direction: "vertical" | "horizontal",
): TransitionClassProps => {
    const str = direction.slice(0, 1) + x + y;
    return {
        enter: {
            active: `kite_${str}EnterActive`,
            to: `kite_${str}EnterTo`,
            from: `kite_${str}EnterFrom`,
        },
        leave: {
            active: `kite_${str}LeaveActive`,
            to: `kite_${str}LeaveTo`,
            from: `kite_${str}LeaveFrom`,
        },
    };
};
