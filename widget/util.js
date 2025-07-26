let counter = 0;
export const generateId = (agentId) => `${agentId}-${Date.now()}-${counter++}`;
