// Itens de navegação principais. Novas telas da fase entram aqui.
export interface NavItem {
  to: string
  label: string
  icon: string
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Agenda', icon: '▦' },
  { to: '/membros', label: 'Equipe', icon: '◉' },
]
