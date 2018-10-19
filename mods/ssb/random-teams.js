'use strict';

const RandomTeams = require('../../data/random-teams');

class RandomSeasonalRegStaffTeams extends RandomTeams {
	randomSeasonalRegStaffTeam() {
		let team = [];
		let variant = this.random(2);
		let sets = {
			// Surge
			'+Insane Assassin': {
			    species: 'Bisharp',
			    ability: 'defiant',
			    item: 'Steelium Z',
			    gender: 'M',
			    moves: ['Knock Off', 'Bullet Punch', 'Meteor Mash',
			    ],
			    signatureMove: "assassinsrevenge",
			    evs: {
			        atk: 252,
			        spe: 252,
			        hp: 4,
			    },
			    nature: 'Adamant',
			},
			'~Prince Sky': {
				species: 'Necrozma-Ultra',
				ability: 'Ultra Neuroforce',
				item: 'Dragonium Z',
				gender: 'M',
				moves: ['Dark Pulse', 'Earth Power', 'Dragon Pulse',
				],
				signatureMove: "travisfix",
				evs: {
					spa: 252,
					spe: 252,
					hp: 4,
				},
				nature: 'Timid',
			},
			'~Anrin N': {
				species: 'Mewtwo-Mega-Y',
				ability: 'Prism Armor',
				item: 'Weakness Policy',
				gender: 'M',
				moves: [
				    ['Psystrike', 'Aura Sphere'][variant], 'Flamethrower', 'Ice Beam',
				],
				signatureMove: 'neoblast',
				evs: {
					spa: 252,
					spe: 252,
					hp: 4,
				},
				nature: 'Timid',
			},
			'~SnorlaxTheRain': {
			    species: 'Snorlax',
			    ability: 'Immunity',
			    item: 'Snorlium Z',
			    gender: 'F',
			    moves: ['Curse', 'Rest', 'Giga Impact',
			    ],
			    signatureMove: 'Snorlax Slam',
			    evs: {
			        atk: 252,
			        def: 131,
			        hp: 125,
			    },
			    nature: 'Impish',
			},
			'~HoeenHero': {
				species: 'Ludicolo',
				ability: 'Programmer\'s Domain',
				item: 'Leftovers',
				gender: 'M',
				moves: [
					['Hydro Pump', 'Scald'][variant], 'Ice Beam', 'Giga Drain',
				],
				signatureMove: 'Scripting',
				evs: {
					spa: 252,
					spe: 252,
					hp: 4,
				},
				nature: 'Modest',
			},
			'~Mystifi': {
				species: 'Clefairy',
				ability: 'Analytic',
				item: 'Eviolite',
				gender: 'F',
				moves: [
					['Calm Mind', 'Cosmic Power'][variant], 'Soft-Boiled', 'Stored Power',
				],
				signatureMove: 'Mystic Mirage',
				evs: {
					hp: 252,
					def: 252,
					spd: 4,
				},
				nature: 'Bold',
			},
			'~Kraken Mare': {
				species: 'Gardevoir-Mega',
				ability: 'Kraken\'s Boost',
				shiny: true,
				item: 'Focus Sash',
				gender: 'F',
				moves: ['Moonblast', 'Calm Mind', 'Psychic',
				],
				signatureMove: 'Revenge of Kraken Mare',
				evs: {
					hp: 248,
					spa: 252,
					def: 8,
				},
				nature: 'Modest',
			},
			'~Desokoro': {
				species: 'Gyarados',
				ability: 'Wave Call',
				item: 'Leftovers',
				gender: 'M',
				shiny: true,
				moves: ['Substitute', 'Dragon Dance', 'Bounce',
				],
				signatureMove: 'Tsunami Crash',
				evs: {
					atk: 252,
					spe: 252,
					hp: 4,
				},
				nature: 'Adamant',
			},
			// Global Bots
			'*Surge BoT': {
				species: 'Magnemite',
				ability: 'Hotpatch',
				item: 'Leftovers',
				gender: 'M',
				moves: ['Flash Cannon', 'Thunderbolt', 'Signal Beam',
				],
				signatureMove: ".kill",
				evs: {
					spa: 252,
					spe: 252,
					spd: 4,
				},
				nature: 'Modest',
			},
			// Global Moderators:
			'@SparkyHeliolisk': {
				species: 'Ninetales-Alola',
				ability: 'Adaptability',
				item: 'Leftovers',
				gender: 'F',
				moves: ['Moonblast', 'Hyper Voice', 'Dark Pulse',
				],
				signatureMove: "ultrafroststorm",
				evs: {
					spa: 252,
					spe: 252,
					spd: 4,
				},
				nature: 'Modest',
			},
			'&A Helpful Rayquaza': {
				species: 'Rayquaza-Mega',
				ability: 'Delta Stream',
				shiny: true,
				item: 'Lum Berry',
				gender: 'M',
				moves: ['Dragon Ascent', 'Dragon Dance', 'Extreme Speed',
						 ],
				signatureMove: 'Rayquaza Roar',
				evs: {
					atk: 252,
					spe: 252,
					hp: 4,
				},
				nature: 'Modest',
			},
			'@BDH93': {
				species: 'Dunsparce',
				ability: 'Serene Grace',
				item: 'Kings Rock',
				gender: 'M',
				moves: ['Roost', 'Coil', 'Rock Slide', ['Glare', 'Body Slam'][variant],
				],
				signatureMove: 'Getting Trolled',
				evs: {
					hp: 252,
					atk: 252,
					def: 4,
				},
				nature: 'Naughty',
			},
			'@Ashley the Pikachu': {
				species: 'Pikachu-Cosplay',
				ability: 'Primal Surge',
				item: 'Light Ball',
				gender: 'F',
				moves: ['Thunderbolt', 'Surf', 'Hidden Power Ice',
				],
				signatureMove: 'Rocket Punch',
				evs: {
					spa: 252,
					spe: 252,
					hp: 4,
				},
				ivs: {
					atk: 0,
				},
				nature: 'Modest',
			},
			'@C733937 123': {
				species: 'Tyranitar',
				ability: 'Bulletproof',
				item: 'Safety Goggles',
				gender: 'M',
				moves: ['Assist', 'Beat Up', 'Sucker Punch', 'Heavy Slam',
				],
				signatureMove: 'Lightshot Giga-Lance',
				evs: {
					hp: 252,
					atk: 252,
					def: 4,
				},
				nature: 'Adamant',
			},
			'@Admewn': {
				species: 'Mew',
				ability: 'Protean',
				item: 'Expert Belt',
				moves: ['Earth Power', 'Oblivion Wing', 'Shadow Ball',
				],
				signatureMove: 'Mewtation',
				evs: {
					spa: 252,
					spe: 252,
					hp: 4,
				},
				nature: 'Timid',
			},
		   // Global Drivers
			 '@Operitic operoa': {
				species: 'Gengar',
				ability: 'Adaptibility',
				item: 'Life Orb',
				gender: 'M',
				moves: ['Shadow Ball', 'Sludge Bomb', 'Dark Pulse',
				],
				signatureMove: "Shadow Hunter",
				evs: {
					spa: 252,
					spe: 252,
					spd: 4,
				},
				nature: 'Modest',
			},
		};
		// convert moves to ids.
		for (let k in sets) {
			sets[k].moves = sets[k].moves.map(toId);
			sets[k].baseSignatureMove = toId(sets[k].baseSignatureMove);
		}

		// Generate the team randomly.
		let pool = Dex.shuffle(Object.keys(sets));
		for (let i = 0; i < 6; i++) {
			/*if (i === 1) {
				let monIds = pool.slice(0, 6).map(function (p) {
					return toId(p);
				});
				for (let mon in sets) {
					if (toId(mon) === userid && monIds.indexOf(userid) === -1) {
						pool[1] = mon;
						break;
					}
				}
			}*/
			let set = sets[pool[i]];
			set.level = 100;
			set.name = pool[i];
			if (!set.ivs) {
				set.ivs = {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31};
			} else {
				for (let iv in {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31}) {
					set.ivs[iv] = set.ivs[iv] || set.ivs[iv] === 0 ? set.ivs[iv] : 31;
				}
			}
			// Assuming the hardcoded set evs are all legal.
			if (!set.evs) set.evs = {hp: 84, atk: 84, def: 84, spa: 84, spd: 84, spe: 84};
			set.moves = [this.sampleNoReplace(set.moves), this.sampleNoReplace(set.moves), this.sampleNoReplace(set.moves)].concat(set.signatureMove);
			team.push(set);
		}
		return team;
	}
}

module.exports = RandomSeasonalRegStaffTeams;
