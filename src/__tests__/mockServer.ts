import { setupServer } from 'msw/node';
import type { RestHandler } from 'msw';

export function setupMockServer(handlers: RestHandler[]) {
  return setupServer(...handlers);
}
