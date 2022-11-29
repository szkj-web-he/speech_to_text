/**
 * @file 监听dom变化
 * @date 2022-05-18
 * @author xuejie.he
 * @lastModify xuejie.he 2022-05-18
 */

export const listenDomChange = (el: Element | undefined, fn: MutationCallback) => {
    const observer = new MutationObserver(fn);
    el &&
        observer.observe(el, {
            attributes: true,
            characterData: true,
            childList: true,
            subtree: true,
        });
    return observer;
};
