import Router from 'express-promise-router';

import { Request, Response } from 'express';

import {
  findConceptImplementation,
  getConceptUris,
  deleteConceptsWithImplementations,
} from '../controller/concept';

export const conceptRouter = Router();

conceptRouter.get(
  '/:id/has-implementations',
  async (req: Request, res: Response) => {
    const conceptUris = await getConceptUris([req.params.id]);

    if (conceptUris.length === 0) {
      throw {
        message: `Invalid concept id. Could not find concept with id: ${req.params.id}`,
        status: 400,
      };
    }

    const implementations = await findConceptImplementation(conceptUris[0]);

    res.status(200).send({
      hasImplementations: implementations.length >= 1,
      uris: implementations,
    });
  },
);

conceptRouter.delete('/ids', async (req: Request, res: Response) => {
  const conceptUris = await getConceptUris(req.body.ids);

  if (conceptUris.length === 0) {
    throw {
      message: 'No concept ids found in body',
      status: 400,
    };
  }

  await deleteConceptsWithImplementations(conceptUris);
  res.status(204).send();
});
