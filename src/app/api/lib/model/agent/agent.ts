export const AGENT_MODELS = {
  'google/gemini-2.0-flash-001': 'Gemini 2.0 Flash',
  'google/gemini-2.5-flash': 'Gemini 2.5 Flash',
  'google/gemini-2.5-pro': 'Gemini 2.5 Pro',
  'openai/gpt-4o-mini': 'OpenAI GPT 4o Mini',
  'openai/gpt-4o': 'OpenAI GPT 4o',
  'openai/gpt-4.1-nano': 'OpenAI GPT 4.1 Nano',
  'openai/gpt-4.1-mini': 'OpenAI GPT 4.1 Mini',
  'openai/gpt-4.1': 'OpenAI GPT 4.1',
  'openai/o4-mini': 'OpenAI o4-mini',
  'openai/o4-mini-high': 'OpenAI o4-mini-high',
  'anthropic/claude-3.7-sonnet': 'Claude 3.7 Sonnet',
  'anthropic/claude-sonnet-4': 'Claude Sonnet 4',
  'anthropic/claude-opus-4': 'Claude Opus 4',
  'x-ai/grok-3-mini': 'Grok 3 Mini',
  'x-ai/grok-3': 'Grok 3',
  'x-ai/grok-3-beta': 'Grok 3 Beta',
  'meta-llama/llama-4-maverick': 'Llama 4 Maverick',
  'meta-llama/llama-4-scout': 'Llama 4 Scout',
  'deepseek/deepseek-chat': 'DeepSeek V3',
  'deepseek/deepseek-r1-0528': 'DeepSeek R1',
  'qwen/qwen3-30b-a3b': 'Qwen 3 30B A3B',
  'moonshotai/kimi-k2': 'Kimi K2',
} as const;

export type AgentModel = keyof typeof AGENT_MODELS;

export interface Agent {
  id: string;
  name: string;
  websiteDomain: string;
  model: AgentModel;
  createdBy: string;
  createdAt: string;
}
