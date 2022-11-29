/**
 * @file add style
 * @date 2021-11-26
 * @author xuejie.he
 * @lastModify xuejie.he 2021-11-26
 */

import React from "react";

/**
 *
 * @param {HTMLElement} el
 * @param {React.CSSProperties} css
 * @returns {void}
 */
export const setStyle = (el: HTMLElement, css?: React.CSSProperties): void => {
    el.removeAttribute("style");
    Object.assign(el.style, css);
    if (!el.getAttribute("style")) {
        el.removeAttribute("style");
    }
};
