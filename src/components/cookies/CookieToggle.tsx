// src/components/cookies/CookieToggle.tsx

interface CookieToggleProps {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function CookieToggle({
  checked,
  disabled = false,
  onChange,
  label,
}: CookieToggleProps) {
  const id = `cookie-toggle-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <label className="cookie-toggle" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className="cookie-toggle__input"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={`${disabled ? 'Sempre attivo: ' : ''}${label}`}
      />
      <span className="cookie-toggle__slider" />
    </label>
  );
}