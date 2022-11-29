/**
import { useState } from 'react';
 * 监听是否切换成了小屏幕
 * 如果是小于700
 * 就一题一行
 * 如果不是
 * 就一提多行
 */

import { useEffect, useMemo, useState } from "react";
import { deepCloneData } from "../unit";
import { comms } from "..";
import { OptionProps } from "../type";

export const isMobile = (): boolean => window.matchMedia("(any-pointer:coarse)").matches;

export const SplitCols = (): number => {
    const { offsetWidth } = document.documentElement;
    if (offsetWidth >= 1030) {
        return 6;
    }
    if (offsetWidth >= 656) {
        return 4;
    }
    return 2;
};

export const useMapOptions = (): [Array<Array<OptionProps & { span?: number }>>, boolean] => {
    const [cols, setCols] = useState(SplitCols);

    const [mobileStatus, setMobileStatus] = useState(isMobile());

    useEffect(() => {
        const fn = () => {
            setCols(SplitCols());
            setMobileStatus(isMobile());
        };
        window.addEventListener("resize", fn);
        return () => {
            window.removeEventListener("resize", fn);
        };
    }, []);

    const list = useMemo(() => {
        const arr = comms.config.options ?? [];

        const list: Array<Array<OptionProps & { span: number }>> = [];
        let index = -1;

        const span = cols === 4 ? 3 : 2;
        for (let i = 0; i < arr.length; i++) {
            const item = deepCloneData(arr[i]);
            if (i % cols) {
                list[index].push({ ...item, span });
            } else {
                ++index;
                list[index] = [{ ...item, span }];
            }
        }
        return list;
    }, [cols]);

    return [list, mobileStatus];
};
