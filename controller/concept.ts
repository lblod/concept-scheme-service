import { query, sparqlEscapeString, sparqlEscapeUri } from 'mu';

export async function getConceptUri(conceptId: string) {
  const queryResult = await query(`
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>

    SELECT ?concept
    WHERE {
      ?concept a skos:Concept.
      ?concept mu:uuid ${sparqlEscapeString(conceptId)} .
    } LIMIT 1
  `);

  return queryResult.results.bindings[0]?.concept?.value;
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
