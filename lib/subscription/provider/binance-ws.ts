import { BinanceWsClient } from 'lib/client/binance-ws/client';
import type {
    Subscription,
    SubscriptionMessage,
    SubscriptionProvider,
} from '../subscription';
import { SubscriptionProviderState } from '../subscription-provider-state';
import type { Logger } from 'lib/common/types';

/**
 * An adapter for using Binance as a data stream provider.
 */
export class BinanceWsProvider implements SubscriptionProvider {
    private readonly _client: BinanceWsClient;
    private readonly _state = new SubscriptionProviderState();
    private readonly _logger: Logger;

    constructor(options?: { logger: Logger }) {
        this._logger = options?.logger ?? console;
        this._client = new BinanceWsClient({ logger: this._logger });
    }

    get id() {
        return 'binance';
    }

    /**
     * Returns a boolean indicating whether the BinanceProvider is connected or not.
     */
    get connected(): boolean {
        return this._client.connected;
    }

    subscriptionIds(): Set<string> {
        return this._state.subscriptionIds;
    }
    /**
     * Connects to the Binance client, and processes the results.
     *
     * @param onMessage A callback to process the subscription message.
     */
    connect(onMessage: (message: SubscriptionMessage) => void): void {
        this._logger.info('BinanceProvider :: connecting');
        this._client.onDisconnect(this._state.clear);
        this._client.connect();
        this._client.onMessage((message) => {
            message.data
                .filter(({ s }) => this._state.hasSubscriptionsForPair(s))
                .map((ticker) => {
                    this._state
                        .subscriptionsForPair(ticker.s)
                        .forEach((sub) => {
                            onMessage({
                                subscriptionId: sub.id,
                                topic: 'ticker',
                                bid: ticker.b,
                                ask: ticker.a,
                                pair: ticker.s,
                                time: ticker.E,
                            });
                        });
                });
        });
    }

    /**
     * Disconnects from the binance client.
     */
    disconnect(): void {
        this._logger.info('BinanceProvider :: disconnecting');
        this._client.disconnect();
    }

    /**
     * Subscribe to a data stream.
     *
     * @param subscription A subscription to a data stream to subscribe to.
     */
    subscribe(subscription: Subscription): void {
        if (!this._client.connected) {
            return;
        }
        this._logger.info(
            `BinanceProvider :: subscribing subscription with id ${subscription.id}`
        );
        this._state.addSubscription(subscription);
        this._client.subscribeToAllTickers();
    }

    /**
     * Returns a boolean indicating whether the provider is subscribed to the given subscription by its id.
     *
     * @param subscriptionId The id of the subscription
     * @returns a boolean indicating if the provider is subscribed to the subscription by the given id.
     */
    subscribedTo(subscriptionId: string): boolean {
        return this._state.hasSubscriptionById(subscriptionId);
    }

    /**
     * Unsubscribe from a subscription by its id.
     *
     * @param subscriptionId The id of the subscription
     */
    unsubscribe(subscriptionId: string): void {
        this._logger.info(
            `BinanceProvider :: unsubscribing from subscription with id ${subscriptionId}`
        );
        this._state.removeSubscription(subscriptionId);
        if (this._state.hasSubscriptions) {
            return;
        }
        this._client.unsubscribeFromAllTickers();
    }
}
