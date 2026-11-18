import React, { useEffect, useRef, useState } from 'react';
import { TypeTags } from './PokemonCard';
import { damage, MAX_ENERGY, resolveTurn, reinforce } from './battle.mjs';
import { effectiveness } from './roster.mjs';

function Energy({ amount }) {
  return <div className="energy" aria-label={`Energy ${amount} out of ${MAX_ENERGY}`}>
    {Array.from({ length: MAX_ENERGY }, (_, index) => <span aria-hidden="true" key={index} className={index < amount ? 'charged' : ''} />)}
    <small>{amount}/{MAX_ENERGY} EN</small>
  </div>;
}

function Combatant({ pokemon, rival, event }) {
  const side = rival ? 'bot' : 'player';
  const acting = event?.actor === side;
  const hit = event?.kind === 'attack' && event.target === side;
  const effect = hit ? 'taking-hit' : acting ? `acting-${event.kind}` : '';
  const percentage = pokemon.health / pokemon.hp * 100;
  return (
    <div className={`combatant ${rival ? 'rival' : 'trainer'} ${effect}`} data-type={pokemon.types[0]}>
      <div className="fighter-info">
        <p className="eyebrow">{rival ? 'RIVAL AI' : 'YOUR ACTIVE POKÉMON'}</p>
        <div className="fighter-title"><h2>{pokemon.name}</h2><TypeTags types={pokemon.types} /></div>
        <div className="hp-label"><span>HP</span><strong>{pokemon.health} <span>/ {pokemon.hp}</span></strong></div>
        <progress className={percentage <= 25 ? 'danger' : ''} value={pokemon.health} max={pokemon.hp} aria-label={`${pokemon.name} health`} />
        <Energy amount={pokemon.energy} />
      </div>
      <div className="fighter-art">
        <img className={!pokemon.health ? 'fainted' : ''} src={pokemon.image} alt={pokemon.name} />
        {acting && event.kind === 'guard' && <span className="guard-aura" aria-hidden="true">GUARD</span>}
        {hit && <span className="hit-number" aria-hidden="true">{event.hit ? `−${event.hit} HP` : 'IMMUNE'}</span>}
      </div>
    </div>
  );
}

function Team({ side, rival = false, canPlay, needsReplacement, act }) {
  const alive = side.team.filter(member => member.health > 0).length;
  return (
    <section className="team-panel" aria-label={rival ? 'Rival squad' : 'Your bench'}>
      <div className="team-title"><h3>{rival ? 'Rival squad' : 'Your bench'}</h3><span>{alive}/{side.team.length} standing</span></div>
      <div className="bench">
        {side.team.map((member, index) => {
          const isActive = index === side.active;
          const canSwitch = !rival && canPlay && member.health > 0 && !isActive;
          const label = !member.health ? 'Fainted' : isActive ? 'Active' : `${member.health} HP · ${member.energy} EN`;
          const content = <><img src={member.image} alt="" /><span><strong>{member.name}</strong><small>{label}</small></span></>;
          const className = `bench-tile${isActive ? ' active' : ''}${!member.health ? ' fainted' : ''}`;
          return canSwitch ?
            <button key={member.id} className={className} onClick={() => act(index)}
              aria-label={`${needsReplacement ? 'Send in' : 'Switch to'} ${member.name}, ${label}`}>{content}</button> :
            <div key={member.id} className={className}>{content}</div>;
        })}
      </div>
    </section>
  );
}

function Move({ move, user, target, disabled, onClick }) {
  const multiplier = effectiveness(move.type, target.types);
  const rating = multiplier === 0 ? 'Immune' : multiplier > 1 ? `${multiplier}× effective` : multiplier < 1 ? `${multiplier}× resisted` : 'Neutral';
  const shortfall = Math.max(0, -(user.energy + move.energy));
  return (
    <button className="move" disabled={disabled || shortfall > 0} onClick={onClick} data-type={move.type}>
      <div className="move-top"><TypeTags types={[move.type]} /><span className={move.energy > 0 ? 'gain' : ''}>{move.energy > 0 ? '+' : '−'}{Math.abs(move.energy)} EN</span></div>
      <strong>{move.name}</strong>
      <small>{damage(user, target, move)} damage · {rating}</small>
      <span className={shortfall ? 'move-hint shortfall' : 'move-hint'}>{shortfall ? `Need ${shortfall} more energy` : move.priority ? 'Fast move · builds energy' : 'Power move'}</span>
    </button>
  );
}

