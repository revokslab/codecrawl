import { protectedMiddleware, publicMiddleware } from '~/rest/middlewares';
import { createRouter } from '~/utils';

import { fileTreeRouter } from './file-tree';
import { keysRouter } from './keys';
import { llmsTxtRouter } from './llms-txt';

const routers = createRouter();

// Public routes (not authenticated)

routers.use(...publicMiddleware);

// Authenticated routes

routers.use(...protectedMiddleware);

routers.route('/keys', keysRouter);
routers.route('/llms-txt', llmsTxtRouter);
routers.route('/file-tree', fileTreeRouter);

export { routers };
