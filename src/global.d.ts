declare module "*.png" {
    const value: string;
    export = value;
}

declare module "*.svg" {
    const value: string;
    export = value;
}

declare module "*.worker.ts" {
    class WebpackWorker extends Worker {
        constructor();
    }
    export default WebpackWorker;
}
