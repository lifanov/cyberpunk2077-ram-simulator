// Since fetching 24 separate pages via curl from the terminal might be slow and error-prone,
// I will write a script to download the JSON data from the MediaWiki API of Cyberpunk Fandom.

const fs = require('fs');

const QUICKHACKS = [
  "Bait", "Blackwall Gateway", "Contagion", "Cripple Movement", "Cyberpsychosis (quickhack)",
  "Cyberware Malfunction", "Detonate Grenade", "Memory Wipe", "Overheat", "Ping",
  "Reboot Optics", "Request Backup", "Short Circuit", "Sonic Shock", "Suicide",
  "Synapse Burnout", "System Collapse", "Weapon Glitch"
];

async function fetchQuickhackData() {
  const data = {};
  for (const qh of QUICKHACKS) {
    try {
      const title = encodeURIComponent(qh);
      const url = `https://cyberpunk.fandom.com/api.php?action=parse&page=${title}&prop=wikitext&format=json`;
      const res = await fetch(url);
      const json = await res.json();
      if (json && json.parse && json.parse.wikitext) {
        data[qh] = json.parse.wikitext['*'];
      }
    } catch (e) {
      console.error(`Failed to fetch ${qh}`);
    }
  }
  fs.writeFileSync('fandom_raw.json', JSON.stringify(data, null, 2));
  console.log('Saved to fandom_raw.json');
}

fetchQuickhackData();
