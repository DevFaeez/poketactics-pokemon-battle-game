const entries = [
  [6, 'Charizard', ['fire','flying'], [78,109,78,100], ['Flamethrower','Air Slash','flying']],
  [9, 'Blastoise', ['water'], [79,85,105,78], ['Hydro Pump','Ice Beam','ice']],
  [3, 'Venusaur', ['grass','poison'], [80,100,91,80], ['Solar Beam','Sludge Bomb','poison']],
  [25, 'Pikachu', ['electric'], [55,75,50,110], ['Thunderbolt','Iron Tail','steel']],
  [94, 'Gengar', ['ghost','poison'], [60,130,68,110], ['Shadow Ball','Sludge Bomb','poison']],
  [384, 'Rayquaza', ['dragon','flying'], [95,122,85,95], ['Dragon Pulse','Air Slash','flying']],
  [130, 'Gyarados', ['water','flying'], [95,115,89,81], ['Aqua Tail','Crunch','dark']],
  [448, 'Lucario', ['fighting','steel'], [70,115,72,97], ['Aura Sphere','Flash Cannon','steel']],
  [282, 'Gardevoir', ['psychic','fairy'], [68,113,86,80], ['Psychic','Moonblast','fairy']],
  [149, 'Dragonite', ['dragon','flying'], [91,119,98,80], ['Dragon Claw','Thunder Punch','electric']],
  [143, 'Snorlax', ['normal'], [125,100,89,39], ['Body Slam','Heavy Slam','steel']],
  [248, 'Tyranitar', ['rock','dark'], [100,120,105,61], ['Stone Edge','Crunch','dark']],
  [445, 'Garchomp', ['dragon','ground'], [100,116,95,102], ['Dragon Claw','Earthquake','ground']],
  [197, 'Umbreon', ['dark'], [95,77,114,65], ['Dark Pulse','Psychic','psychic']],
  [65, 'Alakazam', ['psychic'], [60,125,60,120], ['Psyshock','Shadow Ball','ghost']],
  [68, 'Machamp', ['fighting'], [90,116,86,55], ['Close Combat','Stone Edge','rock']],
  [471, 'Glaceon', ['ice'], [65,115,100,65], ['Blizzard','Water Pulse','water']],
  [212, 'Scizor', ['bug','steel'], [70,115,100,65], ['X-Scissor','Iron Head','steel']],
  [131, 'Lapras', ['water','ice'], [115,85,90,60], ['Surf','Ice Beam','ice']],
  [38, 'Ninetales', ['fire'], [73,93,86,101], ['Fire Blast','Energy Ball','grass']],
  [59,"Arcanine",["fire"],[90,110,80,95],["Flamethrower","Crunch","dark"]],
  [134,"Vaporeon",["water"],[125,110,78,65],["Surf","Ice Beam","ice"]],
  [135,"Jolteon",["electric"],[65,110,78,125],["Thunderbolt","Shadow Ball","ghost"]],
  [136,"Flareon",["fire"],[65,125,85,65],["Flare Blitz","Superpower","fighting"]],
  [196,"Espeon",["psychic"],[65,125,78,110],["Psychic","Shadow Ball","ghost"]],
  [470,"Leafeon",["grass"],[65,110,98,95],["Leaf Blade","X-Scissor","bug"]],
  [700,"Sylveon",["fairy"],[95,110,98,60],["Moonblast","Shadow Ball","ghost"]],
  [257,"Blaziken",["fire","fighting"],[80,120,70,80],["Blaze Kick","Sky Uppercut","fighting"]],
  [260,"Swampert",["water","ground"],[100,110,90,60],["Muddy Water","Earthquake","ground"]],
  [254,"Sceptile",["grass"],[70,105,75,120],["Leaf Blade","Dragon Pulse","dragon"]],
  [392,"Infernape",["fire","fighting"],[76,104,71,108],["Flamethrower","Close Combat","fighting"]],
  [395,"Empoleon",["water","steel"],[84,111,94,60],["Surf","Flash Cannon","steel"]],
  [389,"Torterra",["grass","ground"],[95,109,95,56],["Wood Hammer","Earthquake","ground"]],
  [658,"Greninja",["water","dark"],[72,103,69,122],["Water Shuriken","Dark Pulse","dark"]],
  [655,"Delphox",["fire","psychic"],[75,114,86,104],["Mystical Fire","Psychic","psychic"]],
  [652,"Chesnaught",["grass","fighting"],[88,107,98,64],["Seed Bomb","Drain Punch","fighting"]],
  [181,"Ampharos",["electric"],[90,115,88,55],["Thunderbolt","Dragon Pulse","dragon"]],
  [330,"Flygon",["ground","dragon"],[80,100,80,100],["Earthquake","Dragon Claw","dragon"]],
  [373,"Salamence",["dragon","flying"],[95,125,80,100],["Dragon Claw","Flamethrower","fire"]],
  [376,"Metagross",["steel","psychic"],[80,125,110,70],["Meteor Mash","Zen Headbutt","psychic"]],
  [306,"Aggron",["steel","rock"],[70,110,120,50],["Iron Head","Stone Edge","rock"]],
  [169,"Crobat",["poison","flying"],[85,90,80,125],["Cross Poison","Air Slash","flying"]],
  [214,"Heracross",["bug","fighting"],[80,125,85,85],["Megahorn","Close Combat","fighting"]],
  [359,"Absol",["dark"],[65,125,60,75],["Night Slash","Psycho Cut","psychic"]],
  [429,"Mismagius",["ghost"],[60,105,82,105],["Shadow Ball","Dazzling Gleam","fairy"]],
  [478,"Froslass",["ice","ghost"],[70,80,70,110],["Ice Beam","Shadow Ball","ghost"]],
  [407,"Roserade",["grass","poison"],[60,125,85,90],["Energy Ball","Sludge Bomb","poison"]],
  [464,"Rhyperior",["ground","rock"],[115,125,92,40],["Earthquake","Stone Edge","rock"]],
  [466,"Electivire",["electric"],[75,123,76,95],["Thunder Punch","Ice Punch","ice"]],
  [468,"Togekiss",["fairy","flying"],[85,120,105,80],["Dazzling Gleam","Air Slash","flying"]],
];

