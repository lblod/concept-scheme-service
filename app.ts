import { app } from 'mu';

import express, { Request, Response, ErrorRequestHandler } from 'express';
import bodyParser from 'body-parser';

import { conceptRouter } from './router/concept';
import { conceptSchemeRouter } from './router/concept-scheme';

app.use(
  bodyParser.json({
    limit: '500mb',
    type: function (req: Request) {
      return /^application\/json/.test(req.get('content-type') as string);
    },
  }),
);

app.use(express.urlencoded({ extended: true }));

app.use('/concept', conceptRouter);
app.use('/concept-scheme', conceptSchemeRouter);

app.get('/health-check', async (req: Request, res: Response) => {
  res.send({ status: 'ok' });
});

const errorHandler: ErrorRequestHandler = function (err, _req, res, _next) {
  // custom error handler to have a default 500 error code instead of 400 as in the template
  res.status(err.status || 500);
  res.json({
    error: {
      title: err.message,
      description: err.description?.join('\n'),
    },
  });
};

app.use(errorHandler);
