import pino from 'pino';
import Elysia from 'elysia';

const { PORT = 3_000, LOG_LEVEL = 'info' } = process.env;

const logger = pino({
    level: LOG_LEVEL,
});

async function run() {
    logger.info('starting API-server');
    const app = new Elysia()
        .get('/alerts', () => {
            return [];
        })
        .post('/alerts', () => {
            return null;
        })
        .delete('/alerts/:id', () => {
            return null;
        });
    app.listen(PORT);
}

run();
