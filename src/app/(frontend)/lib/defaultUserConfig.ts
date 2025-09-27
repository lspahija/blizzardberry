export type AgentUserConfig = {
  user_id: string;
  account_number: string;
  user_metadata: {
    name: string;
    email: string;
    company: string;
  };
};

export const DEFAULT_AGENT_USER_CONFIG: AgentUserConfig = {
  user_id: 'user_123',
  account_number: 'ACC123456',
  user_metadata: {
    name: 'John Doe',
    email: 'user@example.com',
    company: 'company name',
  },
};


