import React, { useEffect, useState } from "react";
import "./font.scss";
import "./style.scss";

import { ConfigYML, PluginComms } from "@possie-engine/dr-plugin-sdk";
import Header from "./header";
import MainContent from "./main";
import { OptionProps } from "./type";
import { ScrollComponent } from "./Components/Scroll";

// import vConsole from "vconsole";

// new vConsole();

export const comms = new PluginComms({
    defaultConfig: new ConfigYML(),
}) as {
    config: {
        question?: string;
        instruction?: string;
        optionsInstruction?: string;
        options?: Array<OptionProps>;
    };
    state: unknown;
    renderOnReady: (res: React.ReactNode) => void;
};

const Main: React.FC = () => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/
    const [ready, setReady] = useState(false);

    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/

    useEffect(() => {
        const encNode = document.createElement("script");
        const sha256Node = document.createElement("script");
        const sha1Node = document.createElement("script");
        const md5Node = document.createElement("script");
        encNode.src = new URL("./js/enc-base64-min.js", import.meta.url).toString();
        sha256Node.src = new URL("./js/hmac-sha256.js", import.meta.url).toString();
        sha1Node.src = new URL("./js/HmacSHA1.js", import.meta.url).toString();
        md5Node.src = new URL("./js/md5.js", import.meta.url).toString();
        document.head.insertBefore(sha256Node, document.getElementsByTagName("meta")[0]);

        encNode.onload = () => {
            setReady(true);
        };
        sha256Node.onload = () => {
            document.head.insertBefore(sha1Node, document.getElementsByTagName("meta")[0]);
        };
        sha1Node.onload = () => {
            document.head.insertBefore(md5Node, document.getElementsByTagName("meta")[0]);
        };
        md5Node.onload = () => {
            document.head.insertBefore(encNode, document.getElementsByTagName("meta")[0]);
        };
    }, []);

    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/

    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    if (ready) {
        return (
            <ScrollComponent hidden={{ x: true }} className="wrapper">
                <Header />
                <MainContent />
            </ScrollComponent>
        );
    }
    return <></>;
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
comms.renderOnReady(<Main />);
