/**
 * @file 有关kite的type
 * @date 2022-09-09
 * @author xuejie.he
 * @lastModify xuejie.he 2022-09-09
 */

import { OffsetProps, Placement, TriangleProps } from "../../Unit/type";

export type Direction = "vertical" | "horizontal";

export type GlobalClick = (status: { isBtn: boolean; isMenu: boolean }) => void;

export interface SizeProps {
    width: number;
    height: number;
}

export interface MainProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Where to install the'Kite'
     */
    mount?: Element;
    /**
     * children of this component
     */
    children?: React.ReactNode;

    /**
     * width : The width of the box where the triangle is located
     * height : The width of the box where the triangle is located
     * color : Triangle color
     * offset : Triangle offset
     */
    triangle?: TriangleProps;
    /**
     * offset of 'Kite'
     */
    offset?: OffsetProps;

    /**
     * Where to put it in root
     */
    placement?: Placement;
    /**
     * The direction of the main axis
     */
    direction?: "vertical" | "horizontal";
    /**
     * Callback function for position change
     */
    handlePositionChange?: (x: number | undefined, y: number | undefined) => void;
    /**
     * ontransitionEnd callback
     */
    handleTransitionEnd?: () => void;
    /**
     * ontransitionStart callback
     */
    handleTransitionStart?: () => void;
    /**
     * ontransitionCancel callback
     */
    handleTransitionCancel?: () => void;
    /**
     * Transition effect switch to fade
     */
    animate?: "fade";
    /**
     * body className
     */
    bodyClassName?: string;
}
