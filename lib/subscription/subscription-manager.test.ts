import { mock, describe, expect, it, afterEach } from 'bun:test';
import { SubscriptionManager } from './subscription-manager';

describe('SubscriptionManager', () => {
    const mockOptions = { logger: { info: mock() } };
    const newManager = () => new SubscriptionManager(mockOptions);

    afterEach(() => {
        mockOptions.logger.info.mockClear();
    });

    describe('#start', () => {
        it('starts the subscription manager', async () => {
            const manager = newManager();
            const promise = manager.start();
            expect(manager.status).toBe('online');
            manager.stop();
            await promise;
        });

        it('calls the logger#info-method', async () => {
            const manager = newManager();
            const promise = manager.start();
            expect(mockOptions.logger.info).toHaveBeenCalledTimes(1);
            expect(mockOptions.logger.info).toHaveBeenCalledWith(
                'starting subscription manager'
            );
            manager.stop();
            await promise;
        });

        it("stops the subscription manager when the given signal's abortion is triggered", async () => {
            const abortController = new AbortController();
            const manager = newManager();
            const promise = manager.start({ signal: abortController.signal });
            expect(manager.status).toBe('online');
            abortController.abort('stopping');
            await promise;
            expect(manager.status).toBe('offline');
        });
    });

    describe('#stop', () => {
        it('stops the subscription manager', async () => {
            const manager = newManager();
            const promise = manager.start();
            manager.stop();
            expect(manager.status).toBe('offline');
            await promise;
        });

        it('calls the logger#info-method', async () => {
            const manager = newManager();
            const promise = manager.start();
            manager.stop();
            expect(mockOptions.logger.info).toHaveBeenCalledTimes(2);
            expect(mockOptions.logger.info).toHaveBeenCalledWith(
                'stopping subscription manager'
            );
            expect(manager.status).toBe('offline');
            await promise;
        });
    });
});
