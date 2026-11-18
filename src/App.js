import React, { useEffect, useRef, useState } from 'react';
import { roster, types } from './roster.mjs';
import { createBattle } from './battle.mjs';
import Arena from './Arena';
import Pokedex from './Pokedex';
import { number, PokemonCard, TypeTags } from './PokemonCard';

function Rules({ onClose }) {
  const dialog = useRef(null);
  useEffect(() => { dialog.current.showModal(); }, []);
  return (
    <dialog className="dialog" ref={dialog} onClose={onClose} aria-labelledby="guide-title">
      <div className="dialog-head">
        <h2 id="guide-title">Battle guide</h2>
        <button className="icon-button" onClick={() => dialog.current.close()} aria-label="Close battle guide">×</button>
      </div>
      <dl className="rules">
        <div><dt>Matchups</dt><dd>Moves can hit for up to 4× damage against dual types. Some targets are immune. The damage preview shows the hit before Guard.</dd></div>
        <div><dt>Energy</dt><dd>Each Pokémon starts with 2 energy and holds up to 5. Quick Strike gives 1. Signature moves cost 2 and power moves cost 3.</dd></div>
        <div><dt>Turn order</dt><dd>Switches go first, then Guard and Quick Strike. Speed decides between actions with the same priority. You act first on a speed tie.</dd></div>
        <div><dt>Guard or switch</dt><dd>Guard blocks 55% of incoming damage and restores 2 energy. Switching uses your turn and the incoming Pokémon can be hit.</dd></div>
        <div><dt>Reinforcements</dt><dd>When a Pokémon faints, choose a replacement for free. Win by knocking out the rival’s whole team.</dd></div>
      </dl>
    </dialog>
  );
}

function Hero({ onGuide }) {
  return (
    <section className="hero">
      <div className="hero-orbit" aria-hidden="true" />
      <img className="hero-art" src="/art/6.png" alt="" />
      <div className="hero-copy">
        <p className="eyebrow"><span className="signal" /> TRAINER VS AI</p>
        <h1>Pokémon<br /><em>Battle Arena</em></h1>
        <p>Draft your squad, read the matchup, and take on a rival that fights back.</p>
        <button className="text-button" onClick={onGuide}>Battle guide <span aria-hidden="true">↗</span></button>
      </div>
    </section>
  );
}

function Squad({ size, squad, onRemove, onLead, onStart, onClear }) {
  const complete = squad.length === size;
  return (
    <aside className="squad panel" aria-labelledby="squad-title">
      <div className="squad-head"><h2 id="squad-title">Your squad</h2><span className="capacity"><strong>{squad.length}</strong> / {size}</span></div>
      <p>Pick {size} Pokémon. Your lead enters first.</p>
      <ol className="squad-slots">
        {Array.from({ length: size }, (_, index) => {
          const member = squad[index];
          return member ? (
            <li className="squad-slot filled" key={index} data-type={member.types[0]}>
              <img src={member.image} alt="" />
              <button type="button" className="lead-choice" disabled={index === 0} onClick={() => onLead(index)} title="Make lead">
                <strong>{member.name}</strong><small>{index === 0 ? 'LEAD' : 'Make lead'}</small>
              </button>
              <button className="icon-button remove" onClick={() => onRemove(member.id)} aria-label={`Remove ${member.name} from squad`}>×</button>
            </li>
          ) : <li className="squad-slot vacant" key={index}><span aria-hidden="true">＋</span>{index === 0 ? 'Lead slot' : `Open slot ${index + 1}`}</li>;
        })}
      </ol>
      <button type="button" className="primary start-button" onClick={onStart} disabled={!complete}>Start battle <span aria-hidden="true">→</span></button>
      <div className="squad-foot">
        <span>{complete ? 'Squad ready' : `${size - squad.length} more to pick`}</span>
        {squad.length > 0 && <button className="plain-button" onClick={onClear}>Clear</button>}
      </div>
    </aside>
  );
}

function Scout({ pokemon, onClose }) {
  const dialog = useRef(null);
  useEffect(() => { dialog.current.showModal(); }, []);
  return (
    <dialog className="dialog" ref={dialog} onClose={onClose} aria-labelledby="scout-name">
      <div className="dialog-head">
        <div><p className="eyebrow">{number(pokemon.id)} · ARENA PROFILE</p><h2 id="scout-name">{pokemon.name}</h2></div>
        <button className="icon-button" onClick={() => dialog.current.close()} aria-label="Close arena profile">×</button>
      </div>
      <div className="dex-art" data-type={pokemon.types[0]}><img src={pokemon.image} alt={pokemon.name} /></div>
      <TypeTags types={pokemon.types} />
      <dl className="measurements scout-stats">
        {[['HP', 'hp'], ['Attack', 'attack'], ['Defense', 'defense'], ['Speed', 'speed']].map(([label, stat]) =>
          <div key={stat}><dt>{label}</dt><dd>{pokemon[stat]}</dd></div>)}
      </dl>
      <h3 className="scout-moves-title">Move set</h3>
      <ul className="scout-moves">
        {pokemon.moves.map(move => <li key={move.name}>
          <strong>{move.name}</strong><TypeTags types={[move.type]} />
          <span>{move.energy > 0 ? '+' : '−'}{Math.abs(move.energy)} EN</span>
        </li>)}
      </ul>
    </dialog>
  );
}

