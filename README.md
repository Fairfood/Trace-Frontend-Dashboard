# Fair Food Dashboard (V3.0)

Welcome to Fairfood's revolutionary traceability solution! The Fairfood Dashboard, built with Angular 15, provides an intuitive interface for agri-food businesses to trace their products, manage transactions, and monitor stock levels.

## Installation

Follow these steps to set up the project on your local machine:

1. **NodeJS and Angular:**
   - Install NodeJS (version 14.15 or higher).
   - Install the Angular version (15.2.3).
   - Application's current Angular version is 15 to ensure maximum compatibility

2. **Clone the Repository:**
   ```bash
   git clone git@git.cied.in:fairfood/trace-v2/frontend/fairfood-trace-dashboard-v3.git
   ```

3. **Navigate to the Cloned Directory:**
   ```bash
   cd fairfood-trace-dashboard-v3
   ```

4. **Install Dependencies:**
   ```bash
   npm install
   ```

## Getting Started Locally

To run the application on your local machine:

1. **Execute Angular CLI:**
   ```bash
   ng serve
   ```

2. **Connect to API Server:**
   - By default, the application connects to the dev API server.
   - Change the API server in `src/environment.ts` if needed.

## Environments

The Fairfood Dashboard supports four environments:

1. **Dev:** Used for development and QA testing.
2. **Stage:** Application verification server.
3. **Prod:** Live production application.
4. **Demo:** For demonstration purposes (for stakeholders/business groups).

## Build for Production

To build the application for production:

```bash
ng build --prod --c=${production/staging/dev/demo}
```

## Testing

Execute unit tests via Karma:

```bash
ng test
```

## Tools and Dependencies

- **ESLint**
- **Prettier**

## External Libraries Used

- [file-saver](https://www.npmjs.com/package/file-saver)
- [ngx-image-cropper](https://www.npmjs.com/package/ngx-image-cropper)
- [ngx-translate](https://www.npmjs.com/package/@ngx-translate/core)
- [ng2-charts](https://www.npmjs.com/package/ng2-charts)
- [js-marker-clusterer](https://www.npmjs.com/package/js-marker-clusterer)
- [html2canvas](https://www.npmjs.com/package/html2canvas)
- [html-to-image](https://www.npmjs.com/package/html-to-image)
- [dom-to-image](https://www.npmjs.com/package/dom-to-image)
- [chart.js](https://www.chartjs.org/)
- [ngx-qrcode](https://www.npmjs.com/package/@techiediaries/ngx-qrcode)
- [totp-generator](https://www.npmjs.com/package/totp-generator)

This project is open source and welcomes contributions! Feel free to explore, modify, and enhance the Fairfood Dashboard. If you have any questions or feedback, please reach out to our community.
