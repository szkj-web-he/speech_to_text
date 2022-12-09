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

/**
 * 检测到一句话的开始
 */
export interface BeginMessage {
    header: {
        message_id: string;
        name: "SentenceBegin";
        namespace: "SpeechTranscriber";
        status: number;
        status_message: string;
        task_id: string;
    };
    payload: {
        session_id: string;
    };
}

/**
 * 之前识别的被改变
 */
export interface ChangeMessage {
    header: {
        message_id: string;
        name: "TranscriptionResultChanged";
        namespace: "SpeechTranscriber";
        status: number;
        status_message: string;
        task_id: string;
    };
    payload: {
        index: number;
        time: number;
        result: string;
        words: Array<{
            text: string;
            startTime: number;
            endTime: number;
        }>;
    };
}

/**
 * 检测到句子的结束
 */
export interface EndMessage {
    header: {
        message_id: string;
        name: "SentenceEnd";
        namespace: "SpeechTranscriber";
        status: number;
        status_message: string;
        task_id: string;
    };
    payload: {
        index: number;
        time: number;
        begin_time: number;
        result: string;
    };
}
/**
 * 句子的停止
 */
export interface CompletedMessage {
    header: {
        message_id: string;
        name: "TranscriptionCompleted";
        namespace: "SpeechTranscriber";
        status: number;
        status_message: string;
        task_id: string;
    };
}

export type ALiMessageProps =
    | StartMessage
    | BeginMessage
    | ChangeMessage
    | EndMessage
    | CompletedMessage;
