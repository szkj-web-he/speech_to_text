export interface OptionProps {
    code: string;
    content: string;
}

export interface CustomNavigator {
    mediaDevices?: {
        getUserMedia?: (constraints?: MediaStreamConstraints) => Promise<MediaStream>;
    };
    getUserMedia?: (constraints?: MediaStreamConstraints) => Promise<MediaStream>;
    webkitGetUserMedia?: (constraints?: MediaStreamConstraints) => Promise<MediaStream>;
    mozGetUserMedia?: (constraints?: MediaStreamConstraints) => Promise<MediaStream>;
    msGetUserMedia?: (constraints?: MediaStreamConstraints) => Promise<MediaStream>;
}
