export { AuthService } from './auth.service';

/**
 * @description of authentication module
 * Authentication Module in trace handles only the part after user enters their credentials
 * User credentials are handled by the login application which is a separate application
 *  - Login application is hosted on a different domain
 *  - After user enters credentials, the login application redirects to trace with a token
 *  - Trace then validates the token and redirects to the respective route
 *  - If the token is invalid, trace redirects to login application
 */
