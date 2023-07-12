import { FASTLY_API_TOKEN } from './env';

const BASE_URL = 'https://api.fastly.com';

const BASE_HEADERS = {
  'Fastly-Key': FASTLY_API_TOKEN,
  Accept: 'application/json',
};

/**
 * get service detail by name and return its id
 */
async function searchDeliveryServiceIdByName(name: string) {
  const res = await fetch(`${BASE_URL}/service/search?name=${name}`, {
    headers: BASE_HEADERS,
  });
  if (!res.ok) {
    throw new Error('No service found with such a name');
  }

  const data: { id: string } = await res.json();
  return data.id;
}

/**
 * purge by url (as anonymous user)
 */
export async function purgeByUrl(url: string) {
  const res = await fetch(url, {
    method: 'PURGE',
  });
  if (!res.ok) {
    throw new Error('Failed to purge');
  }

  const data = await res.json();
  return data;
}

/**
 * purge by a surrogate key
 */
export async function purgeByNameAndSurrogateKey(
  name: string,
  surrogateKey: string,
  isSoft: boolean,
) {
  const serviceId = await searchDeliveryServiceIdByName(name);

  const res = await fetch(
    `${BASE_URL}/service/${serviceId}/purge/${surrogateKey}`,
    {
      method: 'POST',
      headers: {
        ...BASE_HEADERS,
        ...(isSoft ? { 'fastly-soft-purge': '1' } : {}),
      },
    },
  );
  if (!res.ok) {
    throw new Error('Failed to purge');
  }

  const data = await res.json();

  return data;
}

/**
 * purge by multiple surrogate keys
 */
export async function purgeByNameAndMultipleSurrogateKeys(
  name: string,
  surrogateKeys: string[],
  isSoft: boolean,
) {
  const serviceId = await searchDeliveryServiceIdByName(name);

  const res = await fetch(`${BASE_URL}/service/${serviceId}/purge`, {
    method: 'POST',
    headers: {
      ...BASE_HEADERS,
      ...(isSoft ? { 'fastly-soft-purge': '1' } : {}),
    },
    body: JSON.stringify({
      surrogate_keys: surrogateKeys,
    }),
  });
  if (!res.ok) {
    throw new Error('Failed to purge');
  }

  const data = await res.json();

  return data;
}
