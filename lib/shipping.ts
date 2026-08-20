export type ShippingEstimate = {
  cost: number
  estimatedDays: string
}

// Estimativa por região enquanto não há contrato com os Correios (API oficial exige
// cartão de postagem + credenciais). Trocar por integração real quando disponível.
const NEARBY_STATES = ['RJ', 'MG', 'ES', 'PR', 'SC', 'RS']

export function estimateShipping(state: string): ShippingEstimate {
  const uf = state.trim().toUpperCase()

  if (uf === 'SP') return { cost: 14.9, estimatedDays: '2 a 3 dias úteis' }
  if (NEARBY_STATES.includes(uf)) return { cost: 22.9, estimatedDays: '3 a 5 dias úteis' }
  return { cost: 34.9, estimatedDays: '5 a 9 dias úteis' }
}
