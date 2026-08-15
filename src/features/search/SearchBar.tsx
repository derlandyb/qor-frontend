import { Icon } from "../../components/icons/Icon";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

// Pure controlled input, no fetch — persistent, inline entry point atop the Feed (SEARCH-008/009).
export function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  return (
    <div className="search-bar">
      <Icon name="search" className="search-bar__icon" />
      <input
        name="search"
        type="search"
        className="search-bar__input"
        placeholder="O que você quer ouvir?"
        aria-label="Buscar eventos"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value !== "" && (
        <button
          type="button"
          className="search-bar__clear"
          aria-label="Limpar busca"
          onClick={onClear}
        >
          ×
        </button>
      )}
    </div>
  );
}
