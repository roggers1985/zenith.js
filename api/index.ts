import pino from 'pino';
import Elysia from 'elysia';

const { LOG_LEVEL = 'info' } = process.env;

const logger = pino({
    level: LOG_LEVEL,
});

async function run() {
    logger.info('starting API-server');

    const app = new Elysia().get('/alerts', () => {
        return [];
    });
}

run();
