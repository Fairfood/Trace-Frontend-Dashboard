export const clientId = 'Jd0mGNrP2ZwAPsp48QByCQpjTiXSQ9f5Xpuz5r2D';
export const clientSecret =
  'KQL4rfWoadtmmUHygKWMM3er23FhDa5FqINrA2Oq2fErnNbZHK30Xa7gWJMAHRa0m7JxpnM83fXL3wLJlDGY9OEnaM3lMrijGfLMHqJlwTMQqHHtgYd5feWGr47tcHPL';

const API_URL = 'https://v2.staging.api.fairfood.org/';
// google map api key same as development
export const environment = {
  production: true,
  baseUrl: `${API_URL}v2`,
  ssoBaseUrl: API_URL,
  storyTellingUrl: 'https://story-stage.fairfood.org/#/',
  googleMapKey: 'AIzaSyBF5G1enBrsJunVwtqYJGAMcTs064LaIfE',
  authUrl: 'https://login-stage.fairfood.org',
  adminUrl: 'https://admin-stage.fairfood.nl/',
  totpToken: 'EMRWC3TFNRSXA2DBNZ2HGZLDOJSXI6LPOVXGKZLENZXXOIZD',
  sentryDsn:
    'https://da5fc91f6d47454abc9460c2289bf05d@o1261458.ingest.sentry.io/4505073544003584',
  sentryEnv: 'stage',
  // new sso integration
  clientId,
  clientSecret,
  authenticateUrl: `https://login-stage.fairfood.org/sso-authorization?redirect_uri=https://trace-stage.fairfood.nl/&client_id=${clientId}&response_type=code&client_secret=${clientSecret}&app_type=Trace`,
};
