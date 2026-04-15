export type LlmProvider = 'openai' | 'deepseek' | 'claude'

export interface AiSettings {
  provider: LlmProvider
  model: string
  apiKey: string
  useProjectKey: boolean
}

const SETTINGS_KEY = 'docusense:ai-settings'
const PROJECT_KEY_USED_AT_KEY = 'docusense:project-api:last-used-at'
const PROJECT_KEY_COOLDOWN_MS = 2 * 24 * 60 * 60 * 1000

const DEFAULT_SETTINGS: AiSettings = {
  provider: 'openai',  // Always default to OpenAI
  model: 'gpt-4o-mini',
  apiKey: '',  // Empty by default - uses project key
  useProjectKey: true,  // Default to project key for security
}

const DEFAULT_MODEL_BY_PROVIDER: Record<LlmProvider, string> = {
  openai: 'gpt-4o-mini',
  deepseek: 'deepseek-chat',
  claude: 'claude-3-5-sonnet-latest',
}

export function getDefaultModel(provider: LlmProvider) {
  return DEFAULT_MODEL_BY_PROVIDER[provider]
}

export function readAiSettings(): AiSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS

  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS

    const parsed = JSON.parse(raw) as Partial<AiSettings>
    const provider = parsed.provider ?? DEFAULT_SETTINGS.provider

    return {
      provider,
      model: parsed.model || getDefaultModel(provider),
      apiKey: parsed.apiKey ?? '',
      useProjectKey: Boolean(parsed.useProjectKey),
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function writeAiSettings(settings: AiSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  window.dispatchEvent(new Event('aisettingschange'))
}

export function getProjectKeyCooldownRemainingMs() {
  if (typeof window === 'undefined') return 0

  const lastUsedRaw = localStorage.getItem(PROJECT_KEY_USED_AT_KEY)
  if (!lastUsedRaw) return 0

  const lastUsedAt = Number(lastUsedRaw)
  if (!Number.isFinite(lastUsedAt)) return 0

  const elapsed = Date.now() - lastUsedAt
  return Math.max(0, PROJECT_KEY_COOLDOWN_MS - elapsed)
}

export function canUseProjectKey() {
  return getProjectKeyCooldownRemainingMs() === 0
}

export function markProjectKeyUsed() {
  localStorage.setItem(PROJECT_KEY_USED_AT_KEY, String(Date.now()))
  window.dispatchEvent(new Event('aisettingschange'))
}

export function formatCooldownRemaining(ms: number) {
  const hours = Math.ceil(ms / (60 * 60 * 1000))
  if (hours <= 1) return 'menos de 1 hora'
  return `${hours} horas`
}
