import Router from 'express-promise-router';

import { Request, Response } from 'express';

import {
  deleteConceptScheme,
  findConceptSchemeUsage,
  getConceptSchemeUri,
  getConceptsInConceptScheme,
} from '../controller/concept-scheme';
import { HTTP_STATUS_CODE, HttpError } from '../utils/http-error';

export const conceptSchemeRouter = Router();

conceptSchemeRouter.get(
  '/:id/has-usage',
  async (req: Request, res: Response) => {
    const conceptSchemeUri = await getConceptSchemeUri(req.params.id);

    if (!conceptSchemeUri) {
      throw new HttpError(
        `Invalid concept-scheme id. Could not find concept-scheme with id: ${req.params.id}`,
        HTTP_STATUS_CODE.NOT_FOUND,
      );
    }

    const usageUris = await findConceptSchemeUsage(conceptSchemeUri);
    const concepts = await getConceptsInConceptScheme(conceptSchemeUri);
    const conceptUsageCount = concepts
      .map((c) => c.hasUsage)
      .filter((bool) => bool).length;

    res.status(HTTP_STATUS_CODE.OK).send({
      hasUsage: usageUris.length >= 1,
      uris: usageUris,
      conceptUsageCount,
    });
  },
);

conceptSchemeRouter.delete('/:id', async (req: Request, res: Response) => {
  const conceptSchemeUri = await getConceptSchemeUri(req.params.id);

  if (conceptSchemeUri.length === 0) {
    throw new HttpError(
      `Invalid concept-scheme id. Could not find concept-scheme with id: ${req.params.id}`,
      HTTP_STATUS_CODE.BAD_REQUEST,
    );
  }

  await deleteConceptScheme(conceptSchemeUri);
  res.status(HTTP_STATUS_CODE.NO_CONTENT).send();
});
