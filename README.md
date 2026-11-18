# PokéTactics

A Pokémon strategy web game with 50 arena-ready Pokémon, turn-based 3v3 and 5v5 matches against a rule-based rival bot, and a Pokédex.

## Features

- Draft three or five Pokémon, search by name, filter by type, and choose your lead.
- Compare HP, attack, defense, speed, and moves before entering the arena.
- Manage energy, type advantages, Guard, and switches during each match.
- Watch actions resolve in sequence with attack effects, HP updates, and a battle log.
- Browse Pokémon species, measurements, and base stats through PokéAPI.

Arena stats and energy costs are tuned for this game.

## Run locally

Requires Node.js, npm, and Python 3.

Install the locked dependencies and build the app.

```sh
npm ci --ignore-scripts --no-bin-links
npm run build
npm start
```

Open [http://127.0.0.1:4179/](http://127.0.0.1:4179/). The server listens on the local computer.

Arena data and artwork are bundled with the project. Pokédex requests and Google Fonts require an internet connection.

## Technologies

React 17, JavaScript, HTML, CSS, esbuild, PokéAPI, and a Python HTTP server for local preview.

## Credits

Built from [Megh2507/Pokemon-App](https://github.com/Megh2507/Pokemon-App), with a redesigned interface and an added battle system.

Pokémon species data comes from [PokéAPI](https://pokeapi.co/). Artwork comes from [PokeAPI/sprites](https://github.com/PokeAPI/sprites). Pokémon names and artwork belong to their respective owners. This is a fan project.
