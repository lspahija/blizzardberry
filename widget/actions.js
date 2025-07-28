import { generateId } from './util';
import { state } from './state';
import { persistMessage } from './api';

export async function executeAction(actionModel, actions, baseUrl) {
  try {
    const actionResult = actionModel.toolName.startsWith('ACTION_CLIENT_')
      ? await executeClientAction(actionModel, actions)
      : await executeServerAction(actionModel);

    state.messages.push({
      id: generateId(),
      role: 'assistant',
      parts: [
        {
          type: 'text',
          text: `✅ ${actionModel.toolName.replace(/^ACTION_(CLIENT_|SERVER_)/, '') || actionModel.action || 'Action'} successfully executed.`,
        },
      ],
    });
    await persistMessage(baseUrl, state.messages[state.messages.length - 1]);

    return `ACTION_RESULT: ${JSON.stringify(actionResult)}`;
  } catch (error) {
    throw error;
  }
}

async function executeClientAction(actionModel, actions) {
  const functionName = actionModel.functionName.replace('ACTION_CLIENT_', '');
  const action = actions[functionName];
  return await action(actionModel.params);
}

async function executeServerAction(actionModel) {
  const response = await fetch(actionModel.url, {
    method: actionModel.method,
    headers: actionModel.headers,
    body: JSON.stringify(actionModel.body),
  });
  return await response.json();
}