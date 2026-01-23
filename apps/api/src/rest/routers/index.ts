import { protectedMiddleware, publicMiddleware } from '~/rest/middlewares';
import { createRouter } from '~/utils';
import { keysRouter } from './keys';

const routers = createRouter();

// Public routes (not authenticated)

routers.use(...publicMiddleware);

// Authenticated routes

routers.use(...protectedMiddleware);

routers.route('/keys', keysRouter);

export { routers };
