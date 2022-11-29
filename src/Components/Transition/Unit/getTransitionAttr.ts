/**
 * @file get transition attr
 * @date 2021-11-28
 * @author xuejie.he
 * @lastModify xuejie.he 2021-11-28
 */

const toMs = (s: string) => (s ? Number(s.slice(0, -1)) * 1000 : 0);

const getTimeout = (delays: string[], durations: string[]) =>
    delays.length > durations.length
        ? Math.max(...delays.map((item, n) => toMs(item) + toMs(durations[n])))
        : Math.max(...durations.map((item, n) => toMs(item) + toMs(delays[n])));

/**
 *
 * @param {HTMLElement} el
 * @returns {timeout: number;propCount: number;}
 */
export const getTransitionAttr = (
    el: HTMLElement,
): {
    timeout: number;
    propCount: number;
} => {
    const styles = window.getComputedStyle(el, null);

    const transitionDelays = styles.transitionDelay.split(", ");
    const transitionDurations = styles.transitionDuration.split(", ");
    const transitionTimeout = getTimeout(transitionDelays, transitionDurations);

    let timeout = 0;
    let propCount = 0;
    if (transitionTimeout > 0) {
        timeout = transitionTimeout;
        propCount = transitionDurations.length;
    }

    return {
        timeout,
        propCount,
    };
};
