// Native fetch is available in Node 18+

const SPARQL_QUERY = `
SELECT ?stat ?pq ?pqLabel ?obj ?objLabel WHERE {
  wd:Q3704259 p:P39 ?stat . # Petteri Orpo Q3704259 (Wait, let me verify ID. Or better, search by name)
  ?stat ps:P39 wd:Q17592474 .
  ?stat ?pq ?obj .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 20
`;

// Wait, Petteri Orpo ID check. Google says Q3704259.
// Let's use that.

async function debug() {
    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(SPARQL_QUERY)}&format=json`;
    console.log("Querying for Petteri Orpo...");
    try {
        const response = await fetch(url, { headers: { 'User-Agent': 'TestBot/1.0' } });
        const data = await response.json();
        console.log(JSON.stringify(data.results.bindings, null, 2));
    } catch (e) {
        console.error(e);
    }
}
debug();
