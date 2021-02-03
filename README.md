Alpha @ Pokémon Showdown
========================================================================

Navigation: [Website][1] | **Server repository** | [Client repository][2] | [Dex repository][3]

  [1]: http://sun.psim.us/
  [2]: https://github.com/Zarel/Pokemon-Showdown-Client
  [3]: https://github.com/Zarel/Pokemon-Showdown-Dex

[![Build Status](https://travis-ci.org/FlamePrince-PS/PokemonShowdown-Impulse.svg?branch=master)](https://travis-ci.com/FlamePrince-PS/PokemonShowdown-Alpha)
[![Dependency Status](https://david-dm.org/FlamePrince-PS/PokemonShowdown-Impulse.svg)](https://david-dm.org/FlamePrince-PS/PokemonShowdown-Alpha)
[![devDependency Status](https://david-dm.org/FlamePrince-PS/PokemonShowdown-Impulse/dev-status.svg)](https://david-dm.org/FlamePrince-PS/PokemonShowdown-Alpha?type=dev)

Introduction
------------------------------------------------------------------------

Well, i just copied AllianceSky-PS/Impulse which was a very cool repo and everyone used it to make a server. Though, i made this project with some edits no one have to do it later. Like it has no ``/noreply`` glitch and config's name is already set, and more. We added ton of things. Custom avatars are also available! DONT FORGET TO SEE THEM!

Credits goes to:

- Guangcong Luo [Zarel]- Main Code Owner, PS Owner
- Other contributors in Pokemon Showdown (see [PS Credits][4])
- Akash Kumar [Prince Sky]- [Impulse Repo][5] Owner.
- Arjun Kumar [The Dark Sunset]- Repo Owner
- Aadhikesh - Repo Owner, Helper
- Ritik Gupta [Shade Ritik]- Helper and Best supporter

[4]: https://pokemonshowdown.com/credits
[5]: https://github.com/AllianceSky-PS/Impulse

How to make server on glitch:
------------------------------------------------------------------------
The best guide is [this][6], but still you can see this:

Open [Glitch][7]

Open New Project -> Hello Express

Let project load and go in tools -> Import/Export -> Import from GitHub 

It will ask you which repo. Enter ``TheImmortals/Alpha``

Let the project load. And press show -> In a new window

[6]: https://docs.google.com/document/d/1Fm-Sh7cfAuAmXgkEELo06NN0z0fm9JMdHGscOOTX49k/edit?usp=sharing
[7]: https://glitch.com/


Setting up an Administrator account and System Operator
------------------------------------------------------------------------

Once your server is up, you probably want to make yourself an Administrator (~)  and give yourself more powers on it. So here is the guide:

Open a new file: ``config/usergroups.csv``

Then give: ``[your username],~``  Note: No space or capitalization 

Open ``config.js`` and go in line 107 and change “immortalsx” to your username. (comma seperate to add more users)


Installing
------------------------------------------------------------------------

    ./pokemon-showdown

(Requires Node.js 8+)


Detailed installation instructions
------------------------------------------------------------------------

Pokémon Showdown requires you to have [Node.js][8] installed, 8.x or later (7.7 or later can work, but you might as well be on the latest stable).

Next, obtain a copy of Pokémon Showdown Alpha. If you're reading this outside of GitHub, you've probably already done this. If you're reading this in GitHub, there's a "Clone or download" button near the top right (it's green). I recommend the "Open in Desktop" method - you need to install GitHub Desktop which is more work than "Download ZIP", but it makes it much easier to update in the long run (it lets you use the `/updateserver` command).

Pokémon Showdown is installed and run using a command line. In Mac OS X, open `Terminal` (it's in Utilities). In Windows, open `Command Prompt` (type `cmd` into the Start menu and it should be the first result). Type this into the command line:

    cd LOCATION

Replace `LOCATION` with the location Pokémon Showdown Alpha is in (ending up with, for instance, `cd "~/Downloads/PokemonShowdown-Alpha"` or `cd "C:\Users\Bob\Downloads\PokemonShowdown-Alpha\"`).

This will set your command line's location to Pokémon Showdown-Alpha's folder. You'll have to do this each time you open a command line to run commands for Pokémon Showdown.

Copy `config/config-example.js` into `config/config.js`, and edit as you please.

Congratulations, you're done setting up Pokémon Showdown.

Now, to start Pokémon Showdown. run the command:

    node pokemon-showdown

(If you're not on Windows, we recommend doing `./pokemon-showdown` instead.)

You can also specify a port:

    node pokemon-showdown 8000

Visit your server at `http://SERVER:8000`

Replace `SERVER` with your server domain or IP. Replace `8000` with your port if it's not `8000` (the default port).

Yes, you can test even if you are behind a NAT without port forwarding: `http://localhost:8000` will connect to your local machine. Some browser setups might prevent this sort of connection, however (NoScript, for instance). If you can't get connecting locally to work in Firefox, try Chrome.

You will be redirected to `http://SERVER.psim.us`. The reason your server is visited through `psim.us` is to make it more difficult for servers to see a user's password in any form, by handling logins globally. You can embed this in an `iframe` in your website if the URL is a big deal with you.

If you truly want to host the client yourself, there is [a repository for the Pokémon Showdown Client][9]. It's not recommended for beginners, though.

  [8]: https://nodejs.org/
  [9]: https://github.com/Zarel/Pokemon-Showdown-Client


Setting up an Administrator account
------------------------------------------------------------------------

Once your server is up, you probably want to make yourself an Administrator (~) on it.

### config/usergroups.csv

To become an Administrator, create a file named `config/usergroups.csv` containing

    USER,~

Replace `USER` with the username that you would like to become an Administrator. Do not put a space between the comma and the tilde.

This username must be registered. If you do not have a registered account, you can create one using the Register button in the settings menu (it looks like a gear) in the upper-right of Pokémon Showdown.

Once you're an administrator, you can promote/demote others easily with the `/globaladmin`, `/globalleader`, `/globalmod`, etc commands.


Browser support
------------------------------------------------------------------------

Pokémon Showdown currently supports, in order of preference:

 - Chrome
 - Firefox
 - Opera
 - Safari 5+
 - IE11+
 - Chrome/Firefox/Safari for various mobile devices

Pokémon Showdown is usable, but expect degraded performance and certain features not to work in:

 - Safari 4+
 - IE9+

Pokémon Showdown is mostly developed on Chrome, and Chrome or the desktop client is required for certain features like dragging-and-dropping teams from PS to your computer. However, bugs reported on any supported browser will usually be fixed pretty quickly.


Community
------------------------------------------------------------------------

PS has a built-in chat service. Join our main server to talk to us!

You can also visit the [Pokémon Showdown forums][10] for discussion and help.

  [10]: https://www.smogon.com/forums/forums/pok%C3%A9mon-showdown.209/

If you'd like to contribute to programming and don't know where to start, feel free to check out [Ideas for New Developers][11].

  [11]: https://github.com/Zarel/Pokemon-Showdown/issues/2444


License
------------------------------------------------------------------------

Pokémon Showdown's server is distributed under the terms of the [MIT License][12].

  [12]: https://github.com/Zarel/Pokemon-Showdown/blob/master/LICENSE


Maintainers
------------------------------------------------------------------------

Owners:

- The Dark Sunset
- Aadhikesh
- Prince Hoenn

Major Contributors

**All respectable custom-plugins & SGgame creators.**


Special thanks

- See http://pokemonshowdown.com/credits
