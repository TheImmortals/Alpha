'use strict';

// Available slots for the game
const slots = {
	'bulbasaur': 3,
	'squirtle': 3,
	'charmander': 3,
	'pikachu': 5,
	'eevee': 5,
	'snorlax': 5,
	'dragonite': 7,
	'mew': 7,
	'mewtwo': 10,
};

function moneyName(amount) {
	let name = " buck";
	return name;
}

// Trozei sprites for each pokemon
const slotsTrozei = {
	'bulbasaur': 'http://www.pokestadium.com/assets/img/sprites/misc/trozei/bulbasaur.gif',
	'squirtle': 'http://www.pokestadium.com/assets/img/sprites/misc/trozei/squirtle.gif',
	'charmander': 'http://www.pokestadium.com/assets/img/sprites/misc/trozei/charmander.gif',
	'pikachu': 'http://www.pokestadium.com/assets/img/sprites/misc/trozei/pikachu.gif',
	'eevee': 'http://www.pokestadium.com/assets/img/sprites/misc/trozei/eevee.gif',
	'snorlax': 'http://www.pokestadium.com/assets/img/sprites/misc/trozei/snorlax.gif',
	'dragonite': 'http://www.pokestadium.com/assets/img/sprites/misc/trozei/dragonite.gif',
	'mew': 'http://www.pokestadium.com/assets/img/sprites/misc/trozei/mew.gif',
	'mewtwo': 'http://www.pokestadium.com/assets/img/sprites/misc/trozei/mewtwo.gif',
};

const availableSlots = Object.keys(slots);

function spin() {
	return availableSlots[Math.floor(Math.random() * availableSlots.length)];
}

function rng() {
	return Math.floor(Math.random() * 100);
}

function display(result, user, slotOne, slotTwo, slotThree) {
	let display = '<div style="padding: 3px; background: #000000; padding: 5px; border-radius: 5px; text-align: center;">' +
	'<center><img src="http://i.imgur.com/p2nObtE.gif" width="300" height="70"></center><br />' +
	'<center><img style="padding: 3px; border: 1px inset gold; border-radius: 5px; box-shadow: inset 1px 1px 5px white;" src="' + slotsTrozei[slotOne] + '">&nbsp;&nbsp;&nbsp;' + '<img style="padding: 3px; border: 1px inset gold; border-radius: 5px; box-shadow: inset 1px 1px 5px white;" src="' + slotsTrozei[slotTwo] + '">&nbsp;&nbsp;&nbsp;' + '<img style="padding: 3px; border: 1px inset gold; border-radius: 5px; box-shadow: inset 1px 1px 5px white;" src="' + slotsTrozei[slotThree] + '"></center>' +
	'<font style="color: white;"><br />';
	if (!result) {
		display += 'Aww... bad luck, <b>' + Server.nameColor(user.name, true) + '. Better luck next time!</font>';
	}
	if (result) {
		display += 'Congratulations, ' + Server.nameColor(user.name, true) + '. You have won ' + slots[slotOne] + ' bucks!!</font>';
	}
	return display + '</div>';
}

exports.commands = {
	slots: {
		start: 'spin',
		spin: function (target, room, user) {
			if (room.id !== 'casino') return this.errorReply('Casino games can only be played in the "Casino".');
			if (!this.runBroadcast()) return false;
			if (!this.canTalk()) return this.errorReply('/slots spin - Access Denied.');

			const amount = (Db.currency.get(user.userid, 0));
			if (amount < 3) return this.errorReply('You don\'t have enough bucks to play this game. You need ' + (3 - amount) + moneyName(amount) + ' more.');

			const result = spin();
			const chancePercentage = rng();
			const chancesGenerated = 70 + availableSlots.indexOf(result) * 3;

			if (chancePercentage >= chancesGenerated) {
				Db.currency.set(user.userid, (amount + slots[result]));
				return this.sendReplyBox(display(true, user.name, result, result, result));
			}

			// Incase all outcomes are same, it'll resort to changing the first one.
			let outcomeOne = spin();
			let outcomeTwo = spin();
			let outcomeThree = spin();

			while (outcomeOne === outcomeTwo === outcomeThree) {
				outcomeOne = spin();
			}

			Db.currency.set(user.userid, (amount - 3));
			return this.sendReplyBox(display(false, user.name, outcomeOne, outcomeTwo, outcomeThree));
		},
		'': function (target, room, user) {
			return this.parse('/help slots');
		},
	},
	slotshelp: [
		'Slots is a casino game. ' +
		'It awards the user with varying amount of bucks depending on the streak of pokemon they user gets.' + '\n' +
		'Following Are Slots Winnings: \n' +
		'Bulbasaur: 3 bucks' + '\n' +
		'Squirtle: 6 bucks' + '\n' +
		'Charmander: 9 bucks' + '\n' +
		'Pikachu: 12 bucks' + '\n' +
		'Eevee: 15 bucks' + '\n' +
		'Snorlax: 17 bucks' + '\n' +
		'Dragonite: 21 bucks' + '\n' +
		'Mew: 24 bucks' + '\n' +
		'Mewtwo: 27 bucks' + '\n' +
		'Use "/slots spin" to play the game.',
	],
};
