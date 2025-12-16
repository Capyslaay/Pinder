import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_FILE = path.join(__dirname, '../src/data/raw_mps.txt');
const OUTPUT_FILE = path.join(__dirname, '../src/data/politicians.js');

// 1. alignment map
const PARTY_ALIGNMENT = {
    // Right
    "Kansallisen kokoomuksen": "right",
    "Kansallinen Kokoomus": "right",
    "Perussuomalaisten": "right",
    "Perussuomalaiset": "right",
    "Kristillisdemokraattinen": "right",
    "Suomen Kristillisdemokraatit": "right",
    "Liike Nyt": "right",

    // Left
    "Sosialidemokraattinen": "left",
    "Suomen Sosialidemokraattinen Puolue": "left",
    "Vasemmistoliiton": "left",
    "Vasemmistoliitto": "left",
    "Vihreä": "left",
    "Vihreä liitto": "left",

    // Center
    "Keskustan": "center",
    "Suomen Keskusta": "center",
    "Ruotsalainen": "center", // User said RKP is often with right but let's stick to center for game balance unless specified
    "Suomen ruotsalainen kansanpuolue": "center",
    "Eduskuntaryhmä Timo Vornanen": "right", // Expelled from PS, likely right
    "Eduskuntaryhmään kuulumaton": "right" // Polvinen (ex-PS)
    // Ahvenanmaan -> RKP group usually -> center
};

// 2. Parse Raw Text
function parseRawFile() {
    const content = fs.readFileSync(RAW_FILE, 'utf-8');
    const lines = content.split('\n').map(l => l.trim()).filter(l => l);

    const mps = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip headlines
        if (line.includes('vaalipiiri') && line.includes('kansanedustaja')) continue;
        if (!line) continue;

        // Assume format: Name on one line, Party on next
        // We look ahead
        const name = line;
        const partyLine = lines[i + 1];

        // Check if next line looks like a party (ends in eduskuntaryhmä or is known)
        if (partyLine && (partyLine.includes('eduskuntaryhmä') || partyLine.includes('Ahvenanmaan'))) {
            // It's a match
            mps.push({ name: name, partyRaw: partyLine });
            i++; // skip next line
        }
    }
    return mps;
}

// 3. Fetch Wikidata Images
const SPARQL_QUERY = `
SELECT DISTINCT ?politicianLabel ?image WHERE {
  ?politician p:P39 ?statement .
  ?statement ps:P39 wd:Q17592486 . # Member of Parliament in Finland
  
  # Relaxed filter: Get EVERYONE from recent years to ensure matches
  ?statement pq:P580 ?start .
  FILTER(?start > "2015-01-01"^^xsd:dateTime)

  OPTIONAL { ?politician wdt:P18 ?image . }

  SERVICE wikibase:label { bd:serviceParam wikibase:language "fi,en". }
}
`;

async function main() {
    console.log("Parsing raw MP list...");
    const rawMps = parseRawFile();
    console.log(`Parsed ${rawMps.length} MPs from text file.`);

    console.log("Fetching images from Wikidata...");
    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(SPARQL_QUERY)}&format=json`;

    let wikiDataMap = {}; // Name -> ImageURL

    try {
        const response = await fetch(url, { headers: { 'User-Agent': 'PinderBot/1.0' } });
        const data = await response.json();

        data.results.bindings.forEach(entry => {
            const name = entry.politicianLabel.value;
            const image = entry.image ? entry.image.value : null;
            if (image) wikiDataMap[name] = image;
        });

    } catch (error) {
        console.error("Wikidata fetch failed", error);
    }

    console.log("Merging data...");

    const finalMps = rawMps.map((mp, index) => {
        // Alignment
        let alignment = "center";
        const p = mp.partyRaw;

        if (p.includes("Kokoomus") || p.includes("kokoomuksen") || p.includes("Perussuomalaisten") || p.includes("Kristillis") || p.includes("Liike Nyt") || p.includes("Vornanen") || p.includes("Polvinen")) {
            alignment = "right";
        } else if (p.includes("Sosialidemokraattinen") || p.includes("Vasemmisto") || p.includes("Vihreä")) {
            alignment = "left";
        } else if (p.includes("Keskusta") || p.includes("Ruotsalainen") || p.includes("Ahvenanmaan")) {
            alignment = "center";
        }

        // Image
        let image = wikiDataMap[mp.name];
        // Try approximate match if exact fails (e.g. middle names)
        if (!image) {
            // simplistic fuzzy: check if wikidata name contains this name or vice versa
            const key = Object.keys(wikiDataMap).find(k => k.includes(mp.name) || mp.name.includes(k));
            if (key) image = wikiDataMap[key];
        }

        // Resize
        if (image) {
            image = image.replace("http://commons.wikimedia.org/wiki/Special:FilePath/", "https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/") + "&width=400";
        } else {
            image = "https://placehold.co/400x600/cccccc/ffffff?text=" + encodeURIComponent(mp.name);
        }

        return {
            id: index + 1000,
            name: mp.name,
            party: mp.partyRaw.replace(" eduskuntaryhmä", "").replace("Vihreä", "Vihreä Liitto").replace("Kansallisen kokoomuksen", "Kokoomus").replace("Perussuomalaisten", "Perussuomalaiset").replace("Sosialidemokraattinen", "SDP").replace("Vasemmistoliiton", "Vasemmistoliitto").replace("Keskustan", "Keskusta").replace("Ruotsalainen", "RKP"),
            alignment: alignment,
            image: image
        };
    });

    const fileContent = `export const politicians = ${JSON.stringify(finalMps, null, 2)};`;
    fs.writeFileSync(OUTPUT_FILE, fileContent);
    console.log(`Done. Wrote ${finalMps.length} MPs to ${OUTPUT_FILE}`);
}

main();
