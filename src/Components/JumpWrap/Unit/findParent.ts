/**
 * 找父元素
 * 直到当前这个元素是要找的那位时
 */
export const findParent = (el: HTMLElement, parent: HTMLElement): number => {
    let p = el.parentElement;
    let top = el.offsetTop;
    while (p !== parent && p) {
        const style = window.getComputedStyle(p, null);
        if (
            ["auto", "scroll"].includes(style.overflowY) ||
            ["auto", "scroll"].includes(style.overflowX)
        ) {
            top += p?.offsetTop ?? 0;
        }
        p = p?.parentElement ?? null;
    }
    return top;
};
