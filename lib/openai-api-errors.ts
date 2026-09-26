export type OpenAIFailureKind = 'temporary_rate_limit' | 'usage_limit' | 'other_429' | 'authentication' | 'permission' | 'model_unavailable' | 'other';

export type OpenAIErrorDetails = {
  message: string;
  type?: string;
  code?: string | null;
  status?: number;
};

const usageLimitPattern = /insufficient_quota|credit_balance_exhausted|organization_usage_limit_exceeded|organization_spend_limit_exceeded|project_spend_limit_exceeded|usage_limit|spend_limit|quota|credit.{0,12}exhaust/i;
const temporaryLimitPattern = /rate_limit_exceeded|rate.?limit|too many requests/i;

export function classifyOpenAIFailure(error: OpenAIErrorDetails): OpenAIFailureKind {
  const signal = `${error.code || ''} ${error.type || ''} ${error.message || ''}`;
  if (error.status === 429) {
    if (usageLimitPattern.test(signal)) return 'usage_limit';
    if (temporaryLimitPattern.test(signal)) return 'temporary_rate_limit';
    return 'other_429';
  }
  if (error.status === 401) return 'authentication';
  if (error.status === 403) return 'permission';
  if (error.status === 404) return 'model_unavailable';
  return 'other';
}

export function openAIUserMessage(kind: OpenAIFailureKind): string {
  switch (kind) {
    case 'temporary_rate_limit': return 'Too many requests right now. Please wait a moment and try again.';
    case 'usage_limit': return 'AI recipe generation has reached its API usage limit. Check the OpenAI API billing/usage settings.';
    case 'other_429': return 'OpenAI could not process this request (HTTP 429). Check the API project’s usage limits and try again.';
    case 'authentication': return 'Recipe generation could not authenticate with OpenAI. Check the server-side API key configuration.';
    case 'permission': return 'The OpenAI API project does not have access to this request. Check project permissions and model access.';
    case 'model_unavailable': return 'The configured OpenAI model is unavailable. Check OPENAI_MODEL and the API project’s model access.';
    default: return 'OpenAI could not generate this recipe. Check the API project status and try again.';
  }
}

export function retryAfterMilliseconds(value: string | null, now = Date.now()): number | null {
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, 8_000);
  const date = Date.parse(value);
  if (!Number.isFinite(date)) return null;
  return Math.min(Math.max(0, date - now), 8_000);
}
