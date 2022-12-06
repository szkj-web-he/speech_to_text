import React from "react";
import "./font.scss";
import "./style.scss";

import { ConfigYML, PluginComms } from "@possie-engine/dr-plugin-sdk";
import { ScrollComponent } from "./Components/Scroll";
import Header from "./header";
import MainContent from "./main";
import { OptionProps } from "./type";

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

    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/

    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/

    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    return (
        <ScrollComponent hidden={{ x: true }} className="wrapper">
            <Header />
            <MainContent />
        </ScrollComponent>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
comms.renderOnReady(<Main />);
