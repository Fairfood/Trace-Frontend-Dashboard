export const clientId = 'YjPYkVZHf95VkNlG4AUCaleczzk2A6lTTOkYZRdY';
export const clientSecret =
  'w640XBIx4o2dpsaQ1nnBlfMkPIrs01X0GEcQosQvqpbnSyM5a1uIFY3kK6xwh1Kmodm3CCv9tNLmVuAWqlCOj6EEGlfdzU8KVpGGmT787eB27fvSS5NZy4UoVerD21zH';

const API_URL = 'https://v2.api.fairfood.org/';
// google map api key same as development
export const environment = {
  production: true,
  baseUrl: `${API_URL}v2`,
  ssoBaseUrl: API_URL,
  storyTellingUrl: 'https://story.fairfood.org/#/',
  googleMapKey: 'AIzaSyBB3fdkXQMKBlDKY4lXOg2z5Ra0-n5iwlc',
  authUrl: 'https://login.fairfood.org',
  adminUrl: 'https://admin-trace.fairfood.org/',
  // totpToken: 'EMRWC3TFNRSXA2DBNZ2HGZLDOJSXI6LPOVXGKZLENZXXOIZD',
  totpToken: 'QUUV6LBNOAOAGRPQWQQMPGYR2OF5KXG7',
  sentryDsn:
    'https://7d9c7779ae534d85bb23d1c0e32d88be@o1261458.ingest.sentry.io/4505079124656128',
  sentryEnv: 'production',
  // new sso integration
  clientId,
  clientSecret,
  authenticateUrl: `https://login.fairfood.org/sso-authorization?redirect_uri=https://trace.fairfood.org/&client_id=${clientId}&response_type=code&client_secret=${clientSecret}&app_type=Trace`,
};
