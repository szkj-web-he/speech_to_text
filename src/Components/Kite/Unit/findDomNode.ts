/**
 * @file abc
 * @date 2021-12-10
 * @author xuejie.he
 * @lastModify xuejie.he 2021-12-10
 */

import { getElFiber } from "../../../DataDisplay/FixedSizeText/Unit/getElFiber";

export type WorkTag =
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20
    | 21
    | 22
    | 23
    | 24;

export interface Fiber {
    tag: WorkTag;
    key: null | string;
    elementType: unknown;
    type: unknown;
    stateNode: unknown;
    return: Fiber | null;
    child: Fiber | null;
    sibling: Fiber | null;
    index: number;
    ref: unknown;
    pendingProps: unknown;
    memoizedProps: unknown;
    updateQueue: number;
    memoizedState: unknown;
    dependencies: unknown | null;
    mode: number;
    flags: number;
    subtreeFlags: number;
    deletions: Array<Fiber> | null;
    nextEffect: Fiber | null;
    firstEffect: Fiber | null;
    lastEffect: Fiber | null;
    lanes: number;
    childLanes: number;
    alternate: Fiber | null;
    actualDuration?: number;
    actualStartTime?: number;
    selfBaseDuration?: number;
    treeBaseDuration?: number;
}

export interface includeElsProps {
    el: Element;
    name: string;
}

export const fiberKey = "__reactFiber$";

export const findDomFn = (node: HTMLElement, id: string): boolean => {
    const keys = Object.keys(node);
    const key = keys.find((item) => item.includes(fiberKey));

    if (key) {
        let fiber: Fiber | null = (node as unknown as Record<string, Fiber>)[key];
        let status = false;

        while (fiber && !status) {
            if (fiber.key === `kiteRoot${id}`) {
                status = true;
            } else {
                fiber = fiber.return;
            }
        }
        return status;
    } else {
        return false;
    }
};

/**
 * 通过fiber来找
 * @param fiber
 * @param includeEls
 * @param els
 * @returns
 */
const findParentFromFiber = (
    fiber: Fiber,
    includeEls: Array<{ el: Element; status: boolean }>,
    els?: Element[],
) => {
    let status = false;
    if (fiber.tag === 5 && fiber.stateNode) {
        for (let i = 0; i < includeEls.length; ) {
            if (fiber.stateNode === includeEls[i].el) {
                status = true;
                includeEls[i].status = true;
                i = includeEls.length;
            } else {
                ++i;
            }
        }

        /**
         * 为了避免不必要的递归
         * 这里做了处理
         * 如果找到的element包含在els里面 就没必要在向上找了
         * 因为 本地el就是els里 一会这个 找的element也会被再找一遍 所以可以return出去
         */
        if (status === false && els) {
            for (let i = 0; i < els.length; ) {
                if (els[i] === fiber.stateNode) {
                    i = els.length;
                    status = true;
                } else {
                    ++i;
                }
            }
        }
    }

    if (status) {
        return;
    }

    if (fiber.return) {
        findParentFromFiber(fiber.return, includeEls, els);
    }
};

/**
 * 获取element的所有父react element
 * @param {Element} el 找哪个element的 父react element
 * @param {Array<includeElsProps>} includeEls 要匹配哪些react element
 * @param {Array<Element>} els  el的源
 * @returns  { Array< includeElsProps & { status: boolean;  }>}
 */
export const findReactElementFromDom = (
    el: Element,
    includeEls: Array<includeElsProps>,
    els?: Element[],
): Array<includeElsProps & { status: boolean }> => {
    const fiber = getElFiber(el);
    const arr = includeEls.map((item) => {
        return {
            el: item.el,
            status: false,
            name: item.name,
        };
    });

    let status = false;
    if (fiber?.tag === 5 && fiber?.stateNode) {
        for (let i = 0; i < arr.length; ) {
            if (fiber.stateNode === arr[i].el) {
                status = true;
                arr[i].status = true;
                i = arr.length;
            } else {
                ++i;
            }
        }
    }
    if (status) {
        return arr;
    }

    if (fiber?.return) {
        findParentFromFiber(fiber.return, arr, els);
    }
    return arr;
};

/**
 * 获取elements的所有父react element
 * @param { Array<Element>  } params 找哪些element的父react element
 * @param {Array<includeElsProps>} includeEls 要匹配哪些react element
 * @returns { Array< includeElsProps & { status: boolean;  }>}
 */
export const findReactElementFromDoms = (
    params: Element[],
    includeEls: Array<includeElsProps>,
): Array<includeElsProps & { status: boolean }> => {
    const els: Array<
        includeElsProps & {
            status: boolean;
        }
    > = [];
    for (let i = 0; i < params.length; i++) {
        if (params[i].nodeType === 1 && !["HTML", "BODY"].includes(params[i].nodeName)) {
            const arr = findReactElementFromDom(params[i], includeEls, params);
            for (let i = 0; i < arr.length; i++) {
                if (els[i]) {
                    els[i].status = arr[i].status || els[i].status;
                } else {
                    els[i] = {
                        el: arr[i].el,
                        status: arr[i].status,
                        name: arr[i].name,
                    };
                }
            }
        }
    }
    return els;
};
