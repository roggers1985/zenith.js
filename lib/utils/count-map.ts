import { assert } from './assert';

export class CountMap {
    private readonly _map: Map<string, number> = new Map();

    keys() {
        return this._map.keys();
    }

    get(key: string) {
        return this._map.get(key) ?? 0;
    }

    has(key: string) {
        return this._map.has(key);
    }

    clear() {
        this._map.clear();
    }

    increment(key: string) {
        const count = this._map.get(key) ?? 0;

        this._map.set(key, count + 1);
    }

    decrement(key: string) {
        const count = this._map.get(key);

        if (count === undefined) {
            return;
        }

        if (count < 1) {
            this._map.delete(key);

            return;
        }

        const nextCount = count - 1;

        assert(nextCount >= 0);

        this._map.set(key, nextCount);
    }
}
