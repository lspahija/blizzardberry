import { callAIModel } from '@/app/api/lib/llm';

export async function POST(req: Request) {
  const { messages, userConfig, chatbotId } = await req.json();

  return Response.json(await callAIModel(messages, userConfig, chatbotId));
}
