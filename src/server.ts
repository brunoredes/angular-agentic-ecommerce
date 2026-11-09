import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Forward /api to the Go backend so the browser talks to one origin (the sid cookie stays first-party).
 * Only the headers the API uses are forwarded.
 */
const apiOrigin = process.env['API_ORIGIN'] ?? 'http://localhost:8080';
app.use('/api', async (req, res, next) => {
  try {
    const headers: Record<string, string> = {};
    if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'];
    if (req.headers.cookie) headers['cookie'] = req.headers.cookie;
    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
    const upstream = await fetch(apiOrigin + req.originalUrl, {
      method: req.method,
      headers,
      body: hasBody ? (req as unknown as BodyInit) : undefined, // streams the request body
      duplex: 'half',
    } as RequestInit);
    res.status(upstream.status);
    for (const cookie of upstream.headers.getSetCookie()) res.append('set-cookie', cookie);
    const type = upstream.headers.get('content-type');
    if (type) res.type(type);
    res.send(Buffer.from(await upstream.arrayBuffer()));
  } catch (err) {
    next(err);
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
