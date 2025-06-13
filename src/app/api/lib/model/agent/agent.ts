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
  GEMINI_2_5_PRO = 'google/gemini-2.5-pro-preview',
  CHATGPT_4_1 = 'openai/gpt-4.1',
  CHATGPT_4O = 'openai/chatgpt-4o-latest',
  CLAUDE_SONNET_4 = 'anthropic/claude-sonnet-4',
  GROK_3_BETA = 'x-ai/grok-3-beta',
  DEEPSEEK_R1 = 'deepseek/deepseek-r1-distill-qwen-7b',
  QWEN_3_30B = 'qwen/qwen3-30b-a3b',
}

export const AgentModelDisplay: Record<AgentModel, string> = {
  [AgentModel.GEMINI_2_0_FLASH]: 'Gemini 2.0 Flash',
  [AgentModel.GEMINI_2_5_PRO]: 'Gemini 2.5 Pro Preview',
  [AgentModel.CHATGPT_4_1]: 'ChatGPT 4.1',
  [AgentModel.CHATGPT_4O]: 'ChatGPT 4o',
  [AgentModel.CLAUDE_SONNET_4]: 'Claude Sonnet 4',
  [AgentModel.GROK_3_BETA]: 'Grok 3 Beta',
  [AgentModel.DEEPSEEK_R1]: 'DeepSeek R1 Distill Qwen 7B',
  [AgentModel.QWEN_3_30B]: 'Qwen 3 30B A3B',
};

export const AgentModelList = Object.values(AgentModel);
