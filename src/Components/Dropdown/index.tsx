/**
 * @file dropdown context
 * @date 2022-09-29
 * @author xuejie.he
 * @lastModify xuejie.he 2022-09-29
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { createContext, memo, useContext, useRef, useState } from "react";
import { OffsetProps, Placement, TriangleProps, TriggerProps } from "../Unit/type";
import { useHashId } from "./../../Hooks/useHashId";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */

export interface MainProps {
    /**
     *  placement of dropdown content
     * 下拉框内容的展示位置
     *  同样的属性
     *  如果设置在DropdownContent将局部有效
     */
    placement?: Placement;
    /**
     * The direction of the main axis
     * 下拉框的主轴
     * placement基于主轴
     *  同样的属性
     *  如果设置在DropdownContent将局部有效
     */
    direction?: "vertical" | "horizontal";
    /**
     * Transition effect switch to fade
     * 过渡动画
     *  同样的属性
     *  如果设置在DropdownContent将局部有效
     */
    animate?: "fade";
    /**
     * children of this component
     */
    children?: React.ReactNode;
    /**
     * show of  this component
     * 是否可见
     * 如果传递
     * 将完全由使用者控制
     *  同样的属性
     *  如果设置在DropdownContent将局部有效
     */
    show?: boolean;
    /**
     * width : The width of the box where the triangle is located
     * height : The width of the box where the triangle is located
     * color : Triangle color
     * offset : Triangle offset
     * 三角形的属性
     * width: 三角形的宽
     * height: 三角形的高
     * color: 三角形的颜色
     * offset: 三角形的偏移值
     *
     * 同样的属性
     *  如果设置在DropdownContent将局部有效
     */
    triangle?: TriangleProps;
    /**
     * offset of dropdown content
     * 下拉框内容的偏移属性
     * 同样的属性
     *  如果设置在DropdownContent将局部有效
     */
    offset?: OffsetProps;

    /**
     * Where to install the dropdown content
     * 将dropdownContent组件挂载在那个节点下
     * 同样的属性
     *  如果设置在DropdownContent将局部有效
     */
    mount?: Element;
    /**
     * Remove when the element is Hide
     * 在dropdown不可见时是否移除此节点
     */
    removeOnHide?: boolean;
    /**
     * Cache only works if removeOnHide=true.
     * When cache=true, as long as the element has been rendered, it will no longer be removed.  The opposite is the state of cache=false.
     * 是否有缓存
     */
    cache?: boolean;
}

export interface DropdownProps extends MainProps {
    /**
     * Type of interaction
     * 交互方式
     *
     * 同样的属性
     * 如果设置在DropdownBtn或者是DropdownContent将局部有效
     */
    trigger?: TriggerProps | TriggerProps[];

    /**
     * disable of this component
     * 这个组件失去交互
     * 同样的属性
     *
     * 如果设置在DropdownBtn或者是DropdownContent将局部有效
     */
    disable?: boolean;
    /**
     * hide when click dropdown content
     * 点击下拉内容时隐藏
     *
     * 如果设置在DropdownContent将局部有效
     */
    hideOnClick?: boolean;
    /**
     * The delay of expanding the drop-down menu, it is only valid when the trigger has a hover value
     *
     * 展开下拉菜单的延时，仅在 trigger 有 hover、focus 值时有效
     *
     *  如果设置在DropdownContent将局部有效
     *
     * 单位ms(毫秒)
     */
    delayOnShow?: number;
    /**
     * Delay to hide the drop-down menu, only valid when the trigger has a hover value
     *
     * 隐藏下拉菜单的延时，仅在 trigger 有 hover、focus 值时有效
     *
     *  如果设置在DropdownContent将局部有效
     *
     *  单位ms(毫秒)
     */
    delayOnHide?: number;
}
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */

const DropdownPropsContext = createContext<Omit<DropdownProps, "children"> & { eventName: string }>(
    {
        eventName: "",
    },
);

export const useDropdownPropsContext = (): Omit<DropdownProps, "children"> & {
    eventName: string;
} => useContext(DropdownPropsContext);

export interface ItemProps {
    clickId?: string;
    contextmenuId?: string;
    disable?: boolean;
    trigger?: TriggerProps | TriggerProps[];
}

interface DropdownContextProps {
    btnIsClick?: Record<string, ItemProps>;

    setBtnIsClick: React.Dispatch<React.SetStateAction<Record<string, ItemProps>>>;

    btn: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
    btnIsClickRef: React.MutableRefObject<Record<string, ItemProps>>;
}

const DropdownContext = createContext<DropdownContextProps>({
    setBtnIsClick: () => undefined,
    btn: { current: {} },
    btnIsClickRef: { current: {} },
});

export const useDropdownContext = (): DropdownContextProps => useContext(DropdownContext);

/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
export const Dropdown: React.FC<DropdownProps> = memo(({ children, trigger, ...props }) => {
    Dropdown.displayName = "Dropdown";
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/
    const id = useHashId();

    const btn = useRef<Record<string, HTMLDivElement | null>>({});

    /**
     * 这个字段用来判断是否需要加global click事件
     */
    const btnIsClickRef = useRef<Record<string, ItemProps>>({});

    const [btnIsClick, setBtnIsClick] = useState<Record<string, ItemProps>>({});
    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/
    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/
    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    return (
        <DropdownPropsContext.Provider
            value={{
                ...props,
                trigger,
                eventName: `dropdown${id}`,
            }}
        >
            <DropdownContext.Provider
                value={{
                    btnIsClick,
                    setBtnIsClick,
                    btn,
                    btnIsClickRef,
                }}
            >
                {children}
            </DropdownContext.Provider>
        </DropdownPropsContext.Provider>
    );
});
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */

Dropdown.displayName = "Dropdown";
