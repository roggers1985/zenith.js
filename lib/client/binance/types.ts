export type BinanceClientTicker = {
    E: number; // Timestamp
    s: string; // Pair
    b: string; // Bid price
    a: string; // Ask price
};

export type BinanceClientResultMessage = {
    id: string;
    result: null | string[] | true;
};

export type BinanceClientStreamMessage = {
    stream: '!ticker@arr';
    data: BinanceClientTicker[];
};

export type BinanceClientMessage =
    | BinanceClientResultMessage
    | BinanceClientStreamMessage;

type BinanceClientMethod = 'SUBSCRIBE' | 'UNSUBSCRIBE' | 'LIST_SUBSCRIPTIONS';

export type BinanceClientStream = '!ticker@arr';

export type BinanceClientRequest = {
    id: string;
    method: BinanceClientMethod;
    params?: string[];
};

export type BinanceClientMessageCallback = (
    message: BinanceClientStreamMessage
) => void;
