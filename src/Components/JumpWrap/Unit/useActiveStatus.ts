import { useEffect, useRef, useState } from "react";
import { getScrollBody } from "./getScrollBody";

type RefObject<T> = React.MutableRefObject<T>;

interface ActiveStatusResult {
    show: boolean;
    topActive: boolean;
    bottomActive: boolean;
    activeIndex: RefObject<number>;
    isBottom: boolean;
    update: { current: () => void };
}

export const getElements = (id: string): HTMLElement[] => {
    const els = document.querySelectorAll(`.${id}`);
    const arr: HTMLElement[] = [];
    for (let i = 0; i < els.length; i++) {
        const el = els[i];
        if (el instanceof HTMLElement) {
            const index = el.getAttribute("data-index");
            if (index) {
                arr[Number(index)] = el;
            }
        }
    }
    return arr;
};

/**
 * 过滤group 看看哪个group的可见部分相对比较多
 * @param ref
 * @param id
 * @returns
 */
const filterGroup = (arr: HTMLElement[], scrollBody: HTMLElement): number => {
    const bodyRect = scrollBody.getBoundingClientRect();
    let activeElement:
        | {
              client: number;
              index: number;
          }
        | undefined = undefined;
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const rect = item.getBoundingClientRect();

        if (rect.bottom > 0 && rect.top < bodyRect.bottom) {
            /**可视高度 */
            let clientHeight = rect.height;
            if (rect.top < 0) {
                clientHeight += rect.top;
            }

            if (rect.bottom > bodyRect.bottom) {
                clientHeight += bodyRect.bottom - rect.bottom;
            }
            /**可视高度 end */
            if (activeElement) {
                if (clientHeight > activeElement.client) {
                    activeElement = {
                        client: clientHeight,
                        index: i,
                    };
                }
            } else {
                activeElement = {
                    client: clientHeight,
                    index: i,
                };
            }
        }
    }
    return activeElement ? activeElement.index : arr.length - 1;
};

export const useActiveStatus = (
    ref: RefObject<HTMLDivElement | null>,
    id: string,
): ActiveStatusResult => {
    const [show, setShow] = useState(false);
    const [topActive, setTopActive] = useState(false);
    const [bottomActive, setBottomActive] = useState(false);
    const activeIndex = useRef(0);
    const [isBottom, setIsBottom] = useState(false);

    const idRef = useRef(id);
    idRef.current = id;

    const update = useRef(() => {
        if (!ref.current) {
            return;
        }

        const scrollBody = getScrollBody(ref.current);
        /**
         * 至少可以滚动50个像素
         */
        if (scrollBody && scrollBody.scrollHeight - scrollBody.offsetHeight > 50) {
            const arr = getElements(idRef.current);
            setShow(true);
            if (scrollBody.scrollTop === 0) {
                activeIndex.current = 0;
                setTopActive(false);
                setBottomActive(true);
                setIsBottom(false);
            } else {
                activeIndex.current = filterGroup(arr, scrollBody);

                setTopActive(activeIndex.current > 0);
                setBottomActive(activeIndex.current < arr.length - 1);
                setIsBottom(
                    scrollBody.scrollHeight <= scrollBody.offsetHeight + scrollBody.scrollTop ||
                        activeIndex.current === arr.length - 1,
                );
            }
            return;
        }

        setShow(false);
    });

    useEffect(() => {
        update.current();
    }, []);

    return {
        show,
        topActive,
        bottomActive,
        activeIndex,
        isBottom,
        update,
    };
};
