import { rest } from 'msw';
import { setupMockServer } from './__tests__/mockServer';
import {
  purgeByNameAndMultipleSurrogateKeys,
  purgeByNameAndSurrogateKey,
  purgeByUrl,
} from './fastly';

const serviceSearchListener = vi.fn();
const purgeRequestListener = vi.fn();
const postPurgeRequestListener = vi.fn();
const postPurgeRequestWithMultipleKeysListener = vi.fn();

const mockServer = setupMockServer([
  rest.get('https://api.fastly.com/service/search', (req, res, ctx) => {
    serviceSearchListener(req.url.searchParams.get('name'));
    return res(ctx.status(200), ctx.json({ id: 'mock-service-id' }));
  }),
  rest.all('https://api.fastly.com/purge/*', (req, res, ctx) => {
    purgeRequestListener(req.method, req.url.href);
    return res(ctx.status(200), ctx.json({ status: 'ok' }));
  }),
  rest.post(
    'https://api.fastly.com/service/:serviceId/purge/:surrogateKey',
    (req, res, ctx) => {
      postPurgeRequestListener(
        req.params['serviceId'],
        req.params['surrogateKey'],
      );
      return res(ctx.status(200), ctx.json({ status: 'ok' }));
    },
  ),
  rest.post(
    'https://api.fastly.com/service/:serviceId/purge',
    async (req, res, ctx) => {
      postPurgeRequestWithMultipleKeysListener(
        req.params['serviceId'],
        (await req.json())['surrogate_keys'],
      );
      return res(ctx.status(200), ctx.json({ status: 'ok' }));
    },
  ),
]);

beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());

describe('fastly', () => {
  describe('purgeByUrl', () => {
    it('POST request should be sent', async () => {
      await purgeByUrl('https://example.com/path/to/page');

      expect(purgeRequestListener).toHaveBeenLastCalledWith(
        'POST',
        'https://api.fastly.com/purge/https://example.com/path/to/page',
      );
    });

    it('response should be returned', async () => {
      const response = await purgeByUrl('https://example.com/path/to/page');

      expect(response).toStrictEqual({ status: 'ok' });
    });
  });

  describe('purgeByNameAndSurrogateKey', () => {
    it('service id should be searched by name', async () => {
      await purgeByNameAndSurrogateKey(
        'service name',
        'mock-surrogate-key',
        false,
      );

      expect(serviceSearchListener).toHaveBeenLastCalledWith('service name');
    });

    it('POST purge request should be sent with searched name and key', async () => {
      await purgeByNameAndSurrogateKey(
        'service name',
        'mock-surrogate-key',
        false,
      );

      expect(postPurgeRequestListener).toHaveBeenLastCalledWith(
        'mock-service-id',
        'mock-surrogate-key',
      );
    });

    it('response should be returned', async () => {
      const response = await purgeByNameAndSurrogateKey(
        'service name',
        'mock-surrogate-key',
        false,
      );

      expect(response).toStrictEqual({ status: 'ok' });
    });
  });

  describe('purgeByNameAndMultipleSurrogateKeys', () => {
    it('service id should be searched by name', async () => {
      await purgeByNameAndSurrogateKey(
        'service name',
        'mock-surrogate-key',
        false,
      );

      expect(serviceSearchListener).toHaveBeenLastCalledWith('service name');
    });

    it('POST purge request should be sent with searched name and keys', async () => {
      await purgeByNameAndMultipleSurrogateKeys(
        'service name',
        ['mock-surrogate-key-1', 'mock-surrogate-key-2'],
        false,
      );

      expect(postPurgeRequestWithMultipleKeysListener).toHaveBeenLastCalledWith(
        'mock-service-id',
        ['mock-surrogate-key-1', 'mock-surrogate-key-2'],
      );
    });
  });
});
