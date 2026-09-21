export function phoneHref(phoneTel: string): string {
  const digits = phoneTel.replace(/\D/g, '')
  return digits ? `tel:+${digits}` : 'tel:'
}
