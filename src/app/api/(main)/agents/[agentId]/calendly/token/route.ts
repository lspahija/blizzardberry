// Calendly Personal Access Token endpoint
// Validates and saves Personal Access Token for an agent

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { agentAuth } from '@/app/api/lib/auth/agentAuth';
import { getAgent, updateAgent } from '@/app/api/lib/store/agentStore';

/**
 * Helper function to validate Personal Access Token and get user info
 */
async function validateCalendlyToken(accessToken: string): Promise<{ uri: string; name: string; email: string }> {
  const response = await fetch('https://api.calendly.com/users/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Invalid Calendly token: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return {
    uri: data.resource.uri,
    name: data.resource.name,
    email: data.resource.email,
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId } = await params;
    
    // Verify user owns this agent
    const authResponse = await agentAuth(session.user.id, agentId);
    if (authResponse) return authResponse;

    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string' || token.trim() === '') {
      return NextResponse.json(
        { error: 'Personal Access Token is required' },
        { status: 400 }
      );
    }

    // Validate token by fetching user info
    const userInfo = await validateCalendlyToken(token.trim());

    // Get current agent to preserve existing config
    const agent = await getAgent(agentId);
    
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Update Calendly configuration
    const existingConfig = agent.calendly_config 
      ? (typeof agent.calendly_config === 'string' 
          ? JSON.parse(agent.calendly_config) 
          : agent.calendly_config)
      : {};

    const updatedConfig = {
      ...existingConfig,
      enabled: true,
      access_token: token.trim(),
      user_uri: userInfo.uri,
      user_name: userInfo.name,
      user_email: userInfo.email,
    };

    await updateAgent(agentId, {
      calendly_config: updatedConfig,
    });

    return NextResponse.json({
      success: true,
      message: 'Calendly token saved successfully',
      userInfo: {
        name: userInfo.name,
        email: userInfo.email,
      },
    });
  } catch (error: any) {
    console.error('Error saving Calendly token:', error);
    
    if (error.message?.includes('Invalid Calendly token')) {
      return NextResponse.json(
        { error: 'Invalid token. Please check your Personal Access Token and try again.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to save Calendly token' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId } = await params;
    
    // Verify user owns this agent
    const authResponse = await agentAuth(session.user.id, agentId);
    if (authResponse) return authResponse;

    // Get current agent to preserve other config
    const agent = await getAgent(agentId);
    
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Remove Calendly configuration
    const existingConfig = agent.calendly_config 
      ? (typeof agent.calendly_config === 'string' 
          ? JSON.parse(agent.calendly_config) 
          : agent.calendly_config)
      : {};

    const updatedConfig = {
      ...existingConfig,
      enabled: false,
      access_token: null,
      user_uri: null,
      user_name: null,
      user_email: null,
    };

    await updateAgent(agentId, {
      calendly_config: updatedConfig,
    });

    return NextResponse.json({
      success: true,
      message: 'Calendly disconnected successfully',
    });
  } catch (error: any) {
    console.error('Error disconnecting Calendly:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Calendly' },
      { status: 500 }
    );
  }
}

