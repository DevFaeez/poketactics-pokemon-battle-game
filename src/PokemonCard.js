import React from 'react';

export const number = id => `#${String(id).padStart(3, '0')}`;

export function TypeTags({ types: tags }) {
  return <span className="type-tags">{tags.map(type => <span className="type-tag" data-type={type} key={type}>{type}</span>)}</span>;
}

export function PokemonCard({ pokemon, selected, disabled, onSelect, selectable = true }) {
  return (
    <button type="button" className={`pokemon-card${selected ? ' is-picked' : ''}`}
      data-type={pokemon.types[0]} disabled={disabled} onClick={onSelect}
      aria-pressed={selectable ? selected : undefined}
      aria-label={selectable ? `${selected ? 'Remove' : 'Add'} ${pokemon.name}` : `View ${pokemon.name} details`}>
      <span className="card-top"><span>{number(pokemon.id)}</span><span className="card-action" aria-hidden="true">{selectable ? (selected ? '✓' : '+') : '↗'}</span></span>
      <span className="card-art"><img src={pokemon.image} alt="" loading="lazy" decoding="async" /></span>
      <span className="card-name">{pokemon.name}</span>
      <TypeTags types={pokemon.types} />
    </button>
  );
}
