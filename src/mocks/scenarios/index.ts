export const scenarios = ['default', 'empty', 'slow', 'variable-latency', 'out-of-order', 'network-error', 'server-error', 'favorite-error', 'session-expired', 'price-changed', 'sold-out', 'wallet-disconnected', 'wallet-declined', 'payment-declined', 'order-timeout'] as const
export type MockScenario = typeof scenarios[number]
export function selectScenario(scenario: MockScenario) { if (scenario === 'default') localStorage.removeItem('kurio_mock_scenario'); else localStorage.setItem('kurio_mock_scenario', scenario) }