export const roster = entries.map(([id, name, types, [hp, attack, defense, speed], [signature, coverage, coverageType]]) => ({
  id, name, types, hp, attack, defense, speed, image: `/art/${id}.png`,
  moves: [
    { name: 'Quick Strike', type: types[0], power: 18, energy: 1, priority: 1 },
    { name: signature, type: types[0], power: 36, energy: -2, priority: 0 },
    { name: coverage, type: coverageType, power: 45, energy: -3, priority: 0 },
  ],
}));

const matchups = {
  normal:   ['','rock steel','ghost'],
  fire:     ['grass ice bug steel','fire water rock dragon',''],
  water:    ['fire ground rock','water grass dragon',''],
  electric: ['water flying','electric grass dragon','ground'],
  grass:    ['water ground rock','fire grass poison flying bug dragon steel',''],
  ice:      ['grass ground flying dragon','fire water ice steel',''],
  fighting: ['normal ice rock dark steel','poison flying psychic bug fairy','ghost'],
  poison:   ['grass fairy','poison ground rock ghost','steel'],
  ground:   ['fire electric poison rock steel','grass bug','flying'],
  flying:   ['grass fighting bug','electric rock steel',''],
  psychic:  ['fighting poison','psychic steel','dark'],
  bug:      ['grass psychic dark','fire fighting poison flying ghost steel fairy',''],
  rock:     ['fire ice flying bug','fighting ground steel',''],
  ghost:    ['psychic ghost','dark','normal'],
  dragon:   ['dragon','steel','fairy'],
  dark:     ['psychic ghost','fighting dark fairy',''],
  steel:    ['ice rock fairy','fire water electric steel',''],
  fairy:    ['fighting dragon dark','fire poison steel',''],
};

export const types = Object.keys(matchups).sort();

export function effectiveness(attack, defenses) {
  const [strong, weak, immune] = matchups[attack].map(group => group.split(' '));
  return defenses.reduce((factor, type) => factor * (
    immune.includes(type) ? 0 : strong.includes(type) ? 2 : weak.includes(type) ? 0.5 : 1
  ), 1);
}
