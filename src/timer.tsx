import React, { useEffect, useState } from "react";

interface TempProps {
    /**
     * 开始状态
     */
    status: boolean;

    /**
     * 当被暂停时
     */
    handleClick: () => void;

    style?: React.CSSProperties;
}

const zero = (num: number) => {
    if (num < 10) {
        return `0${num}`;
    }
    return num;
};

const formatTime = (num: number) => {
    const m = Math.floor(num / 60);
    const s = num % 60;

    return `${zero(m)}:${zero(s)}`;
};

const Temp: React.FC<TempProps> = ({ status, handleClick, style }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (status) {
            const timer = window.setInterval(() => {
                setCount((pre) => ++pre);
            }, 1000);
            return () => {
                timer && window.clearInterval(timer);
            };
        }
    }, [status]);

    return (
        <div className="timer_wrap" onClick={handleClick} style={style}>
            <div className="timer_value">{formatTime(count)}</div>
            <div className="timer_icon" />
        </div>
    );
};

export default Temp;
