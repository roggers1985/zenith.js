import pino from 'pino';
import { BinanceWsProvider } from 'lib/subscription/provider/binance-ws';
import { SubscriptionManager } from '../lib/subscription/subscription-manager';

const { LOG_LEVEL = 'info' } = process.env;

const logger = pino({
    level: LOG_LEVEL,
});

async function run() {
    logger.info('starting background-worker');
    const manager = new SubscriptionManager({ logger });
    manager.addProvider(new BinanceWsProvider({ logger }));
    manager.subscribe({
        id: 'ticker_btcusdt',
        topic: 'ticker',
        pair: 'BTCUSDT',
        provider: 'binance',
    });
    manager.onMessage((message) =>
        logger.info(`received message ${JSON.stringify(message, null, 2)}`)
    );
    await manager.start();
}

run();
