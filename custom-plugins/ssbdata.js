/****************
 * Coded By: *
 * Prince Sky *
 * *************/

'use strict';

exports.commands = {
	ssbdata: 'ssbd',
	ssbd: {
		add: 'set',
		set: function (target, room, user) {
			if (!this.can('ban')) return false;
			target = target.split('|');
			let targetUser = target[0].toLowerCase().trim();
			if (!targetUser) return this.parse('/ssbd help');
			let pokemon = target[1];
			if (!pokemon) return this.parse('/ssbd help');
			let item = target[2];
			if (!item) return this.parse('ssbd help');
			let evs = target[3];
			if (!evs) return this.parse('/ssbd help');
			let nature = target[4];
			if (!nature) return this.parse('/ssbd help');
			let ability = target[5];
			if (!ability) return this.parse('/ssbd help');
			let adesc = target[6];
			if (!adesc) return this.parse('/ssbd help');
			let moves = target[7];
			if (!moves) return this.parse('/ssbd help');
			let smove = target[8];
			if (!smove) return this.parse('/ssbd help');
			let sdesc = target[9];
			if (!sdesc) return this.parse('/ssbd help');
			// Use nef-db to store data.
			Db.ssbdata.set([targetUser, 'pokemon'], pokemon);
			Db.ssbdata.set([targetUser, 'item'], item);
			Db.ssbdata.set([targetUser, 'evs'], evs);
			Db.ssbdata.set([targetUser, 'nature'], nature);
			Db.ssbdata.set([targetUser, 'ability'], ability);
			Db.ssbdata.set([targetUser, 'adesc'], adesc);
			Db.ssbdata.set([targetUser, 'moves'], moves);
			Db.ssbdata.set([targetUser, 'smove'], smove);
			Db.ssbdata.set([targetUser, 'sdesc'], sdesc);
		},

		remove: 'delete',
		delete: function (target, room, user) {
			if (!this.can('ban')) return false;
			let targetUser = target.toLowerCase().trim();
			if (!targetUser) return this.parse('/ssbd help');
			Db.ssbdata.remove(targetUser);
			this.sendReply('You have remove ' + targetUser + '\'s super staff pokemon data.');
		},

		view: 'show',
		show: function (target, room, user) {
			if (!this.runBroadcast()) return;
			target = target.toLowerCase().trim();
			if (!target) return this.parse('/ssbd help');
			let pokemon = Db.ssbdata.get([target, 'pokemon']);
			let item = Db.ssbdata.get([target, 'item']);
			let evs = Db.ssbdata.get([target, 'evs']);
			let nature = Db.ssbdata.get([target, 'nature']);
			let ability = Db.ssbdata.get([target, 'ability']);
			let adesc = Db.ssbdata.get([target, 'adesc']);
			let moves = Db.ssbdata.get([target, 'moves']);
			let smove = Db.ssbdata.get([target, 'smove']);
			let smdesc = Db.ssbdata.get([target, 'smdesc']);
			if (Db.ssbdata.has(target)) {
			this.sendReplyBox(
				'<b>Pokèmon:</b> ' + pokemon + '  @' + item + '' +
				'<b>Evs:</b> ' + evs + '' +
				'<b>Nature:</b> ' + nature + '' +
				'<b>Ability:</b> ' + ability + '  [' + adesc + ']' +
				'<b>Moves:</b> ' + moves + '' +
				'<b>Signature Move:</b> ' + smove + '  [' + smdesc + ']'
			);
			} else 
				this.sendReply('Data not found');
		},

		'': 'help',
		help: function (target, room, user) {
			if (!this.runBroadcast()) return;
			this.sendReplyBox(
				'<center><b><u>SSB Data By Prince Sky</u></b><br>' +
				'Commands are nestled under namespace <code>ssbd</code>.</center>' +
				'<hr width="80%">' +
				'<code>set [user] | [pokemon] | [item] | [evs] | [nature] | [ability] | [abilityDescription] | [moves] | [signatureMove] | [signatureMoveDescription]</code> - Set user\'s ssb pokemon data.<br>' +
				'Example: /ssbd set princesky | Necrozma-Ultra | Dragonium Z | 4 HP / 252 Spa / 252 Spe | Timid | Ultra Neuroforce | Adaptability + Neuroforve | Dark Pulse, Photon Geyser, Earth Power | Travis Fix | 100 Base Power, +1 Priority, Dragon Type<br>' +
				'<code>remove [user]</code> - Remove user\'s ssb pokemon data<br>' +
				'view [user] - View user\'s ssb pokemon data.'
			);
		},
	},
};
