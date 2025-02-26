import Router from 'express-promise-router';

import { Request, Response } from 'express';

import {
  findConceptImplementation,
  getConceptUri,
} from '../controller/concept';

export const conceptRouter = Router();

conceptRouter.get(
  '/:id/has-implementations',
  async (req: Request, res: Response) => {
    const conceptUri = await getConceptUri(req.params.id);

    if (!conceptUri) {
      throw {
        message: `Invalid concept id. Could not find concept with id: ${req.params.id}`,
        status: 400,
      };
    }

    const implementations = await findConceptImplementation(conceptUri);

    res.status(200).send({
      hasImplementations: implementations.length >= 1,
      uris: implementations,
    });
  },
);
