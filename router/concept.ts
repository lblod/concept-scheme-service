import Router from 'express-promise-router';

import { Request, Response } from 'express';

import {
  getConceptUris,
  deleteConceptsAndUsage,
  findConceptUsage,
} from '../controller/concept';
import { HTTP_STATUS_CODE, HttpError } from '../utils/http-error';

export const conceptRouter = Router();

conceptRouter.get('/:id/has-usage', async (req: Request, res: Response) => {
  const conceptUris = await getConceptUris([req.params.id]);

  if (conceptUris.length === 0) {
    throw new HttpError(
      `Invalid concept id. Could not find concept with id: ${req.params.id}`,
      HTTP_STATUS_CODE.NOT_FOUND,
    );
  }

  const usageUris = await findConceptUsage(conceptUris[0]);

  res.status(HTTP_STATUS_CODE.OK).send({
    hasUsage: usageUris.length >= 1,
    uris: usageUris,
  });
});

conceptRouter.delete('/batch', async (req: Request, res: Response) => {
  const conceptUris = await getConceptUris(req.body.ids);

  if (conceptUris.length === 0) {
    throw new HttpError(
      'No concept ids found in body',
      HTTP_STATUS_CODE.BAD_REQUEST,
    );
  }

  await deleteConceptsAndUsage(conceptUris);
  res.status(HTTP_STATUS_CODE.NO_CONTENT).send();
});

conceptRouter.delete('/:id', async (req: Request, res: Response) => {
  const conceptUris = await getConceptUris([req.params.id]);

  if (conceptUris.length === 0) {
    throw new HttpError(
      `No concept found for id: ${req.params.id}`,
      HTTP_STATUS_CODE.NOT_FOUND,
    );
  }

  await deleteConceptsAndUsage(conceptUris);
  res.status(HTTP_STATUS_CODE.NO_CONTENT).send();
});
