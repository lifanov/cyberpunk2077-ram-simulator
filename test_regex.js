const text = `{{Infobox Quickhack
 |title = Suicide
 |type = Ultimate
 |quality = {{R|TIII}}
 |upload_time = {{R|TIII|1}}
 |ram_cost = {{R|TIII|24}}
}}`;

let durationMatch = text.match(/\|\s*duration\s*=\s*(.+)/);
let uploadMatch = text.match(/\|\s*upload_time\s*=\s*(.+)/);
let ramMatch = text.match(/\|\s*ram_cost\s*=\s*(.+)/);

console.log(uploadMatch ? uploadMatch[1] : null);
console.log(ramMatch ? ramMatch[1] : null);
