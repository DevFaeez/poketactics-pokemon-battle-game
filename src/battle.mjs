import { effectiveness, roster } from './roster.mjs';

export const MAX_ENERGY = 5;
export const GUARD_FACTOR = 0.45;

export function damage(attacker, defender, move) {
  const factor = effectiveness(move.type, defender.types);
  const sameType = attacker.types.includes(move.type) ? 1.15 : 1;
  const base = move.power * (0.65 + attacker.attack / (attacker.attack + defender.defense));
  return Math.round(base * factor * sameType);
}

const fighter = pokemon => ({ ...pokemon, health: pokemon.hp, energy: 2 });
const active = side => side.team[side.active];
const viable = (member, index, side) => member.health > 0 && index !== side.active;
const available = (member, move) => member.energy + move.energy >= 0;

export function createBattle(squad, random = Math.random) {
  const pool = roster.filter(pokemon => !squad.some(member => member.id === pokemon.id));
  const opponents = squad.map(() => pool.splice(Math.floor(random() * pool.length), 1)[0]);
  return {
    round: 1,
    player: { team: squad.map(fighter), active: 0 },
    bot: { team: opponents.map(fighter), active: 0 },
    history: [{ round: 0, messages: [`You sent out ${squad[0].name}. Rival AI chose ${opponents[0].name}.`] }],
    winner: null,
  };
}

function matchup(member, target) {
  return Math.max(...member.moves.filter(move => available(member, move)).map(move => damage(member, target, move)));
}

function pickReplacement(side, target) {
  return side.team.reduce((best, member, index) => {
    if (!viable(member, index, side)) return best;
    return best === -1 || matchup(member, target) > matchup(side.team[best], target) ? index : best;
  }, -1);
}

function botAction(bot, player) {
  const member = active(bot);
  const target = active(player);
  const attacks = member.moves.flatMap((move, index) => {
    if (!available(member, move)) return [];
    const hit = damage(member, target, move);
    const finish = hit >= target.health ? 80 : 0;
    const energyValue = move.energy > 0 ? (member.energy < MAX_ENERGY ? 8 : 0) : move.energy * 2;
    return [{ kind: 'attack', index, score: Math.min(hit, target.health) + finish + energyValue }];
  });
  const best = attacks.reduce((a, b) => a.score >= b.score ? a : b);
  const enemyDamage = matchup(target, member);
  const bench = pickReplacement(bot, target);
  if (best.score < 70 && bench !== -1) {
    const incoming = bot.team[bench];
    if (enemyDamage >= member.health && matchup(target, incoming) < incoming.health * 0.55
      && matchup(incoming, target) >= 20) return { kind: 'switch', index: bench };
  }
  if (best.score < 28 && member.energy <= 2 && enemyDamage * GUARD_FACTOR < member.health
    && (best.score < 18 || enemyDamage >= member.health)) return { kind: 'guard' };
  return best;
}

function priority(side, action) {
  if (action.kind === 'switch') return 3;
  if (action.kind === 'guard') return 2;
  return active(side).moves[action.index].priority;
}

const cloneSide = side => ({ ...side, team: side.team.map(member => ({ ...member })) });

export function resolveTurn(state, action) {
  if (state.winner || !action) return { result: state, frames: [] };
  const current = active(state.player);
  if (current.health === 0) return { result: state, frames: [] };
  if (action.kind === 'attack' && (!current.moves[action.index] || !available(current, current.moves[action.index]))) return { result: state, frames: [] };
  if (action.kind === 'switch' && !state.player.team.some((member, index) => index === action.index && viable(member, index, state.player))) return { result: state, frames: [] };
  if (!['guard', 'attack', 'switch'].includes(action.kind)) return { result: state, frames: [] };

  const player = cloneSide(state.player);
  const bot = cloneSide(state.bot);
  const rivalAction = botAction(bot, player);
  const playerPriority = priority(player, action);
  const botPriority = priority(bot, rivalAction);
  const playerFirst = playerPriority > botPriority ||
    (playerPriority === botPriority && active(player).speed >= active(bot).speed);
  const steps = [[player, bot, action], [bot, player, rivalAction]];
  const guarding = new Set();
  const messages = [];
  const frames = [];
  function record(event, message, duration = 1000) {
    frames.push({
      player: cloneSide(player),
      bot: cloneSide(bot),
      round: state.round,
      winner: null,
      history: messages.length ? [...state.history, { round: state.round, messages: [...messages] }] : state.history,
      event: { ...event, message },
      duration,
    });
  }

  for (const [side, opponent, choice] of playerFirst ? steps : steps.reverse()) {
    const member = active(side);
    const target = active(opponent);
    if (!member.health) continue;
    const actor = side === player ? 'player' : 'bot';
    const targetSide = side === player ? 'bot' : 'player';
    if (choice.kind === 'switch') {
      side.active = choice.index;
      messages.push(`${side === player ? 'You' : 'Rival AI'} sent in ${active(side).name}.`);
      record({ kind: 'switch', actor }, messages[messages.length - 1]);
    } else if (choice.kind === 'guard') {
      const gained = Math.min(2, MAX_ENERGY - member.energy);
      member.energy += gained;
      guarding.add(side);
      messages.push(`${member.name} braced and recovered ${gained} energy.`);
      record({ kind: 'guard', actor }, messages[messages.length - 1]);
    } else {
      const move = member.moves[choice.index];
      record({ kind: 'prepare', actor, target: targetSide, type: move.type }, `${member.name} is using ${move.name}…`, 700);
      member.energy = Math.min(MAX_ENERGY, member.energy + move.energy);
      const blocked = guarding.has(opponent);
      const hit = Math.round(damage(member, target, move) * (blocked ? GUARD_FACTOR : 1));
      target.health = Math.max(0, target.health - hit);
      const factor = effectiveness(move.type, target.types);
      const effect = factor === 0 ? ' Immune.' : factor > 1 ? ' Super effective!' : factor < 1 ? ' Resisted.' : '';
      messages.push(`${member.name} used ${move.name} · ${hit} damage.${effect}${blocked ? ' Guard reduced the hit.' : ''}`);
      record({ kind: 'attack', actor, target: targetSide, type: move.type, hit, blocked }, messages[messages.length - 1], 1100);
      if (!target.health) {
        messages.push(`${target.name} fainted.`);
        record({ kind: 'faint', actor: targetSide }, messages[messages.length - 1]);
      }
    }
  }

  let winner = null;
  if (player.team.every(member => !member.health)) winner = 'bot';
  if (bot.team.every(member => !member.health)) winner = 'player';
  if (!winner && !active(bot).health) {
    bot.active = pickReplacement(bot, active(player));
    messages.push(`Rival AI sent in ${active(bot).name}.`);
    record({ kind: 'switch', actor: 'bot' }, messages[messages.length - 1]);
  }
  return {
    result: {
      player, bot, winner, round: state.round + 1,
      history: [...state.history, { round: state.round, messages }],
    },
    frames,
  };
}

export function playTurn(state, action) {
  return resolveTurn(state, action).result;
}

export function reinforce(state, index) {
  if (state.winner || active(state.player).health > 0 ||
    !state.player.team.some((member, position) => position === index && viable(member, position, state.player))) return state;
  return {
    ...state,
    player: { ...state.player, active: index },
    history: [...state.history, { round: 0, messages: [`You sent in ${state.player.team[index].name}.`] }],
  };
}
