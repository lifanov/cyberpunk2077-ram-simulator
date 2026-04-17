import json
import urllib.request
from bs4 import BeautifulSoup
import re

hacks = [
    "Bait", "Contagion", "Cripple Movement", "Cyberpsychosis", "Cyberware Malfunction",
    "Detonate Grenade", "Memory Wipe", "Overheat", "Ping", "Reboot Optics",
    "Request Backup", "Short Circuit", "Sonic Shock", "Suicide", "Synapse Burnout",
    "System Collapse", "Weapon Glitch"
]

results = {}

for hack in hacks:
    url = f"https://cyberpunk.fandom.com/api.php?action=parse&page={hack.replace(' ', '_')}&format=json"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            if 'parse' in data and 'text' in data['parse']:
                html = data['parse']['text']['*']
                soup = BeautifulSoup(html, 'html.parser')

                # Try to find Duration in the infobox
                duration_div = soup.find('div', {'data-source': 'duration'})
                duration = None
                if duration_div:
                    val_div = duration_div.find('div', class_='pi-data-value')
                    if val_div:
                        duration = val_div.text.strip()

                # If not in infobox, try to find in text
                if not duration:
                    for p in soup.find_all('p'):
                        if 'duration' in p.text.lower():
                            m = re.search(r'duration.*?(\d+(?:\.\d+)?)\s*sec', p.text, re.IGNORECASE)
                            if m:
                                duration = m.group(1) + ' sec'
                                break

                # Look for spread limit (mainly for contagion)
                spread = None
                if hack == "Contagion":
                    for p in soup.find_all('p'):
                        if 'spread to' in p.text.lower():
                            m = re.search(r'spread to (?:up to )?(\d+) enemies', p.text, re.IGNORECASE)
                            if m:
                                spread = m.group(1)
                                break

                results[hack] = {
                    "duration": duration,
                    "spread": spread
                }
                print(f"Parsed {hack}: {results[hack]}")
    except Exception as e:
        print(f"Error parsing {hack}: {e}")

with open('parsed_hacks.json', 'w') as f:
    json.dump(results, f, indent=2)
