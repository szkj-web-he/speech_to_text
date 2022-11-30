interface MessageProps {
    type: "pending" | unknown;
    buffer: Float32Array;
}

self.onmessage = (e: MessageEvent<MessageProps>) => {
    switch (e.data.type) {
        case "pending-":
            transform.transaction(e.data.buffer);
            break;
    }
};

const transform = {
    transaction(buffer: Float32Array) {
        const bufTo16kHz = transform.to16kHz(buffer);
        const bufTo16BitPCM = transform.to16BitPCM(bufTo16kHz);
        self.postMessage({ buffer: bufTo16BitPCM });
    },
    to16kHz(buffer: Float32Array) {
        const data = new Float32Array(buffer);
        const fitCount = Math.round(data.length * (16_000 / 44_100));
        const newData = new Float32Array(fitCount);
        const springFactor = (data.length - 1) / (fitCount - 1);
        newData[0] = data[0];
        for (let i = 1; i < fitCount - 1; i++) {
            const tmp = i * springFactor;
            const before = Number(Math.floor(tmp).toFixed());
            const after = Number(Math.ceil(tmp).toFixed());
            const atPoint = tmp - before;
            newData[i] = data[before] + (data[after] - data[before]) * atPoint;
        }
        newData[fitCount - 1] = data[data.length - 1];
        return newData;
    },

    to16BitPCM(input: Float32Array) {
        const dataLength = input.length * (16 / 8);
        const dataBuffer = new ArrayBuffer(dataLength);
        const dataView = new DataView(dataBuffer);
        let offset = 0;
        for (let i = 0; i < input.length; i++, offset += 2) {
            const s = Math.max(-1, Math.min(1, input[i]));
            dataView.setInt16(offset, s < 0 ? s * 0x80_00 : s * 0x7f_ff, true);
        }
        return Array.from(new Int8Array(dataView.buffer));
    },
    toBase64(buffer: Float32Array) {
        let binary = "";
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    },
};
