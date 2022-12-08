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

export interface StartMessage {
    header: {
        message_id: string;
        name: "TranscriptionStarted";
        namespace: "SpeechTranscriber";
        status: number;
        status_text: string;
        task_id: string;
    };
}

export type ALiMessageProps = StartMessage;
