/**
 * @file auto Position
 * @date 2022-01-14
 * @author xuejie.he
 * @lastModify xuejie.he 2022-01-14
 */

import { getScrollValue } from "./getScrollValue";

type Outset = [number, number];
interface Boundary {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface AutoPositionResult {
    triangle: Outset;
    menu: Outset;
    reverse: boolean;
}

export type OffsetWidthFn = (
    val: number,
    width: { triangle: number; root: number; kite: number },
) => number;

export type OffsetHeightFn = (
    val: number,
    height: { triangle: number; root: number; kite: number },
) => number;

export type OffsetProps = {
    x?: number | OffsetWidthFn;
    y?: number | OffsetHeightFn;
};

interface StaticProps extends AutoPositionProps {
    scrollX: number;
    scrollY: number;
    boundary: Boundary;
    kiteBoundary: Boundary;
}

export interface AutoPositionProps {
    btnRect: DOMRect;
    triangleSize: Outset;
    menuSize: { width: number; height: number };
    direction: "horizontal" | "vertical";
    placement: "lb" | "rb" | "cb" | "lt" | "rt" | "ct" | "rc" | "lc";
    offset: {
        menu?: OffsetProps;
        triangle?: OffsetProps;
    };
}

/**
 * 自动定位位置
 */

export const main = () => {
    let staticData: StaticProps | null = null;

    const getOffset = (val: number, d: "x" | "y", m: "menu" | "triangle"): number => {
        const data = staticData as StaticProps;
        let offset: typeof data.offset.menu = undefined;
        switch (m) {
            case "menu":
                offset = data.offset.menu;
                break;
            case "triangle":
                offset = data.offset.triangle;
                break;
        }

        if (offset) {
            switch (d) {
                case "x":
                    if (typeof offset.x === "number") {
                        val += offset.x;
                    } else if (offset.x) {
                        val = offset.x(val, {
                            triangle: data.triangleSize[0],
                            root: data.btnRect.width,
                            kite: data.menuSize.width,
                        });
                    }
                    break;
                case "y":
                    if (typeof offset.y === "number") {
                        val += offset.y;
                    } else if (offset.y) {
                        val = offset.y(val, {
                            triangle: data.triangleSize[1],
                            root: data.btnRect.height,
                            kite: data.menuSize.height,
                        });
                    }
                    break;
            }
        }
        return val;
    };

    const isBtnVisible = (): boolean => {
        const data = staticData as StaticProps;

        if (data.btnRect.top + data.scrollY > data.boundary.bottom) {
            return false;
        } else if (data.btnRect.bottom + data.scrollY < data.boundary.top) {
            return false;
        } else if (data.btnRect.left + data.scrollX > data.boundary.right) {
            return false;
        } else if (data.btnRect.right + data.scrollX < data.boundary.left) {
            return false;
        } else {
            return true;
        }
    };

    const defaultHorizontalY = (): number => {
        let val = 0;
        const data = staticData as StaticProps;
        const t = data.btnRect.top + data.scrollY;
        const c =
            data.btnRect.top + data.scrollY - data.menuSize.height / 2 + data.btnRect.height / 2;
        const b = data.btnRect.bottom + data.scrollY - data.menuSize.height;

        switch (data.placement) {
            case "lt":
                val = t;
                break;
            case "lc":
                val = c;
                break;
            case "lb":
                val = b;
                break;
            case "rt":
                val = t;
                break;
            case "rc":
                val = c;
                break;
            case "rb":
                val = b;
                break;
            default:
                console.warn(`Horizontal cannot have placement = ${data.placement}`);
        }
        val = getOffset(val, "y", "menu");

        if (isBtnVisible()) {
            if (val < data.kiteBoundary.top) {
                val = data.kiteBoundary.top;
            } else if (val + data.menuSize.height > data.kiteBoundary.bottom) {
                val = data.kiteBoundary.bottom - data.menuSize.height;
            }
        }
        return val;
    };

    const defaultVerticalX = (): number => {
        const data = staticData as StaticProps;

        let val = 0;
        const l = data.btnRect.left + data.scrollX;
        const c =
            data.btnRect.left + data.scrollX + data.btnRect.width / 2 - data.menuSize.width / 2;
        const r = data.btnRect.right + data.scrollX - data.menuSize.width;

        switch (data.placement) {
            case "lt":
                val = l;
                break;
            case "ct":
                val = c;
                break;
            case "rt":
                val = r;
                break;
            case "lb":
                val = l;
                break;
            case "cb":
                val = c;
                break;
            case "rb":
                val = r;
                break;
            default:
                console.error(`Vertical cannot have placement = ${data.placement}`);
        }
        val = getOffset(val, "x", "menu");

        if (isBtnVisible()) {
            if (val < data.kiteBoundary.left) {
                val = data.kiteBoundary.left;
            } else if (val + data.menuSize.width > data.kiteBoundary.right) {
                val = data.kiteBoundary.right - data.menuSize.width;
            }
        }
        return val;
    };

    /**
     * 设置位置
     * @returns
     */
    const getPoint = (): {
        x: number;
        y: number;
        reverse: boolean;
    } => {
        let reverse = false;
        let x = 0;
        let y = 0;
        const data = staticData as StaticProps;
        switch (data.direction) {
            case "horizontal":
                y = defaultHorizontalY();

                if (data.placement.startsWith("l")) {
                    // default left
                    x = data.btnRect.left + data.scrollX - data.menuSize.width;
                    x = getOffset(x, "x", "menu");

                    //btn visible
                    if (isBtnVisible() && x < data.kiteBoundary.left) {
                        if (
                            data.kiteBoundary.right - (data.btnRect.right + data.scrollX) >=
                            data.menuSize.width
                        ) {
                            x = data.btnRect.right + data.scrollX;
                            reverse = true;
                        } else {
                            x += data.kiteBoundary.left - x;
                        }
                    }
                } else {
                    // default right
                    x = data.btnRect.right + data.scrollX;
                    x = getOffset(x, "x", "menu");
                    //btn visible
                    if (isBtnVisible() && x + data.menuSize.width > data.kiteBoundary.right) {
                        if (data.btnRect.left >= data.menuSize.width) {
                            x = data.btnRect.left + data.scrollX - data.menuSize.width;
                            reverse = true;
                        } else {
                            x -= x + data.menuSize.width - data.kiteBoundary.right;
                        }
                    }
                }
                break;
            case "vertical":
                x = defaultVerticalX();

                if (data.placement.endsWith("b")) {
                    // default bottom
                    y = data.btnRect.bottom + data.scrollY;
                    y = getOffset(y, "y", "menu");
                    //btn visible
                    if (isBtnVisible() && y + data.menuSize.height > data.kiteBoundary.bottom) {
                        if (data.btnRect.top >= data.menuSize.height) {
                            y = data.btnRect.top + data.scrollY - data.menuSize.height;
                            reverse = true;
                        } else {
                            y -= y + data.menuSize.height - data.kiteBoundary.bottom;
                        }
                    }
                } else {
                    // default top
                    y = data.btnRect.top + data.scrollY - data.menuSize.height;
                    y = getOffset(y, "y", "menu");

                    //btn visible
                    if (isBtnVisible() && y < data.kiteBoundary.top) {
                        if (
                            data.kiteBoundary.bottom - (data.btnRect.bottom + data.scrollY) >=
                            data.menuSize.height
                        ) {
                            y = data.btnRect.bottom + data.scrollY;
                            reverse = true;
                        } else {
                            y += data.kiteBoundary.top - y;
                        }
                    }
                }
                break;
        }

        return {
            x,
            y,
            reverse,
        };
    };

    /**
     * 获取主轴为水平方向的小三角坐标
     * @param y 这个是Menu的y坐标位置
     */
    const getHTriangle = (y: number): [number, number] => {
        let tx = 0;
        let ty = 0;
        const data = staticData as StaticProps;

        const btnTop = data.btnRect.top + data.scrollY;
        if (y >= btnTop + data.btnRect.height || y + data.menuSize.height <= btnTop) {
            ty = data.menuSize.height / 2 - data.triangleSize[1] / 2;
        } else {
            const top = Math.max(y, btnTop);
            const bottom = Math.min(y + data.menuSize.height, btnTop + data.btnRect.height);
            const d = (bottom - top) / 2;

            const absoluteY = d + top;
            const relativeY = absoluteY - y;

            if (relativeY - data.triangleSize[1] / 2 < 0) {
                ty = 0;
            } else if (relativeY + data.triangleSize[1] / 2 > data.menuSize.height) {
                ty = data.menuSize.height - data.triangleSize[1];
            } else {
                ty = relativeY - data.triangleSize[1] / 2;
            }
        }

        tx = 0;

        return [getOffset(tx, "x", "triangle"), getOffset(ty, "y", "triangle")];
    };

    /**
     * 获取主轴为垂直方向的小三角坐标
     * @param x 这个是Menu的y坐标位置
     */
    const getVTriangle = (x: number): [number, number] => {
        const data = staticData as StaticProps;

        let tx = 0;
        let ty = 0;
        //这里计算的三角形的坐标
        const btnLeft = data.btnRect.left + data.scrollX;
        if (x >= btnLeft + data.btnRect.width || x + data.menuSize.width <= btnLeft) {
            tx = data.menuSize.width / 2 - data.triangleSize[0] / 2;
        } else {
            const left = Math.max(x, btnLeft);
            const right = Math.min(x + data.menuSize.width, btnLeft + data.btnRect.width);
            const d = (right - left) / 2;

            const absoluteX = d + left;
            const relativeX = absoluteX - x;

            if (relativeX - data.triangleSize[0] / 2 < 0) {
                tx = 0;
            } else if (relativeX + data.triangleSize[0] / 2 > data.menuSize.width) {
                tx = data.menuSize.width - data.triangleSize[0];
            } else {
                tx = relativeX - data.triangleSize[0] / 2;
            }
        }

        ty = 0;
        return [getOffset(tx, "x", "triangle"), getOffset(ty, "y", "triangle")];
    };

    const getRelativePoint = () => {
        const data = staticData as StaticProps;
        let reverse = false;
        let x = 0;
        let y = 0;
        let tx = 0;
        let ty = 0;
        switch (data.direction) {
            case "horizontal":
                y = defaultHorizontalY();

                [tx, ty] = getHTriangle(y);

                if (data.placement.startsWith("l")) {
                    // default left
                    x = data.btnRect.left + data.scrollX - data.menuSize.width;
                    x = getOffset(x, "x", "menu");

                    //btn visible
                    if (isBtnVisible() && x < data.kiteBoundary.left) {
                        if (
                            data.kiteBoundary.right - (data.btnRect.right + data.scrollX) >=
                            data.menuSize.width
                        ) {
                            x = data.btnRect.right + data.scrollX;
                            reverse = true;
                        } else {
                            x += data.kiteBoundary.left - x;
                        }
                    }
                } else {
                    // default right
                    x = data.btnRect.right + data.scrollX;
                    x = getOffset(x, "x", "menu");
                    //btn visible
                    if (isBtnVisible() && x + data.menuSize.width > data.kiteBoundary.right) {
                        if (data.btnRect.left >= data.menuSize.width) {
                            x = data.btnRect.left + data.scrollX - data.menuSize.width;
                            reverse = true;
                        } else {
                            x -= x + data.menuSize.width - data.kiteBoundary.right;
                        }
                    }
                }
                break;
            case "vertical":
                x = defaultVerticalX();

                [tx, ty] = getVTriangle(x);

                //这里计算主容器的位置
                if (data.placement.endsWith("b")) {
                    // default bottom
                    y = data.btnRect.bottom + data.scrollY;
                    y = getOffset(y, "y", "menu");
                    //btn visible
                    if (isBtnVisible() && y + data.menuSize.height > data.kiteBoundary.bottom) {
                        if (data.btnRect.top >= data.menuSize.height) {
                            y = data.btnRect.top + data.scrollY - data.menuSize.height;
                            reverse = true;
                        } else {
                            y -= y + data.menuSize.height - data.kiteBoundary.bottom;
                        }
                    }
                } else {
                    // default top
                    y = data.btnRect.top + data.scrollY - data.menuSize.height;
                    y = getOffset(y, "y", "menu");
                    //btn visible
                    if (isBtnVisible() && y < data.kiteBoundary.top) {
                        if (
                            data.kiteBoundary.bottom - (data.btnRect.bottom + data.scrollY) >=
                            data.menuSize.height
                        ) {
                            y = data.btnRect.bottom + data.scrollY;
                            reverse = true;
                        } else {
                            y += data.kiteBoundary.top - y;
                        }
                    }
                }
                break;
        }

        return {
            x,
            y,
            tx,
            ty,
            reverse,
        };
    };

    /**
     * 下拉框的起点
     * @param {boolean} reverse 是否反转
     * @returns {[number,number]} [x,y]
     */
    // const originPoint = (reverse: boolean): [number, number] | undefined => {
    //     const data = staticData as StaticProps;
    //     if (!data) {
    //         return;
    //     }
    //     let x = 0;
    //     let y = 0;

    //     switch (data.direction) {
    //         case "horizontal":
    //             y = data.btnRect.top + data.scrollY;
    //             if (data.placement.startsWith("l")) {
    //                 x = reverse
    //                     ? data.btnRect.left + data.btnRect.width + data.scrollX
    //                     : data.btnRect.left + data.scrollX;
    //             } else {
    //                 x = reverse
    //                     ? data.btnRect.left + data.scrollX
    //                     : data.btnRect.left + data.btnRect.width + data.scrollX;
    //             }
    //             break;
    //         case "vertical":
    //             x = data.btnRect.left + data.scrollX;
    //             if (data.placement.endsWith("t")) {
    //                 y = reverse
    //                     ? data.btnRect.top + data.btnRect.height + data.scrollY
    //                     : data.btnRect.top + data.scrollY;
    //             } else {
    //                 y = reverse
    //                     ? data.btnRect.top + data.scrollY
    //                     : data.btnRect.top + data.btnRect.height + data.scrollY;
    //             }
    //             break;
    //     }
    //     return [x, y];
    // };

    /**
     * 定位位置的入口
     */
    function autoPosition({
        btnRect,
        triangleSize,
        menuSize,
        direction,
        placement,
        offset,
    }: AutoPositionProps): AutoPositionResult {
        const scrollData = getScrollValue();
        const boundary = {
            top: scrollData.y,
            right: scrollData.x + document.documentElement.clientWidth,
            bottom: scrollData.y + document.documentElement.clientHeight,
            left: scrollData.x,
        };

        const kiteBoundary = {
            top: boundary.top + 8,
            right: boundary.right - 8,
            bottom: boundary.bottom - 8,
            left: boundary.left + 8,
        };

        staticData = {
            btnRect,
            triangleSize,
            menuSize,
            direction,
            placement,
            offset,
            scrollX: scrollData.x,
            scrollY: scrollData.y,
            boundary,
            kiteBoundary,
        };

        let tx = 0;
        let ty = 0;
        let mx = 0;
        let my = 0;
        let reverse = false;

        let data: {
            x: number;
            y: number;
            tx?: number;
            ty?: number;
            reverse: boolean;
        };
        if (triangleSize[0] + triangleSize[1] > 0) {
            data = getRelativePoint();

            tx = data.tx ?? 0;
            ty = data.ty ?? 0;
        } else {
            data = getPoint();
        }
        mx = data.x;
        my = data.y;
        reverse = data.reverse;

        return {
            triangle: [tx, ty],
            menu: [mx, my],
            reverse,
        };
    }

    return autoPosition;
};
