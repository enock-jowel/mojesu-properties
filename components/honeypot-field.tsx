/** Hidden honeypot — leave empty; bots that autofill get fake-success from APIs. */
export function HoneypotField() {
  return (
    <div
      aria-hidden="true"
      className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
      tabIndex={-1}
    >
      <label htmlFor="hp_field">Company website</label>
      <input
        id="hp_field"
        name="hp_field"
        type="text"
        autoComplete="off"
        tabIndex={-1}
      />
    </div>
  )
}

export function honeypotValueFromForm(form: HTMLFormElement): string {
  const el = form.elements.namedItem('hp_field')
  if (el && el instanceof HTMLInputElement) return el.value
  return ''
}
