export type Subscription = {
    id: string;
    topic: 'ticker';
    pair: string;
    provider: string;
};

export type SubscriptionTickerMessage = {
    subscriptionId: string;
    topic: 'ticker';
    bid: string;
    ask: string;
    pair: string;
    time: number;
};

export type SubscriptionMessage = SubscriptionTickerMessage;

export type SubscriptionProvider = Readonly<{
    /**
     * Connects to the provider.
     */
    connect(onMessage: (message: SubscriptionMessage) => void): void;
    /**
     * Returns a boolean indicating whether the provider is connected, or not.
     */
    get connected(): boolean;
    /**
     * Disconnects from the provider.
     */
    disconnect(): void;
    /**
     * The unique id of the provider.
     */
    get id(): string;
    /**
     * Subscribe to a subscription.
     *
     * @param subscription The subscription to which the provider must subscribe to.
     */
    subscribe(subscription: Subscription): void;
    /**
     * Returns a boolean indicating if the provider is subscribed to the given subscription.
     *
     * @param subscriptionId The subscription id of the subscription to check whether the provider is connected.
     */
    subscribedTo(subscriptionId: string): boolean;
    /**
     * Unsubscribe from a subscription.
     *
     * @param subscriptionId The subscription id of the subscription to unsubscribe from.
     */
    unsubscribe(subscriptionId: string): void;

    subscriptionIds(): Set<string>;
}>;
