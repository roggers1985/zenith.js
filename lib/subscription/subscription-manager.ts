import { sleep } from 'bun';
import type {
    Subscription,
    SubscriptionMessage,
    SubscriptionProvider,
} from './subscription';
import { noop } from 'lib/utils/noop';
import { assert } from 'lib/utils/assert';
import type { Logger } from 'lib/common/types';

export type SubscriptionManagerStatus = 'offline' | 'connecting' | 'online';

export type SubscriptionManagerOptions = Readonly<{
    waitTime?: number;
    interval?: number;
    logger?: Logger;
    subscriptions?: Map<string, Subscription>;
}>;

export type SubscriptionManagerOnMessageCallback = (
    message: SubscriptionMessage
) => void;
/**
 * A manager for subscriptions. For example subscriptions for data streams.
 */
export class SubscriptionManager {
    private readonly _subscriptions = new Map<string, Subscription>();
    private readonly _providers = new Map<string, SubscriptionProvider>();
    private readonly _interval: number;
    private readonly _logger: Logger;
    private readonly _waitTime: number;
    private _onMessage: SubscriptionManagerOnMessageCallback = noop;
    private _status: SubscriptionManagerStatus = 'offline';

    constructor(options?: SubscriptionManagerOptions) {
        this._interval = options?.interval ?? 2_000;
        this._logger = options?.logger ?? { info: noop };
        this._subscriptions = options?.subscriptions ?? new Map();
        this._waitTime = options?.waitTime ?? 5_000;
    }

    /**
     * Starts the subscription manager.
     */
    public async start(options?: { signal?: AbortSignal }) {
        this._logger.info('starting subscription manager');

        return new Promise((res) => {
            this.setStatus('online');

            const intervalId = setInterval(async () => {
                if (options?.signal?.aborted) {
                    this.stop();
                }

                if (this._status === 'offline') {
                    res(null);

                    clearInterval(intervalId);
                }

                await this._process();
            }, this._interval);
        });
    }

    public onMessage(callback: SubscriptionManagerOnMessageCallback) {
        this._onMessage = callback;
    }

    /**
     * Stops the subscription manager.
     */
    public stop() {
        this._logger.info('stopping subscription manager');

        this.setStatus('offline');
    }

    /**
     * Subscribe to a subscription.
     *
     * @param subscription The subscription to be managed by the subscription manager.
     */
    public subscribe(subscription: Subscription) {
        this._subscriptions.set(subscription.id, subscription);
    }

    /**
     * Removes a subscription from the subscription manager.
     *
     * @param subscriptionId The subscription's id to be removed.
     */
    public unsubscribe(subscriptionId: string) {
        this._subscriptions.delete(subscriptionId);
    }

    /**
     * Add a provider to the subscription manager.
     *
     * @param provider The provider to be added.
     */
    public addProvider(provider: SubscriptionProvider) {
        this._providers.set(provider.id, provider);
    }

    /**
     * Returns the status of the subscription manager.
     */
    public get status() {
        return this._status;
    }

    /**
     * Handles subscription, connectivity and price streams.
     */
    private async _process() {
        await this._handleConnects();
        await this._handleSubscribes();
        // await this._handleSubscribes();
        // await this._handleConnects();
        // await this._handleUnsubscribes();
        // await this._handleDisconnects();
        await this._wait();
    }

    /**
     * Connects to providers that have active subscribers.
     */
    private async _handleConnects() {
        for await (const [, subscription] of this._subscriptions) {
            const provider = this._providers.get(subscription.provider);

            if (!provider) {
                return;
            }

            if (provider.connected) {
                return;
            }

            await provider.connect(this._onMessage);
        }
    }

    /**
     * Subscribes to providers based on newly added subscriptions in the subscription manager.
     */
    private async _handleSubscribes() {
        for await (const [, subscription] of this._subscriptions) {
            const provider = this._providers.get(subscription.provider);

            assert(provider);

            // If the provider is not yet connected, skip this round and wait for it to be connected first.
            if (!provider.connected) {
                return;
            }

            // The provider already has a corresponding subscription.
            if (provider.subscribedTo(subscription.id)) {
                return;
            }

            // The provider is not yet subscribed, so subscribe.
            await provider.subscribe(subscription);
        }
    }

    /**
     * Disconnects from providers without active subscribers.
     */
    private async _handleDisconnects() {
        // for await (const [, provider] of this._providers) {
        //   for await (const [, subscription] of this._subscriptions) {
        //   }
        // }
        // for await (const [, provider] of this._providers) {
        //     if (provider.subscriptionIds().size > 0) {
        //         return;
        //     }
        //     await provider.disconnect();
        // }
    }

    /**
     * Unsubscribes providers from subscriptions that are no longer managed
     * by the subscription manager.
     */
    private async _handleUnsubscribes() {
        for (const [, provider] of this._providers) {
            const subscriptionIds = provider.subscriptionIds();
            for await (const [subscriptionId] of subscriptionIds) {
                await provider.unsubscribe(subscriptionId);
            }
        }
    }

    /**
     * Used for suspending the process.
     * In order to not overload data providers with requests.
     */
    private async _wait() {
        await sleep(this._waitTime);
    }

    /**
     * Set the status of the subscription manager.
     * @param status The target status for the subscription manager.
     */
    private setStatus(status: SubscriptionManagerStatus) {
        this._status = status;
    }
}
