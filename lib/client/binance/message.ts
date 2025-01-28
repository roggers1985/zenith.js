export type BinanceClientResultMessage = { result: null | string[] | true };

export type BinanceClientTicker = {
    e: '24hrTicker'; // Event type
    E: number; // Timestamp
    s: string; // Pair
    b: string; // Bid price
    a: string; // Ask price
};

export type BinanceClientMiniTicker = {
    e: '24hrMiniTicker'; // Event type
    E: number; // Event time
    s: string; // Symbol
    c: string; // Close price
    o: string; // Open price
    h: string; // High price
    l: string; // Low price
    v: string; // Total traded base asset volume
    q: string; // Total traded quote asset volume
};

export type BinanceClientTickerMessage = {
    data: BinanceClientTicker;
    stream: `${string}@ticker`;
};

export type BinanceClientTickerArrMessage = {
    data: BinanceClientTicker[];
    stream: '!ticker@arr';
};

export type BinanceClientMiniTickerMessage = {
    data: unknown;
    stream: `${string}@miniTicker`;
};

export type BinanceClientMiniTickerArrMessage = {
    data: unknown[];
    stream: `!miniTicker@arr`;
};

export type BinanceClientStreamMessage =
    | BinanceClientTickerMessage
    | BinanceClientTickerArrMessage
    | BinanceClientMiniTickerMessage
    | BinanceClientMiniTickerArrMessage;

export type BinanceClientMessage =
    | BinanceClientResultMessage
    | BinanceClientStreamMessage;

export function isBinanceClientResultMessage(
    message: BinanceClientMessage
): message is BinanceClientResultMessage {
    return 'result' in message;
}

export function isBinanceClientStreamMessage(
    message: BinanceClientMessage
): message is BinanceClientStreamMessage {
    return 'stream' in message;
}

export function isBinanceClientTickerMessage(
    message: BinanceClientStreamMessage
): message is BinanceClientTickerMessage {
    return (
        isBinanceClientStreamMessage(message) &&
        message.stream.endsWith('@ticker')
    );
}

export function isBinanceClientTickerArrMessage(
    message: BinanceClientMessage
): message is BinanceClientTickerArrMessage {
    return (
        isBinanceClientStreamMessage(message) &&
        message.stream === '!ticker@arr'
    );
}

export function isBinanceClientMiniTickerMessage(
    message: BinanceClientMessage
): message is BinanceClientMiniTickerMessage {
    return (
        isBinanceClientStreamMessage(message) &&
        message.stream.endsWith('@miniTicker')
    );
}

export function isBinanceClientMiniTickerArrMessage(
    message: BinanceClientMessage
): message is BinanceClientMiniTickerArrMessage {
    return (
        isBinanceClientStreamMessage(message) &&
        message.stream === '!miniTicker@arr'
    );
}
