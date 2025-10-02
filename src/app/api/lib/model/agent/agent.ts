export const AGENT_MODELS = {
  'google/gemini-2.5-pro': 'Gemini 2.5 Pro',
  'google/gemini-2.5-flash': 'Gemini 2.5 Flash',
  'google/gemini-2.0-flash-001': 'Gemini 2.0 Flash',
  'openai/gpt-5': 'OpenAI GPT 5',
  'openai/gpt-5-mini': 'OpenAI GPT 5 Mini',
  'openai/gpt-5-nano': 'OpenAI GPT 5 Nano',
  'openai/gpt-4o': 'OpenAI GPT 4o',
  'openai/gpt-4o-mini': 'OpenAI GPT 4o Mini',
  'openai/gpt-4.1': 'OpenAI GPT 4.1',
  'openai/gpt-4.1-mini': 'OpenAI GPT 4.1 Mini',
  'openai/gpt-4.1-nano': 'OpenAI GPT 4.1 Nano',
  'openai/o4-mini-high': 'OpenAI o4-mini-high',
  'openai/o4-mini': 'OpenAI o4-mini',
  'anthropic/claude-opus-4': 'Claude Opus 4',
  'anthropic/claude-sonnet-4.5': 'Claude Sonnet 4.5',
  'anthropic/claude-sonnet-4': 'Claude Sonnet 4',
  'anthropic/claude-3.7-sonnet': 'Claude 3.7 Sonnet',
  'x-ai/grok-code-fast-1': 'Grok Code Fast 1',
  'x-ai/grok-4': 'Grok 4',
  'x-ai/grok-3': 'Grok 3',
  'x-ai/grok-3-mini': 'Grok 3 Mini',
  'meta-llama/llama-4-maverick': 'Llama 4 Maverick',
  'meta-llama/llama-4-scout': 'Llama 4 Scout',
  'deepseek/deepseek-chat-v3.1': 'DeepSeek V3.1',
  'deepseek/deepseek-chat': 'DeepSeek V3',
  'deepseek/deepseek-r1-0528': 'DeepSeek R1',
  'qwen/qwen3-30b-a3b': 'Qwen 3 30B A3B',
  'moonshotai/kimi-k2': 'Kimi K2',
  'z-ai/glm-4.6': 'Z.AI GLM 4.6',
  'z-ai/glm-4.5-air': 'Z.AI GLM 4.5 Air',
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
