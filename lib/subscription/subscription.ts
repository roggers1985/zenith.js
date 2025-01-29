export type Topic = 'ticker' | 'book-ticker';

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

export type SubscriptionBookTickerMessage = {
    subscriptionId: string;
    topic: 'book-ticker';
    bidPrice: string;
    bidQty: string;
    askPrice: string;
    askQty: string;
};

export type SubscriptionMessage =
    | SubscriptionTickerMessage
    | SubscriptionBookTickerMessage;

export type SubscriptionProvider = Readonly<{
    get connected(): boolean;
    /**
     * Returns the unique identifier of the provider.
     */
    get id(): string;
    /**
     * Connects to the provider.
     */
    connect(
        onMessage: (message: SubscriptionMessage) => void
    ): Promise<void> | void;
    /**
     * Returns a boolean indicating whether the provider is connected, or not.
     */
    /**
     * Disconnects the provider.
     */
    disconnect(): Promise<void> | void;
    /**
     * Subscribe to a subscription.
     *
     * @param subscription The subscription to which the provider must subscribe to.
     */
    subscribe(subscription: Subscription): Promise<void> | void;
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
    unsubscribe(subscriptionId: string): Promise<void> | void;
    /**
     * The ids of the subscriptions that the provider is currently handling.
     */
    subscriptionIds(): Set<string>;
}>;
