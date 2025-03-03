import { query, update, sparqlEscapeString, sparqlEscapeUri } from 'mu';

export async function getConceptSchemeUri(conceptSchemeId: string) {
  try {
    const queryResult = await query(`
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  
      SELECT ?conceptScheme
      WHERE {
        ?conceptScheme a skos:ConceptScheme .
        ?conceptScheme mu:uuid ${sparqlEscapeString(conceptSchemeId)} .
      } LIMIT 1
    `);

    return queryResult.results.bindings[0].conceptScheme?.value;
  } catch (error) {
    throw {
      message: `Something went wrong while getting concept-scheme with id: ${conceptSchemeId}.`,
      status: 500,
    };
  }
}

export async function findConceptSchemeUsage(conceptSchemeUri: string) {
  try {
    const queryResult = await query(`
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  
      SELECT DISTINCT ?usage
      WHERE {
        ?usage a ?type .
        ?usage ?p ${sparqlEscapeUri(conceptSchemeUri)} .
  
        FILTER(
          ?usage != ${sparqlEscapeUri(conceptSchemeUri)} &&
          ?p != <http://www.w3.org/2004/02/skos/core#inScheme>
        )
      }
    `);

    return queryResult.results.bindings
      .map((b) => b.usage?.value)
      .filter((i) => i);
  } catch (error) {
    throw {
      message: `Something went wrong while looking for the usage of concept-scheme (${conceptSchemeUri}).`,
      status: 500,
    };
  }
}

export async function deleteConceptSchemeAndUsage(conceptSchemeUri: string) {
  try {
    await update(`
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  
      DELETE {
        ?conceptScheme ?cP ?cO .
        ?usage ?p ?conceptScheme .
      }
      WHERE {
        VALUES ?conceptScheme { ${sparqlEscapeUri(conceptSchemeUri)} }
  
        ?conceptScheme a skos:ConceptScheme .
        ?conceptScheme ?cP ?cO .
  
        OPTIONAL {
          ?usage ?p ?conceptScheme .
        }
      }
    `);
  } catch (error) {
    throw {
      message:
        'Something went wrong while deleting the concept-scheme and there usages.',
      status: 500,
    };
  }
}

export async function getConceptsInConceptScheme(conceptSchemeUri: string) {
  try {
    const queryResult = await query(`
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  
      SELECT DISTINCT ?concept (SAMPLE(?usage) AS ?usage)
      WHERE {
        ${sparqlEscapeUri(conceptSchemeUri)} a skos:ConceptScheme .
        ?concept skos:inScheme  ${sparqlEscapeUri(conceptSchemeUri)} .
  
        OPTIONAL {
          ?usage ?p ?concept . 
  
          FILTER(?usage != ${sparqlEscapeUri(conceptSchemeUri)}) 
        }
      } GROUP BY ?concept
    `);

    return queryResult.results.bindings.map((b) => {
      return {
        uri: b.concept?.value,
        hasUsage: !!b.usage?.value,
      };
    });
  } catch (error) {
    throw {
      message: `Something went wrong while trying to get all the concepts in concept-scheme (${conceptSchemeUri}).`,
      status: 500,
    };
  }
}
