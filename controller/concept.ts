import {
  query,
  update,
  sparqlEscapeString,
  sparqlEscapeUri,
  sparqlEscapeDateTime,
} from 'mu';

export async function getConceptUris(conceptIds: Array<string>) {
  try {
    const escapedIds = conceptIds
      .map((id) => sparqlEscapeString(id))
      .join('\n');
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
  } catch (error) {
    throw {
      message: `Something went wrong while getting concepts with ids: ${conceptIds.join(', ')}.`,
      status: 500,
    };
  }
}

export async function findConceptUsage(conceptUri: string) {
  try {
    const queryResult = await query(`
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

    SELECT DISTINCT ?usage
    WHERE {
      ?usage ?p ${sparqlEscapeUri(conceptUri)} .

      FILTER(?usage != ${sparqlEscapeUri(conceptUri)})
    }
  `);

    return queryResult.results.bindings
      .map((b) => b.usage?.value)
      .filter((i) => i);
  } catch (error) {
    throw {
      message: `Something went wrong while looking for the usage of concept (${conceptUri}).`,
      status: 500,
    };
  }
}

export async function deleteConceptsAndUsage(conceptUris: Array<string>) {
  const escapedUris = conceptUris.map((uri) => sparqlEscapeUri(uri)).join('\n');
  const now = new Date();
  try {
    await update(`
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX astreams: <http://www.w3.org/ns/activitystreams#>
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
      DELETE {
        ?concept ?cP ?cO .
        ?usage ?p ?concept .
      }
      INSERT {
        ?concept a astreams:Tombstone ;
          astreams:deleted ${sparqlEscapeDateTime(now)} ;
          dct:modified ${sparqlEscapeDateTime(now)} ;
          astreams:formerType skos:Concept .
      }
      WHERE {
        VALUES ?concept { ${escapedUris} }
  
        ?concept a skos:Concept .
        ?concept ?cP ?cO .
  
        OPTIONAL {
          ?usage ?p ?concept .
        }
      }
    `);
  } catch (error) {
    throw {
      message:
        'Something went wrong while deleting the concepts and there usages.',
      status: 500,
    };
  }
}
