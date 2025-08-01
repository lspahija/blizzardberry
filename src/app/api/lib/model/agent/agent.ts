export interface Agent {
  id: string;
  name: string;
  websiteDomain: string;
  model: AgentModel;
  createdBy: string;
  createdAt: string;
}

export enum AgentModel {
  GEMINI_2_0_FLASH = 'google/gemini-2.0-flash-001',
  GEMINI_2_5_PRO = 'google/gemini-2.5-pro',
  GPT_4O_MINI = 'openai/gpt-4o-mini',
  CHATGPT_4O = 'openai/gpt-4o',
  GPT_4_1_NANO = 'openai/gpt-4.1-nano',
  GPT_4_1_MINI = 'openai/gpt-4.1-mini',
  CHATGPT_4_1 = 'openai/gpt-4.1',
  O4_MINI = 'openai/o4-mini',
  O4_MINI_HIGH = 'openai/o4-mini-high',
  CLAUDE_3_7_SONNET = 'anthropic/claude-3.7-sonnet',
  CLAUDE_SONNET_4 = 'anthropic/claude-sonnet-4',
  CLAUDE_OPUS_4 = 'anthropic/claude-opus-4',
  GROK_3_MINI = 'x-ai/grok-3-mini',
  GROK_3 = 'x-ai/grok-3',
  GROK_3_BETA = 'x-ai/grok-3-beta',
  LLAMA_4_MAVERICK = 'meta-llama/llama-4-maverick',
  LLAMA_4_SCOUT = 'meta-llama/llama-4-scout',
  DEEPSEEK_V3 = 'deepseek/deepseek-chat',
  DEEPSEEK_R1 = 'deepseek/deepseek-r1-0528',
  QWEN_3_30B = 'qwen/qwen3-30b-a3b',
  KIMI_K2 = 'moonshotai/kimi-k2',
}

export const AgentModelDisplay: Record<AgentModel, string> = {
  [AgentModel.GEMINI_2_0_FLASH]: 'Gemini 2.0 Flash',
  [AgentModel.GEMINI_2_5_PRO]: 'Gemini 2.5 Pro',
  [AgentModel.GPT_4O_MINI]: 'OpenAI GPT 4o Mini',
  [AgentModel.CHATGPT_4O]: 'OpenAI GPT 4o',
  [AgentModel.GPT_4_1_NANO]: 'OpenAI GPT 4.1 Nano',
  [AgentModel.GPT_4_1_MINI]: 'OpenAI GPT 4.1 Mini',
  [AgentModel.CHATGPT_4_1]: 'OpenAI GPT 4.1',
  [AgentModel.O4_MINI]: 'OpenAI o4-mini',
  [AgentModel.O4_MINI_HIGH]: 'OpenAI o4-mini-high',
  [AgentModel.CLAUDE_3_7_SONNET]: 'Claude 3.7 Sonnet',
  [AgentModel.CLAUDE_SONNET_4]: 'Claude Sonnet 4',
  [AgentModel.CLAUDE_OPUS_4]: 'Claude Opus 4',
  [AgentModel.GROK_3_MINI]: 'Grok 3 Mini',
  [AgentModel.GROK_3]: 'Grok 3',
  [AgentModel.GROK_3_BETA]: 'Grok 3 Beta',
  [AgentModel.LLAMA_4_MAVERICK]: 'Llama 4 Maverick',
  [AgentModel.LLAMA_4_SCOUT]: 'Llama 4 Scout',
  [AgentModel.DEEPSEEK_V3]: 'DeepSeek V3',
  [AgentModel.DEEPSEEK_R1]: 'DeepSeek R1',
  [AgentModel.QWEN_3_30B]: 'Qwen 3 30B A3B',
  [AgentModel.KIMI_K2]: 'Kimi K2',
};

export const AgentModelList = Object.values(AgentModel);