function Draft({ size, setSize, squad, setSquad, onStart, onGuide }) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [scouting, setScouting] = useState(null);
  const visible = roster.filter(pokemon => pokemon.name.toLowerCase().includes(search.trim().toLowerCase())
    && (type === 'all' || pokemon.types.includes(type)));
  const availableTypes = types.filter(option => roster.some(pokemon => pokemon.types.includes(option)));
  const remove = id => setSquad(squad.filter(member => member.id !== id));
  function choose(pokemon) {
    if (squad.some(member => member.id === pokemon.id)) remove(pokemon.id);
    else if (squad.length < size) setSquad([...squad, pokemon]);
  }

  return (
    <>
      <Hero onGuide={onGuide} />
      <div className="draft-layout">
        <section className="draft-roster" aria-labelledby="roster-title">
          <div className="section-head">
            <div><h2 id="roster-title">Draft your team</h2><p>{roster.length} arena-ready Pokémon</p></div>
            <div className="segmented" aria-label="Battle format">
              {[3, 5].map(count => <button key={count} aria-pressed={count === size} onClick={() => {
                setSize(count);
                setSquad(squad.slice(0, count));
              }}>{count} vs {count}</button>)}
            </div>
          </div>
          <div className="roster-tools">
            <label className="search-field"><span aria-hidden="true" className="search-icon" /><input type="search" placeholder="Search Pokémon" aria-label="Search Pokémon" value={search} onChange={event => setSearch(event.target.value)} /></label>
            <select value={type} onChange={event => setType(event.target.value)} aria-label="Filter Pokémon by type">
              <option value="all">All types</option>
              {availableTypes.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div className="pokemon-grid">
            {visible.map(pokemon => {
              const selected = squad.some(member => member.id === pokemon.id);
              return (
                <div className="scout-card" key={pokemon.id}>
                  <PokemonCard pokemon={pokemon} selected={selected} disabled={squad.length === size && !selected}
                    onSelect={() => choose(pokemon)} />
                  <button className="scout-button" aria-label={`Scout ${pokemon.name}`} onClick={() => setScouting(pokemon)}>i</button>
                </div>
              );
            })}
          </div>
          {!visible.length && <p className="empty panel">No Pokémon match your filters.</p>}
        </section>
        <Squad size={size} squad={squad} onRemove={remove} onStart={onStart} onClear={() => setSquad([])}
          onLead={index => setSquad([squad[index], ...squad.filter((_, position) => position !== index)])} />
      </div>
      <button className="primary mobile-launch" onClick={onStart} disabled={squad.length !== size}>
        Start battle · {squad.length}/{size} <span aria-hidden="true">→</span>
      </button>
      {scouting && <Scout pokemon={scouting} onClose={() => setScouting(null)} />}
    </>
  );
}

export default function App() {
  const [view, setView] = useState('arena');
  const [size, setSize] = useState(3);
  const [squad, setSquad] = useState([]);
  const [battle, setBattle] = useState(null);
  const [guide, setGuide] = useState(false);
  function navigate(tab) {
    setView(tab);
    window.scrollTo(0, 0);
  }
  function start() {
    if (squad.length !== size) return;
    setBattle(createBattle(squad));
    window.scrollTo(0, 0);
  }
  function edit() {
    setBattle(null);
    window.scrollTo(0, 0);
  }

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <button className="brand" onClick={() => navigate('arena')} aria-label="PokéTactics home">
            <span className="brand-icon" aria-hidden="true"><i /></span><span>Poké<span>Tactics</span></span>
          </button>
          <nav aria-label="Main navigation">
            <button aria-current={view === 'arena' ? 'page' : undefined} onClick={() => navigate('arena')}>Arena</button>
            <button aria-current={view === 'dex' ? 'page' : undefined} onClick={() => navigate('dex')}>Pokédex</button>
          </nav>
          <button className="guide-link" aria-label="Battle guide" onClick={() => setGuide(true)}><span aria-hidden="true">?</span> <span>Battle guide</span></button>
        </div>
      </header>
      <main className="shell">
        {view === 'dex' ? <Pokedex /> : battle ?
          <Arena battle={battle} setBattle={setBattle} onEdit={edit} onRematch={start} onGuide={() => setGuide(true)} /> :
          <Draft size={size} setSize={setSize} squad={squad} setSquad={setSquad} onStart={start} onGuide={() => setGuide(true)} />}
      </main>
      <footer className="site-footer"><span>PokéTactics</span><span>Pokémon data and artwork via <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">PokéAPI</a></span></footer>
      {guide && <Rules onClose={() => setGuide(false)} />}
    </>
  );
}
