/**
 * 深克隆
 */
export const deepCloneData = <T>(data: T): T => {
    if (data == null) {
        return data;
    }

    return JSON.parse(JSON.stringify(data)) as T;
};
