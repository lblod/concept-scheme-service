import { query, update, sparqlEscapeString, sparqlEscapeUri } from 'mu';

export async function getConceptUris(conceptIds: Array<string>) {
  const escapedIds = conceptIds.map((id) => sparqlEscapeString(id)).join('\n');
  const queryResult = await query(`
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>

    SELECT ?concept ?id
    WHERE {
      VALUES ?id { ${escapedIds} }
      ?concept a skos:Concept.
      ?concept mu:uuid ?id .
    }
  `);

  return queryResult.results.bindings.map((b) => b.concept?.value);
}

export async function findConceptImplementation(conceptUri: string) {
  const queryResult = await query(`
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

    SELECT DISTINCT ?implementation
    WHERE {
      ?implementation a ?type .
      ?implementation ?p ${sparqlEscapeUri(conceptUri)} .

      FILTER(?type != skos:Concept)
    }
  `);

  return queryResult.results.bindings
    .map((b) => b.implementation?.value)
    .filter((i) => i);
}

export async function deleteConceptsWithImplementations(
  conceptUris: Array<string>,
) {
  const escapedUris = conceptUris.map((uri) => sparqlEscapeUri(uri)).join('\n');
  try {
    await update(`
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  
      DELETE {
        ?concept ?cP ?cO .
        ?implementation ?p ?concept .
      }
      WHERE {
        VALUES ?concept { ${escapedUris} }
  
        ?concept a skos:Concept .
        ?concept ?cP ?cO .
  
        OPTIONAL {
          ?implementation ?p ?concept .
        }
      }
    `);
  } catch (error) {
    throw {
      message:
        'Something went wrong while deleting the concepts and there implementations',
      status: 500,
    };
  }
}
