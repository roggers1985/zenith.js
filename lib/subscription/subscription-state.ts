import { CountMap } from 'lib/utils/count-map';
import type { Subscription, Topic } from './subscription';

export class SubscriptionState {
    private readonly _subscriptionsById = new Map<string, Subscription>();
    private readonly _subscriptionIdsByPair = new Map<string, string[]>();
    private readonly _subscriptionTopicCount = new CountMap();

    private readonly _providerSubscriptionCount = new CountMap();

    get hasSubscriptions() {
        return this._subscriptionsById.size > 0;
    }

    get subscriptionIds() {
        return new Set(this._subscriptionsById.keys());
    }

    hasSubscriptionsForPair(pair: string) {
        return this._subscriptionIdsByPair.has(pair);
    }

    hasSubscriptionsForTopic(topic: Topic) {
        return this._subscriptionTopicCount.get(topic) > 0;
    }

    subscriptionsForPair(pair: string) {
        const subscriptionIds = this._subscriptionIdsByPair.get(pair) ?? [];

        return subscriptionIds
            .map((id) => this._subscriptionsById.get(id))
            .filter((sub) => sub !== undefined);
    }

    hasSubscriptionById(id: string) {
        return this._subscriptionsById.has(id);
    }

    addSubscription(subscription: Subscription) {
        const pair = subscription.pair;
        const ids = this._subscriptionIdsByPair.get(pair) ?? [subscription.id];

        this._subscriptionsById.set(subscription.id, subscription);
        this._subscriptionIdsByPair.set(subscription.pair, ids);
        this._subscriptionTopicCount.increment(subscription.topic);
        this._providerSubscriptionCount.increment(subscription.provider);
    }

    removeSubscription(subscriptionId: string) {
        const subscription = this._subscriptionsById.get(subscriptionId);

        if (!subscription) {
            return;
        }

        const ids = this._subscriptionIdsByPair.get(subscription.pair) ?? [];
        const isLast = ids.length === 1;

        this._subscriptionsById.delete(subscriptionId);
        this._subscriptionTopicCount.decrement(subscriptionId);
        this._providerSubscriptionCount.decrement(subscription.provider);

        if (isLast) {
            this._subscriptionIdsByPair.delete(subscription.pair);

            return;
        }

        this._subscriptionIdsByPair.set(
            subscription.pair,
            ids.filter((id) => id != subscriptionId)
        );
    }

    clear() {
        this._subscriptionsById.clear();
    }
}
