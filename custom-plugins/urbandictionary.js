"use strict";

const http = require('http');

let udCache = {};

exports.commands = {
	"!urbandefine": true,
	u: "urbandefine",
	ud: "urbandefine",
	urbandefine: function (target, room) {
		if (!this.runBroadcast()) return;
		if (!target) return this.parse("/help urbandefine");
		if (target.toString() > 50) return this.errorReply("Phrase can not be longer than 50 characters.");

		if (toId(target) !== "constructor" && udCache[toId(target)]) {
			this.sendReplyBox(udCache[toId(target)]);
			if (room) room.update();
			return;
		}

		let options = {
			host: "api.urbandictionary.com",
			port: 80,
			path: `/v0/define?term=${encodeURIComponent(target)}`,
			term: target,
		};

		http.get(options, res => {
			let data = ``;
			res.on(`data`, chunk => {
				data += chunk;
			}).on(`end`, () => {
				if (data.charAt(0) !== `{`) {
					this.sendReplyBox(`Error retrieving definition for <strong>"${target}"</strong>.`);
					if (room) room.update();
					return;
				}
				data = JSON.parse(data);
				let definitions = data[`list`];
				if (data[`result_type`] === `no_results` || !data) {
					this.sendReplyBox(`No results for <strong>"${target}"</strong>.`);
					if (room) room.update();
					return;
				} else {
					if (!definitions[0][`word`] || !definitions[0][`definition`]) {
						this.sendReplyBox(`No results for <strong>"${target}"</strong>.`);
						if (room) room.update();
						return;
					}
					let output = `<strong>${definitions[0][`word`]}</strong> ${definitions[0][`definition`].replace(/\r\n/g, `<br />`).replace(/\n/g, ` `)}`;
					if (output.length > 400) output = output.slice(0, 400) + `...`;
					this.sendReplyBox(output);
					udCache[toId(target)] = output;
					if (room) room.update();
					return;
				}
			});
		});
	},
	urbandefinehelp: ["/u [word] - Gives the Urban Definition for a word."],
};
