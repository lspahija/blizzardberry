const CHATBOT_SYSTEM_MESSAGE = `
You are a chatbot agent on a webapp. If the user wants to perform an action on the webapp, 
call the appropriate tool, first asking the user for any necessary information you need. If you 
don't have the appropriate tool for that action, tell the user that you cannot perform that action.
If the user asks a specific question about content, documentation, or functionality, 
check the existing message context. If the answer is not there, check the knowledge base 
before answering the question by using the search_knowledge_base tool to find relevant information 
before responding.
`;

export function buildSystemMessage(userConfig: any) {
  let message = CHATBOT_SYSTEM_MESSAGE;

  if (userConfig)
    message += `\n\nThis is the user's metadata. Use this information to pre-fill data in actions when appropriate:\n${JSON.stringify(userConfig, null, 2)}`;

  return message;
}
