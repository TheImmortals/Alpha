/*************************************
* Symbol Color for Pokemon Showdown  *
*************************************/
"use strict";

const FS = require("../lib/fs.js");

let scData = FS("config/sc.json").readIfExistsSync();
let sc = {};

if (scData) {
	sc = JSON.parse(scData);
}

function updateSC() {
	FS("config/sc.json").writeUpdate(() => (
		JSON.stringify(sc)
	));

	let newCss = "\n/* Symbol Colors START */\n";

	for (let name in sc) {
		newCss += generateCSS(name, sc[name]);
	}
	newCss += "/* Symbol Colors END */\n";

	let file = FS("config/custom.css").readIfExistsSync().split("\n");
	if (file.includes("/* Symbol Colors START */")) file.splice(file.indexOf("/* Symbol Colors START */"), (file.indexOf("/* Symbol Colors END */") - file.indexOf("/* Symbol Colors START */")) + 1);
	FS("config/custom.css").writeUpdate(() => (
		file.join("\n") + newCss
	));
	Server.reloadCSS();
}

function generateCSS(name, sc) {
	let css = "";
	name = toId(name);
	css = `[id*="-userlist-user-${name}"] button > em.group {\nbackground: url("${sc}") no-repeat right !important;\n}\n`;
	return css;
}

exports.commands = {
	symbolcolor: "sc",
	sc: {
		set: function (target, room, user) {
			if (!this.can('icon')) return false;
			target = target.split(',');
			for (let u in target) target[u] = target[u].trim();
			if (target.length !== 2) return this.parse("/help sc");
			if (toId(target[0]).length > 19) return this.errorReply("Usernames are not this long...");
			if (!sc[toId(target[0])]) return this.errorReply("This user already has a custom symbol color.  Do /sc delete [user] and then set their new symbol color.");
			this.sendReply(`|raw|You have given ${Server.nameColor(target[0], true)} an symbol color.`);
			Monitor.log(`${target[0]} has received an symbol color from ${user.name}.`);
			this.privateModAction(`|raw|(${target[0]} has received symbol color: "${target[1]} from ${user.name}.)`);
			this.modlog("SC", target[0], `Set symbol color to ${target[1]}`);
			if (Users(toId(target[0])) && Users(toId(target[0])).connected) Users(target[0]).popup(`|html|${Server.nameColor(user.name, true)} has set your symbol color to: ${target[1]}<br /><center>Refresh, If you don't see it.</center>`);
			sc[toId(target[0])] = target[1];
			updateSC();
		},

		remove: "delete",
		delete: function (target, room, user) {
			if (!this.can('icon')) return false;
			target = toId(target);
			if (!sc[toId(target)]) return this.errorReply(`/sc - ${target} does not have symbol color.`);
			delete sc[toId(target)];
			updateSC();
			this.sendReply(`You removed ${target}'s symbol color.`);
			Monitor.log(`${user.name} removed ${target}'s symbol color.`);
			this.privateModAction(`(${target}'s symbol color was removed by ${user.name}.)`);
			this.modlog("SC", target, `Removed sbol color.`);
			if (Users(toId(target)) && Users(toId(target)).connected) Users(target).popup(`|html|${Server.nameColor(user.name, true)} has removed your symbol color.`);
		},

		"": "help",
		help: function (target, room, user) {
			this.parse("/schelp");
		},
	},

	schelp: [
		"Commands Include:",
		"/sc set [user], [color] - Gives [user] an symbol color of [color]",
		"/sc delete [user] - Deletes a user's symbol color",
	],
};
