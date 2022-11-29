/**
 * @file get trangle
 * @date 2022-03-22
 * @author xuejie.he
 * @lastModify xuejie.he 2022-03-22
 */

export const getTriangle = (container: HTMLElement, className: string) => {
    const { children } = container;
    let element: HTMLElement | null = null;

    for (let i = 0; i < children.length; ) {
        const el = children[i] as HTMLElement;
        const classVal = el.getAttribute("class");
        if (classVal?.includes(className)) {
            i = children.length;
            element = el;
        } else {
            ++i;
        }
    }
    return element;
};
