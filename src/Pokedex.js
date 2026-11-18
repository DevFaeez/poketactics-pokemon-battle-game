import React, { useEffect, useRef, useState } from 'react';
import { number, PokemonCard, TypeTags } from './PokemonCard';
import { roster } from './roster.mjs';

const api = 'https://pokeapi.co/api/v2/pokemon';
const pageSize = 20;
const localArtwork = new Set(roster.map(pokemon => pokemon.id));
const pages = new Map();
const pokemonName = name => name.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');

async function readJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('PokéAPI request failed');
  return response.json();
}

async function loadPage(offset) {
  if (!pages.has(offset)) {
    const request = readJson(`${api}?limit=${pageSize}&offset=${offset}`).then(async page => ({
      more: Boolean(page.next),
      pokemon: await Promise.all(page.results.map(async entry => {
        const data = await readJson(`${api}/${entry.name}`);
        return {
          id: data.id, name: pokemonName(data.name), types: data.types.map(item => item.type.name),
          image: localArtwork.has(data.id) ? `/art/${data.id}.png` :
            data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
          height: data.height / 10, weight: data.weight / 10,
          stats: data.stats.map(item => [item.stat.name.replace('special-', 'Sp. '), item.base_stat]),
        };
      })),
    })).catch(error => {
      pages.delete(offset);
      throw error;
    });
    pages.set(offset, request);
  }
  return pages.get(offset);
}

function Details({ pokemon, onClose }) {
  const dialog = useRef(null);
  useEffect(() => { dialog.current.showModal(); }, []);
  return (
    <dialog ref={dialog} className="dialog dex-detail" onClose={onClose} aria-labelledby="dex-pokemon">
      <div className="dialog-head">
        <div><p className="eyebrow">{number(pokemon.id)}</p><h2 id="dex-pokemon">{pokemon.name}</h2></div>
        <button className="icon-button" onClick={() => dialog.current.close()} aria-label="Close Pokémon details">×</button>
      </div>
      <div className="dex-art" data-type={pokemon.types[0]}><img src={pokemon.image} alt={pokemon.name} /></div>
      <TypeTags types={pokemon.types} />
      <dl className="measurements"><div><dt>Height</dt><dd>{pokemon.height} m</dd></div><div><dt>Weight</dt><dd>{pokemon.weight} kg</dd></div></dl>
      <div className="dex-stats">
        {pokemon.stats.map(([stat, value]) => <div key={stat}><span>{stat}</span>
          <progress value={value} max={255} aria-label={stat} /><strong>{value}</strong></div>)}
      </div>
    </dialog>
  );
}

export default function Pokedex() {
  const [pokemon, setPokemon] = useState([]);
  const [more, setMore] = useState(true);
  const [status, setStatus] = useState('loading');
  const [offset, setOffset] = useState(0);
  const [retry, setRetry] = useState(0);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    let mounted = true;
    setStatus('loading');
    loadPage(offset).then(page => {
      if (!mounted) return;
      setPokemon(previous => [...previous, ...page.pokemon]);
      setMore(page.more);
      setStatus('ready');
    }).catch(() => {
      if (mounted) setStatus('error');
    });
    return () => { mounted = false; };
  }, [offset, retry]);

  return (
    <section className="dex">
      <div className="dex-heading"><p className="eyebrow"><span className="signal" /> FIELD GUIDE</p><h1>Pokédex</h1><p>Explore Pokémon types, base stats, and measurements.</p></div>
      <div className="pokemon-grid dex-grid">{pokemon.map(member =>
        <PokemonCard key={member.id} pokemon={member} selectable={false} onSelect={() => setDetails(member)} />)}</div>
      <div className="dex-footer" aria-live="polite">
        {status === 'loading' && <p>Loading Pokémon…</p>}
        {status === 'error' && <><p>Couldn’t reach PokéAPI.</p><button className="secondary" onClick={() => setRetry(retry + 1)}>Try again</button></>}
        {status === 'ready' && more && <button className="secondary" onClick={() => setOffset(offset + pageSize)}>Load more Pokémon <span aria-hidden="true">↓</span></button>}
      </div>
      {details && <Details pokemon={details} onClose={() => setDetails(null)} />}
    </section>
  );
}
