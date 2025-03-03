import Router from 'express-promise-router';

import { Request, Response } from 'express';

import {
  deleteConceptScheme,
  findConceptSchemeUsage,
  getConceptSchemeUri,
  getConceptsInConceptScheme,
} from '../controller/concept-scheme';

export const conceptSchemeRouter = Router();

conceptSchemeRouter.get(
  '/:id/has-usage',
  async (req: Request, res: Response) => {
    const conceptSchemeUri = await getConceptSchemeUri(req.params.id);

    if (!conceptSchemeUri) {
      throw {
        message: `Invalid concept-scheme id. Could not find concept-scheme with id: ${req.params.id}`,
        status: 400,
      };
    }

    const usageUris = await findConceptSchemeUsage(conceptSchemeUri);
    const concepts = await getConceptsInConceptScheme(conceptSchemeUri);
    const conceptUsageCount = concepts
      .map((c) => c.hasUsage)
      .filter((bool) => bool).length;

    res.status(200).send({
      hasUsage: usageUris.length >= 1,
      uris: usageUris,
      conceptUsageCount,
    });
  },
);

conceptSchemeRouter.delete('/:id', async (req: Request, res: Response) => {
  const conceptSchemeUri = await getConceptSchemeUri(req.params.id);

  if (conceptSchemeUri.length === 0) {
    throw {
      message: `Invalid concept-scheme id. Could not find concept-scheme with id: ${req.params.id}`,
      status: 400,
    };
  }

  await deleteConceptScheme(conceptSchemeUri);
  res.status(204).send();
});
