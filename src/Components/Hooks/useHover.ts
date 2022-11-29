/**
 * @file dropdown的hover或focus的事件
 * @date 2022-10-07
 * @author xuejie.he
 * @lastModify xuejie.he 2022-10-07
 */

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

export enum ActionType {
    UpdateBtnAction = "UPDATEBTN",
    UpdateContentAction = "UPDATECONTENT",
}

type UpdateBtnAction = {
    type: ActionType.UpdateBtnAction;
    payload: {
        value: boolean;
        callback: (status: boolean) => void;
    };
};

type UpdateContentAction = {
    type: ActionType.UpdateContentAction;
    payload: {
        value: boolean;
        callback: (status: boolean) => void;
    };
};

type HoverAction = UpdateBtnAction | UpdateContentAction;

export const useHover = (delayOnShow = 150, delayOnHide = 150): ((action: HoverAction) => void) => {
    /**
     * btn的状态
     * 是否被hover、focus
     */
    const btnStatus = useRef(false);
    /**
     * 下拉内容的状态
     * 是否被hover、focus
     */
    const contentStatus = useRef(false);

    const delayOnShowRef = useRef(delayOnShow);
    const delayOnHideRef = useRef(delayOnHide);

    const timer = useRef<number>();

    useLayoutEffect(() => {
        delayOnShowRef.current = delayOnShow;
    }, [delayOnShow]);

    useLayoutEffect(() => {
        delayOnHideRef.current = delayOnHide;
    }, [delayOnHide]);

    useEffect(() => {
        return () => {
            timer.current && window.clearTimeout(timer.current);
        };
    }, []);

    return useCallback((action: HoverAction) => {
        const switchStatus = (callback: (status: boolean) => void) => {
            timer.current && window.clearTimeout(timer.current);
            timer.current =
                btnStatus.current || contentStatus.current
                    ? window.setTimeout(() => {
                          callback(true);
                      }, delayOnShowRef.current)
                    : window.setTimeout(() => {
                          callback(false);
                      }, delayOnHideRef.current);
        };

        switch (action.type) {
            case ActionType.UpdateBtnAction:
                btnStatus.current = action.payload.value;
                break;
            case ActionType.UpdateContentAction:
                contentStatus.current = action.payload.value;
                break;
        }
        switchStatus(action.payload.callback);
    }, []);
};
