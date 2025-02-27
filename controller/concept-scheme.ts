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

export async function findConceptSchemeImplementations(
  conceptSchemeUri: string,
) {
  try {
    const queryResult = await query(`
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  
      SELECT DISTINCT ?implementation
      WHERE {
        ?implementation a ?type .
        ?implementation ?p ${sparqlEscapeUri(conceptSchemeUri)} .
  
        FILTER(?type != skos:ConceptScheme && ?p != <http://www.w3.org/2004/02/skos/core#inScheme>)
      }
    `);

    return queryResult.results.bindings
      .map((b) => b.implementation?.value)
      .filter((i) => i);
  } catch (error) {
    throw {
      message: `Something went wrong while finding implementations for concept-scheme (${conceptSchemeUri}).`,
      status: 500,
    };
  }
}

export async function deleteConceptSchemeWithImplementations(
  conceptSchemeUri: string,
) {
  try {
    await update(`
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  
      DELETE {
        ?conceptScheme ?cP ?cO .
        ?implementation ?p ?conceptScheme .
      }
      WHERE {
        VALUES ?conceptScheme { ${sparqlEscapeUri(conceptSchemeUri)} }
  
        ?conceptScheme a skos:ConceptScheme .
        ?conceptScheme ?cP ?cO .
  
        OPTIONAL {
          ?implementation ?p ?conceptScheme .
        }
      }
    `);
  } catch (error) {
    throw {
      message:
        'Something went wrong while deleting the concept-scheme and there implementations.',
      status: 500,
    };
  }
}

export async function getConceptsInConceptScheme(conceptSchemeUri: string) {
  try {
    const queryResult = await query(`
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  
      SELECT DISTINCT ?concept ?implementation
      WHERE {
        ${sparqlEscapeUri(conceptSchemeUri)} a skos:ConceptScheme .
        ?concept skos:inScheme  ${sparqlEscapeUri(conceptSchemeUri)} .
  
        OPTIONAL {
          ?implementation a ?type . 
          ?implementation ?p ?concept . 
  
          FILTER(?type != skos:Concept) 
        }
      }
    `);

    return queryResult.results.bindings.map((b) => {
      return {
        uri: b.concept?.value,
        hasImplementation: !!b.implementation?.value,
      };
    });
  } catch (error) {
    throw {
      message: `Something went wrong while trying to get all the concepts in concept-scheme (${conceptSchemeUri}).`,
      status: 500,
    };
  }
}
