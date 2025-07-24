export const clientId = 'MHD2Y3PE4t5YbXSlwq4IdwOK3g8EGQUSXWomgzxw';
export const clientSecret =
  'td1CEhLj871SJuaFUJBksjRpi4o67rIzf7kh1QN2KUimJzVfbW2uibkurY6UacBTKNnlzESkrxN59VAudqRiExQDqOxmVLVSicQTQte3qt4HWSnPI1bceeJzWmcX796S';

const API_URL = 'https://v2.dev.api.fairfood.org/';
export const environment = {
  production: false,
  baseUrl: `${API_URL}v2`,
  ssoBaseUrl: API_URL,
  storyTellingUrl: 'https://story-dev.fairfood.org/#/',
  googleMapKey: 'AIzaSyBT4Ou4w_n1XpjG4l01nDna5Wimyakt1Wg',
  authUrl: 'http://localhost:3000',
  adminUrl: 'http://localhost:4300',
  totpToken: 'EMRWC3TFNRSXA2DBNZ2HGZLDOJSXI6LPOVXGKZLENZXXOIZD',
  sentryDsn:
    'https://da5fc91f6d47454abc9460c2289bf05d@o1261458.ingest.sentry.io/4505073544003584',
  sentryEnv: 'local',
  // new sso integration
  clientId,
  clientSecret,
  authenticateUrl: `http://localhost:3000/sso-authorization?redirect_uri=http://localhost:4200/&client_id=${clientId}&response_type=code&client_secret=${clientSecret}&app_type=Trace`,
};
