import type { Logger } from 'lib/common/types';
import type {
    BinanceClientMessage,
    BinanceClientMessageCallback,
    BinanceClientRequest,
} from 'lib/client/binance-ws/types';

export class BinanceWsClient {
    private _websocket: WebSocket | null = null;
    private _logger: Logger;

    constructor(options?: { logger: Logger }) {
        this._logger = options?.logger ?? console;
    }

    get connected() {
        return this._websocket?.readyState === WebSocket.OPEN;
    }

    connect() {
        this._logger.info('BinanceClient :: connecting');
        this._websocket = new WebSocket('wss://stream.binance.com/stream');
    }

    disconnect() {
        this._logger.info('BinanceClient :: disconnecting');
        this._websocket?.close();
        this._websocket = null;
    }

    onMessage(callback: BinanceClientMessageCallback) {
        if (!this._websocket) {
            return;
        }
        this._websocket.onmessage = (event: MessageEvent) => {
            const message = JSON.parse(event.data) as BinanceClientMessage;
            if ('result' in message) {
                return;
            }
            callback(message);
        };
    }

    onDisconnect(callback: () => void) {
        if (!this._websocket) {
            return;
        }
        this._websocket.onclose = callback;
    }

    subscribeToAllTickers() {
        this._logger.info('BinanceClient :: subscribing to all tickers');
        this._subscribe('1', ['!ticker@arr']);
    }

    unsubscribeFromAllTickers() {
        this._logger.info('BinanceClient :: unsubscribing from all tickers');
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

    private _send(data: BinanceClientRequest) {
        this._websocket?.send(JSON.stringify(data));
    }
}
