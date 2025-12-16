import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.join(__dirname, '../src/data/politicians.js');

const SPARQL_QUERY = `
SELECT DISTINCT ?politician ?politicianLabel ?partyLabel ?image WHERE {
  ?politician p:P39 ?statement .
  ?statement ps:P39 wd:Q17592486 ; # Position: Member of Parliament in Finland
             pq:P580 ?start .      # Start date
  
  FILTER(?start > "2019-01-01"^^xsd:dateTime) # Started recently (2019 or 2023)
  FILTER NOT EXISTS { ?statement pq:P582 ?end } . # And hasn't ended

  ?politician wdt:P102 ?party . # Get Party
  
  OPTIONAL { ?politician wdt:P18 ?image . } # Optional Image

  SERVICE wikibase:label { bd:serviceParam wikibase:language "fi,en". }
}
ORDER BY ?politicianLabel
`;

const PARTY_ALIGNMENT = {
    // Right
    "Kansallinen Kokoomus": "right",
    "Perussuomalaiset": "right",
    "Suomen Kristillisdemokraatit": "right",
    "Liike Nyt": "right",

    // Left
    "Suomen Sosialidemokraattinen Puolue": "left",
    "Vasemmistoliitto": "left",
    "Vihreä liitto": "left",

    // Center
    "Suomen Keskusta": "center",
    "Ruotsalainen kansanpuolue": "right" // Usually aligns right/center, user didn't specify, defaulting to right or center? Let's say right-leaning for now or center.
};

// Heuristic for known small parties or swedish people 
// User only specified: Left(SDP, Vas, Green), Right(Kok, PS, KD), Center(Keskusta).
// RKP is tricky. They are often in government with right. Let's put them 'right' for now to fit the binary + center model, or 'center' if we act generous.
// Let's stick to strict map and default to 'center' if unknown to avoid crashes.

async function fetchMPs() {
    console.log("Fetching MPs from Wikidata...");
    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(SPARQL_QUERY)}&format=json`;

    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'PinderBot/1.0 (test@example.com)' }
        });
        const data = await response.json();

        const mps = data.results.bindings.map((entry, index) => {
            const name = entry.politicianLabel.value;
            const party = entry.partyLabel.value;
            const image = entry.image ? entry.image.value : null;

            // Determine alignment
            let alignment = "center"; // Default
            if (PARTY_ALIGNMENT[party]) {
                alignment = PARTY_ALIGNMENT[party];
            } else if (party.includes("Kokoomus") || party.includes("Perussuomalaiset")) {
                alignment = "right";
            } else if (party.includes("Sosialidemokraat") || party.includes("Vasemmisto") || party.includes("Vihre")) {
                alignment = "left";
            } else if (party.includes("Keskusta")) {
                alignment = "center";
            }

            return {
                id: index + 100, // Offset IDs to avoid conflict with mocks if any
                name: name,
                party: party,
                alignment: alignment,
                image: image
                    ? image.replace("http://commons.wikimedia.org/wiki/Special:FilePath/", "https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/") + "&width=400"
                    : "https://placehold.co/400x600/cccccc/ffffff?text=No+Image"
            };
        });

        console.log(`Found ${mps.length} MPs.`);

        const fileContent = `export const politicians = ${JSON.stringify(mps, null, 2)};`;

        fs.writeFileSync(OUTPUT_FILE, fileContent);
        console.log(`Successfully wrote to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

fetchMPs();
