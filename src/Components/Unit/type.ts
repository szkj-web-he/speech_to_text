/**
 * @file dropdown的type
 * @date 2022-09-29
 * @author xuejie.he
 * @lastModify xuejie.he 2022-09-29
 */

/**
 * 触发的展开或者关闭的事件类型
 */
export type TriggerProps = "hover" | "focus" | "click" | "contextmenu";

/**
 *
 * l => left
 * r => right
 * c => center
 * t => top
 * b => bottom
 */
export type Placement = "lb" | "rb" | "cb" | "lt" | "rt" | "ct" | "rc" | "lc";

export interface TriangleProps {
    width: string;
    height: string;
    color?: string;
    offset?: OffsetProps;
}

export interface OffsetProps {
    x?: number | ((val: number, width: { triangle: number; root: number; kite: number }) => number);
    y?:
        | number
        | ((val: number, height: { triangle: number; root: number; kite: number }) => number);
}

interface CustomChangeShowEvent {
    event: "changeShow";
    id: string;
}

interface ClickEvent {
    event: "click" | "contextmenu";
    id: string;
    eventId: string;
    todo: boolean;
}

interface MouseEvent {
    event: "mouseenter" | "mouseleave" | "focus" | "blur";
    id: string;
    eventId: string;
}

export type CustomEventAction = MouseEvent | CustomChangeShowEvent | ClickEvent;

/**
 * @file 有关kite的type
 * @date 2022-09-09
 * @author xuejie.he
 * @lastModify xuejie.he 2022-09-09
 */

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
