/**
 * @file
 * @date 2021-12-13
 * @author xuejie.he
 * @lastModify xuejie.he 2021-12-13
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { Fragment, isValidElement, useLayoutEffect, useRef, useState } from "react";
import styles from "../../Portal/style.module.scss";
import { findDomFn } from "./findDomNode";
import { useInsertionEffect } from "react";

/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
interface KiteRootProps {
    /**
     *
     */
    children: React.ReactElement | Element;
    /**
     *
     */
    id: string;
    /**
     *
     */
    getRootEl: (res?: Element | undefined) => void;
}
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const KiteRoot: React.FC<KiteRootProps> = ({ children, id, getRootEl }) => {
    KiteRoot.displayName = "KiteRoot";

    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/

    const showIRef = useRef(isValidElement(children));

    const [showI, setShowI] = useState(showIRef.current);

    const ref = useRef<HTMLElement | null>(null);

    const getRootElFn = useRef(getRootEl);

    useInsertionEffect(() => {
        getRootElFn.current = getRootEl;
    }, [getRootEl]);

    useLayoutEffect(() => {
        const show = isValidElement(children);
        if (showIRef.current !== show) {
            setShowI(show);
        }

        if (!isValidElement(children) && children.nodeType === 1) {
            getRootElFn.current(children);
        }
    }, [children]);

    useLayoutEffect(() => {
        if (showI) {
            const el = ref.current;
            if (!el) {
                return;
            }
            const node = el.parentElement;

            const childrenList = node?.children;

            if (!childrenList) {
                return;
            }

            for (const childrenItem of childrenList) {
                if (childrenItem !== el) {
                    const element = childrenItem as HTMLElement;
                    const status = findDomFn(element, id);
                    if (status) {
                        getRootElFn.current(element);
                    }
                }
            }

            showIRef.current = false;
            setShowI(showIRef.current);
        }
    }, [id, showI]);

    /* <------------------------------------ **** STATE END **** ------------------------------------ */

    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/
    if (isValidElement(children)) {
        return (
            <Fragment key={`kiteRoot${id}`}>
                {children}
                {showI && <i ref={ref} className={styles.kiteRoot_i} />}
            </Fragment>
        );
    } else {
        if (children?.nodeType !== 1) {
            console.error(`Wrong root node type!`);
        }
        return <></>;
    }
};
KiteRoot.displayName = "KiteRoot";
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default KiteRoot;
