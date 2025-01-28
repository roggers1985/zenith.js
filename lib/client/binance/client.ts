import type { Logger } from 'lib/common/types';
import type {
    BinanceClientMessage,
    BinanceClientStreamMessage,
} from './message';

export class BinanceClient {
    private _websocket: WebSocket | null = null;
    private _logger: Logger;

    constructor(options?: { logger: Logger }) {
        this._logger = options?.logger ?? console;
    }

    get connected() {
        return this._websocket?.readyState === WebSocket.OPEN;
    }

    connect() {
        this._logger.info('binance client connecting');
        this._websocket = new WebSocket('wss://stream.binance.com/stream');
    }

    disconnect() {
        this._logger.info('binance client disconnecting');
        this._websocket?.close();
        this._websocket = null;
    }

    onMessage(callback: (message: BinanceClientMessage) => void) {
        if (!this._websocket) {
            return;
        }
        this._websocket.onmessage = (event: MessageEvent) => {
            callback(JSON.parse(event.data) as BinanceClientMessage);
        };
    }

    onDisconnect(callback: () => void) {
        if (!this._websocket) {
            return;
        }
        this._websocket.onclose = callback;
    }

    subscribeToAllTickers() {
        this._logger.info('binance client subscribing to all tickers');
        this._subscribe('1', ['!ticker@arr']);
    }

    unsubscribeFromAllTickers() {
        this._logger.info('binance client unsubscribing from all tickers');
        this._unsubscribe('1', ['!ticker@arr']);
    }

    private _subscribe(id: string, params: string[]) {
        this._send({
            method: 'SUBSCRIBE',
            params,
            id,
        });
    }

    private _unsubscribe(id: string, params: string[]) {
        this._send({
            method: 'UNSUBSCRIBE',
            params,
            id,
        });
    }

    private _send(data: {
        id: string;
        method: 'SUBSCRIBE' | 'UNSUBSCRIBE' | 'LIST_SUBSCRIPTIONS';
        params?: string[];
    }) {
        this._websocket?.send(JSON.stringify(data));
    }
}
