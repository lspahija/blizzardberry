import { supabaseClient } from '@/app/api/lib/store/supabase';

export function getChatbot(chatbotId: string) {
  return supabaseClient
    .from('chatbots')
    .select('id, created_by')
    .eq('id', chatbotId)
    .single();
}

export function getChatbotByUserId(chatbotId: string, userId: string) {
  return supabaseClient
    .from('chatbots')
    .select('id, name, website_domain, created_by, created_at')
    .eq('id', chatbotId)
    .eq('created_by', userId)
    .single();
}

export function getChatbots(userId: string) {
  return supabaseClient
    .from('chatbots')
    .select('id, name, website_domain, created_by, created_at')
    .eq('created_by', userId);
}

export function createChatbot(
  name: string,
  websiteDomain: string,
  userId: string
) {
  return supabaseClient
    .from('chatbots')
    .insert({
      name,
      website_domain: websiteDomain,
      created_by: userId,
    })
    .select('id')
    .single();
}

export function deleteChatbot(chatbotId: string) {
  return supabaseClient.from('chatbots').delete().eq('id', chatbotId);
}
