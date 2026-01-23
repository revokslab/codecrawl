import { createRouter } from '~/utils';

const llmsTxtRouter = createRouter();

llmsTxtRouter.get('/', (c) => {
  return c.json({
    message: 'Hello World',
  });
});

export { llmsTxtRouter };
