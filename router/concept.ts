import Router from 'express-promise-router';

import { Request, Response } from 'express';

import {
  getConceptUris,
  deleteConceptsAndUsage,
  findConceptUsage,
} from '../controller/concept';

export const conceptRouter = Router();

conceptRouter.get('/:id/has-usage', async (req: Request, res: Response) => {
  const conceptUris = await getConceptUris([req.params.id]);

  if (conceptUris.length === 0) {
    throw {
      message: `Invalid concept id. Could not find concept with id: ${req.params.id}`,
      status: 400,
    };
  }

  const usageUris = await findConceptUsage(conceptUris[0]);

  res.status(200).send({
    hasUsage: usageUris.length >= 1,
    uris: usageUris,
  });
});

conceptRouter.delete('/batch', async (req: Request, res: Response) => {
  const conceptUris = await getConceptUris(req.body.ids);

  if (conceptUris.length === 0) {
    throw {
      message: 'No concept ids found in body',
      status: 400,
    };
  }

  await deleteConceptsAndUsage(conceptUris);
  res.status(204).send();
});

conceptRouter.delete('/:id', async (req: Request, res: Response) => {
  const conceptUris = await getConceptUris([req.params.id]);

  if (conceptUris.length === 0) {
    throw {
      message: `No concept found for id: ${req.params.id}`,
      status: 400,
    };
  }

  await deleteConceptsAndUsage(conceptUris);
  res.status(204).send();
});
