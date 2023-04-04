/**
 * 找父元素
 * 直到当前这个元素是要找的那位时
 */
export const findParent = (el: HTMLElement, parent: HTMLElement): number => {
    const parentRect = parent.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    return parent.scrollTop + (elRect.top - parentRect.top);
};
