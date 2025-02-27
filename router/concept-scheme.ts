import Router from 'express-promise-router';

import { Request, Response } from 'express';

import {
  deleteConceptSchemeWithImplementations,
  findConceptSchemeImplementations,
  getConceptSchemeUri,
  getConceptsInConceptScheme,
} from '../controller/concept-scheme';
import { deleteConceptsWithImplementations } from '../controller/concept';

export const conceptSchemeRouter = Router();

conceptSchemeRouter.get(
  '/:id/has-implementations',
  async (req: Request, res: Response) => {
    const conceptSchemeUri = await getConceptSchemeUri(req.params.id);

    if (!conceptSchemeUri) {
      throw {
        message: `Invalid concept-scheme id. Could not find concept-scheme with id: ${req.params.id}`,
        status: 400,
      };
    }

    const implementations =
      await findConceptSchemeImplementations(conceptSchemeUri);
    const concepts = await getConceptsInConceptScheme(conceptSchemeUri);
    const implementedConceptsCount = concepts
      .map((c) => c.hasImplementation)
      .filter((bool) => bool).length;

    res.status(200).send({
      hasImplementations: implementations.length >= 1,
      uris: implementations,
      totalOfConceptImplementations: implementedConceptsCount,
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

  await deleteConceptSchemeWithImplementations(conceptSchemeUri);
  const conceptUris = (await getConceptsInConceptScheme(conceptSchemeUri)).map(
    (concept) => concept.uri,
  );
  await deleteConceptsWithImplementations(conceptUris);
  res.status(204).send();
});
