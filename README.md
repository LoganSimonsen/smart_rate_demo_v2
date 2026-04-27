This demo app showcases EasyPost SmartRate data. It creates an EasyPost shipment, retrieves SmartRate time-in-transit data, and renders the results in an HTML table.

<img src="https://github.com/LoganSimonsen/smart_rate_demo/icons/sr.gif" />

### Install Dependencies

```
npm install
```

### Create .env File

```
touch .env
```

File should look something like this:

```
EP_TEST_KEY=E4321FDSA
EP_PRODUCTION_KEY=E1234ASDF
```

Replace the example keys above with your EasyPost API keys which you can get from the [EasyPost Dashboard](https://www.easypost.com/account/api-keys) (development accounts are free)

### Starting the Server

```
npm run dev
```

For a production-style local run:

```
npm start
```

Then open `http://localhost:8080`.

### Render Deployment

This repo is now set up to run as a single Render web service:

1. Push this folder to a new GitHub repository named `smart_rate_demo_v2`.
2. In Render, create a new Web Service from that repository.
3. Render will detect `render.yaml`.
4. Set `EP_PRODUCTION_KEY` in Render environment variables.
5. If you host the frontend on another domain, set `CORS_ALLOWED_ORIGINS` to a comma-separated list of allowed origins.

The app serves both the frontend and the proxy from the same service, so no laptop-hosted Node server or hardcoded `ngrok` URL is required.

### Using The App

Start the server and open the app in a browser. The frontend now calls the same origin by default, so the deployed Render URL works without code changes.

### Limiting scope of carrier accounts rated against

In `smart_rate_example.js` you can edit the `carrier_accounts` list in `fetchRates()`.