export default function Arena({ battle, setBattle, onEdit, onRematch, onGuide }) {
  const [playback, setPlayback] = useState(null);
  const [speed, setSpeed] = useState('normal');
  const [switching, setSwitching] = useState(false);
  const locked = useRef(false);
  const switchTarget = useRef(null);
  const busy = Boolean(playback);
  const shown = playback ? playback.frames[playback.index] : battle;
  const event = busy ? shown.event : null;
  const player = shown.player.team[shown.player.active];
  const rival = shown.bot.team[shown.bot.active];
  const replacement = player.health === 0 && !busy && !shown.winner;
  const headline = busy ? event.message : shown.winner ?
    (shown.winner === 'player' ? 'Victory! Your squad wins.' : 'Your squad was defeated.') :
    replacement ? 'Choose your next Pokémon.' : `Your turn · What will ${player.name} do?`;

  useEffect(() => {
    if (!playback) return;
    const timer = window.setTimeout(() => {
      if (playback.index + 1 < playback.frames.length) {
        setPlayback({ ...playback, index: playback.index + 1 });
      } else {
        locked.current = false;
        setPlayback(null);
      }
    }, shown.duration * (speed === 'fast' ? 0.5 : 1));
    return () => window.clearTimeout(timer);
  }, [playback, shown.duration, speed]);

  useEffect(() => {
    if (switching) switchTarget.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [switching]);

  function action(choice) {
    if (locked.current || battle.winner) return;
    const resolution = resolveTurn(battle, choice);
    if (!resolution.frames.length) return;
    locked.current = true;
    setSwitching(false);
    setPlayback({ frames: resolution.frames, index: 0 });
    setBattle(resolution.result);
  }
  function switchTo(index) {
    if (locked.current) return;
    if (replacement) {
      setBattle(state => reinforce(state, index));
      setSwitching(false);
    } else {
      action({ kind: 'switch', index });
    }
  }

  return (
    <div className="arena">
      <div className="arena-header">
        <div><p className="eyebrow"><span className="signal" /> {battle.player.team.length} VS {battle.bot.team.length} · TRAINER VS AI</p><h1>Battle Arena</h1></div>
        <div className="arena-links"><button className="plain-button" onClick={onGuide}>Battle guide</button>
          {!battle.winner && <button className="secondary" onClick={onEdit}>End battle</button>}</div>
      </div>
      <section className="battlefield" aria-label="Battlefield">
        <div className="round-label">{shown.winner ? 'BATTLE COMPLETE' : `ROUND ${shown.round}`}</div>
        <Combatant key={`player-${player.id}-${playback?.index ?? 'ready'}`} pokemon={player} event={event} />
        <span className="versus" aria-hidden="true">VS</span>
        <Combatant key={`bot-${rival.id}-${playback?.index ?? 'ready'}`} pokemon={rival} rival event={event} />
      </section>
      <div className={`turn-banner ${busy ? 'resolving' : ''}`} role="status" aria-live="polite" aria-atomic="true">
        <div><span className="turn-label">{busy ? (event.actor === 'player' ? 'YOUR POKÉMON' : 'RIVAL AI') : 'BATTLE STATUS'}</span>
          <p>{headline}</p></div>
        <label className="playback-speed">Playback
          <select aria-label="Battle playback speed" value={speed} onChange={change => setSpeed(change.target.value)}>
            <option value="normal">Normal</option><option value="fast">Fast</option>
          </select>
        </label>
      </div>
      <div ref={switchTarget} className={`teams panel ${switching || replacement ? 'choose-bench' : ''}`}>
        <Team side={shown.player} canPlay={!busy && !shown.winner} needsReplacement={replacement} act={switchTo} />
        <Team side={shown.bot} rival />
      </div>
      <div className="battle-bottom">
        <section className="actions panel">
          {shown.winner ? (
            <div className="battle-result" role="status">
              <p className="eyebrow">BATTLE COMPLETE</p><h2>{shown.winner === 'player' ? 'Victory' : 'Defeat'}</h2>
              <p>{shown.winner === 'player' ? 'You defeated the rival squad.' : 'The rival knocked out your squad.'}</p>
              <div className="result-buttons"><button className="primary" onClick={onRematch}>Rematch <span aria-hidden="true">→</span></button><button className="secondary" onClick={onEdit}>Edit squad</button></div>
            </div>
          ) : (
            <>
              <div className="section-head"><div><h2>{busy ? 'Round in progress' : replacement ? 'Choose a replacement' : switching ? 'Choose a teammate' : 'Choose your action'}</h2>
                <p>{busy ? 'Watch each action play out. Your next turn will open automatically.' : replacement ? `${player.name} fainted. Pick a healthy teammate above to continue.` :
                  switching ? 'Choose a teammate above. Switching uses this turn.' : 'Tap a move to attack. Quick Strike and Guard restore energy.'}</p></div>
                {!busy && !replacement && <button className="secondary switch-action" onClick={() => setSwitching(!switching)}
                  disabled={shown.player.team.filter(member => member.health > 0).length < 2}>{switching ? 'Cancel' : 'Switch Pokémon'}</button>}
              </div>
              {!replacement && <div className="moves" aria-busy={busy}>
                {player.moves.map((move, index) => <Move key={move.name} move={move} user={player} target={rival} disabled={busy} onClick={() => action({ kind: 'attack', index })} />)}
                <button className="move guard" disabled={busy} onClick={() => action({ kind: 'guard' })}>
                  <div className="move-top"><span>DEFENSE</span><span className="gain">+2 EN</span></div><strong>Guard & recharge</strong><small>Block 55% of incoming damage</small><span className="move-hint">Recover energy for stronger moves</span>
                </button>
              </div>}
              {!replacement && !busy && <p className="turn-tip">Fast moves act before power moves. Speed breaks ties. Damage previews are before Guard.</p>}
            </>
          )}
        </section>
        <section className="log panel">
          <h2>Battle log</h2>
          <ol aria-label="Battle history">{[...shown.history].reverse().map((entry, index) =>
            <li key={battle.history.length - index}><strong>{entry.round ? `Round ${entry.round}` : 'Deployment'}</strong>
              {entry.messages.map((message, messageIndex) => <p key={messageIndex}>{message}</p>)}</li>)}</ol>
        </section>
      </div>
    </div>
  );
}
