import { createRouter } from '~/utils';

const fileTreeRouter = createRouter();

fileTreeRouter.get('/', (c) => {
  return c.json({
    message: 'Hello World',
  });
});

export { fileTreeRouter };
