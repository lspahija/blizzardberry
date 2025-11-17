// Calendly integration tools for AI agents
// These tools allow agents to interact with Calendly API to check availability and book meetings

import { tool, Tool } from 'ai';
import { z } from 'zod';
import { getAgent } from '../store/agentStore';

/**
 * Helper function to get Calendly access token from agent configuration
 * Returns the token if Calendly is enabled and configured, null otherwise
 */
async function getCalendlyToken(agentId: string): Promise<string | null> {
  const agent = await getAgent(agentId);
  if (!agent?.calendly_config) {
    return null;
  }

  // Handle JSONB - it might be a string or already parsed object
  const calendlyConfig = typeof agent.calendly_config === 'string'
    ? JSON.parse(agent.calendly_config)
    : agent.calendly_config;

  if (!calendlyConfig?.enabled || !calendlyConfig.access_token) {
    return null;
  }

  return calendlyConfig.access_token;
}

/**
 * Helper function to make API calls to Calendly
 * Handles authentication and error responses
 */
async function callCalendlyAPI(
  token: string,
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<any> {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(`https://api.calendly.com${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Calendly API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Tool to check available time slots for a Calendly event type
 * Requires event type URI and time range
 */
export function createCalendlyAvailabilityTool(agentId: string): Tool {
  return tool({
    description:
      'Check available time slots for Calendly scheduling. ONLY use this if user EXPLICITLY asks "when are you available" or "show me available times" WITHOUT providing a timezone AND WITHOUT wanting to book immediately. CRITICAL: If user provides ANY timezone (city name, timezone abbreviation, etc.), DO NOT use this tool - use book_calendly_meeting instead. Use this after calling list_calendly_event_types to get the event type URI. Convert natural language dates (e.g., "next week", "Monday to Friday", "9am ET") to ISO 8601 format before calling. If user doesn\'t specify an event type, use the first one from list_calendly_event_types.',
    inputSchema: z.object({
      eventTypeUri: z
        .string()
        .describe(
          'The URI of the Calendly event type. Get this from list_calendly_event_types tool. Example: "https://api.calendly.com/event_types/ABC123"'
        ),
      startTime: z
        .string()
        .describe(
          'ISO 8601 formatted start time in UTC (e.g., "2025-11-18T13:00:00Z"). Convert user-specified times to UTC, accounting for time zones like ET, PT, etc.'
        ),
      endTime: z
        .string()
        .describe(
          'ISO 8601 formatted end time in UTC (e.g., "2025-11-22T23:00:00Z"). Convert user-specified times to UTC, accounting for time zones like ET, PT, etc.'
        ),
    }),
    execute: async ({ eventTypeUri, startTime, endTime }) => {
      const token = await getCalendlyToken(agentId);
      if (!token) {
        return {
          error:
            'Calendly integration not configured or enabled for this agent.',
        };
      }

      try {
        const response = await callCalendlyAPI(
          token,
          `/event_type_available_times?event_type=${encodeURIComponent(eventTypeUri)}&start_time=${encodeURIComponent(startTime)}&end_time=${encodeURIComponent(endTime)}`
        );

        // Return available times in UTC ISO 8601 format
        return {
          available_times: response.collection.map((item: any) => ({
            start_time: item.start_time, // UTC ISO 8601 format
            end_time: item.end_time, // UTC ISO 8601 format
          })),
          note: 'Times are in UTC. Convert to user timezone when displaying.',
        };
      } catch (error: any) {
        console.error('Error checking Calendly availability:', error);
        return {
          error: `Failed to check Calendly availability: ${error.message}`,
        };
      }
    },
  });
}

/**
 * Tool to generate Calendly embed widget for booking meetings
 * Uses Calendly embed widget (works on free plan) instead of Scheduling API
 * Requires event type URI and invitee information for pre-population
 */
export function createCalendlyBookingTool(agentId: string): Tool {
  return tool({
    description:
      'MANDATORY: This is the ONLY way to allow users to book meetings. You MUST call this tool IMMEDIATELY when user asks about booking, scheduling, or availability (e.g., "book a meeting", "schedule", "when are you available", "I want to book"). DO NOT ask for timezone - use userConfig.timezone which is automatically detected from browser. DO NOT call list_calendly_event_types first. DO NOT call check_calendly_availability. DO NOT show availability times. Just call this tool immediately with inviteeName and inviteeEmail from userConfig.user_metadata. eventTypeUri and schedulingUrl are OPTIONAL - the tool will fetch them automatically if not provided. This tool creates an inline widget that shows all available times. The widget opens AUTOMATICALLY. DO NOT generate markdown links - that is FORBIDDEN.',
    inputSchema: z.object({
      eventTypeUri: z
        .string()
        .optional()
        .describe(
          'The URI of the Calendly event type to book. Optional - if not provided, will automatically fetch the first available event type. Example: "https://api.calendly.com/event_types/ABC123"'
        ),
      schedulingUrl: z
        .string()
        .optional()
        .describe(
          'The scheduling URL (e.g., "https://calendly.com/username/event-type-slug"). Optional - if not provided, will automatically fetch it from event types API.'
        ),
      inviteeName: z.string().describe('The name of the person booking the meeting. Extract from conversation or use user metadata if available.'),
      inviteeEmail: z.string().email().describe('The email of the person booking the meeting. Extract from conversation or use user metadata if available.'),
      date: z
        .string()
        .optional()
        .describe(
          'The date for the meeting in YYYY-MM-DD format (e.g., "2025-11-17"). Use this if the user specified a specific date. This will pre-select the date in the Calendly widget.'
        ),
      time: z
        .string()
        .optional()
        .describe(
          'The time for the meeting in HH:MM format in UTC (e.g., "18:00" for 6 PM UTC). Use this if the user specified a specific time. This will help pre-select the time slot in the Calendly widget. Convert from user timezone to UTC before using.'
        ),
    }),
    execute: async ({ eventTypeUri, schedulingUrl, inviteeName, inviteeEmail, date, time }) => {
      const agent = await getAgent(agentId);
      if (!agent?.calendly_config) {
        return {
          error:
            'Calendly integration not configured or enabled for this agent.',
        };
      }

      try {
        const token = await getCalendlyToken(agentId);
        if (!token) {
          return {
            error: 'Calendly token not available.',
          };
        }

        // Handle JSONB - it might be a string or already parsed object
        const calendlyConfig = typeof agent.calendly_config === 'string' 
          ? JSON.parse(agent.calendly_config) 
          : agent.calendly_config;

        // If eventTypeUri or schedulingUrl not provided, get them from API
        let finalEventTypeUri = eventTypeUri;
        let embedUrl = schedulingUrl;
        
        if (!finalEventTypeUri || !embedUrl) {
          // Fetch event types to get the first one
          try {
            const eventTypesResponse = await callCalendlyAPI(
              token,
              `/event_types?user=${encodeURIComponent(calendlyConfig.user_uri)}`
            );
            
            if (eventTypesResponse.collection && eventTypesResponse.collection.length > 0) {
              const firstEventType = eventTypesResponse.collection[0];
              finalEventTypeUri = finalEventTypeUri || firstEventType.uri;
              embedUrl = embedUrl || firstEventType.scheduling_url || null;
            }
          } catch (e) {
            console.error('Could not fetch event types:', e);
          }
        }

        // If still no scheduling URL, try to get it from event type URI
        if (!embedUrl && finalEventTypeUri) {
          try {
            const eventTypePath = finalEventTypeUri.replace('https://api.calendly.com', '');
            const eventTypeResponse = await callCalendlyAPI(token, eventTypePath);
            embedUrl = eventTypeResponse.resource?.scheduling_url || null;
          } catch (e) {
            console.error('Could not fetch event type details:', e);
          }
        }

        // Validate that we have a valid scheduling URL
        if (!embedUrl) {
          return {
            error: 'Could not determine Calendly scheduling URL. Please ensure the event type exists.',
          };
        }

        // Validate URL format
        try {
          const urlObj = new URL(embedUrl);
          
          // Build embed URL with pre-populated invitee information
          urlObj.searchParams.set('name', inviteeName);
          urlObj.searchParams.set('email', inviteeEmail);
          
          // Add date if provided (pre-selects the date in Calendly widget)
          if (date) {
            urlObj.searchParams.set('date', date);
          }
          
          // Add time if provided (Calendly uses this to help pre-select time slot)
          if (time) {
            urlObj.searchParams.set('time', time);
          }

          const finalEmbedUrl = urlObj.toString();

          // Return embed data for widget to render
          return {
            type: 'calendly_embed',
            embed_url: finalEmbedUrl,
          };
        } catch (urlError: any) {
          console.error('Invalid Calendly scheduling URL format:', urlError);
          return {
            error: `Invalid Calendly scheduling URL format. Please check the event type configuration.`,
          };
        }
      } catch (error: any) {
        console.error('Error generating Calendly embed:', error);
        return {
          error: `Failed to generate Calendly embed: ${error.message}`,
        };
      }
    },
  });
}

/**
 * Tool to list available Calendly event types for the configured user
 * Uses the agent's user_uri from configuration
 */
export function createCalendlyEventTypesTool(agentId: string): Tool {
  return tool({
    description:
      'Get a list of available Calendly event types for the configured user. ONLY call this if you need eventTypeUri and schedulingUrl for book_calendly_meeting tool and you don\'t have them from earlier in the conversation. DO NOT call this when user provides timezone - just call book_calendly_meeting directly (it will handle getting event types internally if needed). Returns event types with their names, URIs, durations, and types.',
    inputSchema: z.object({}), // No specific inputs needed, uses agent's user_uri
    execute: async () => {
      const agent = await getAgent(agentId);
      const token = await getCalendlyToken(agentId);

      if (!agent?.calendly_config) {
        return {
          error:
            'Calendly integration not fully configured (missing token or user URI).',
        };
      }

      // Handle JSONB - it might be a string or already parsed object
      const calendlyConfig = typeof agent.calendly_config === 'string' 
        ? JSON.parse(agent.calendly_config) 
        : agent.calendly_config;

      if (!token || !calendlyConfig?.user_uri) {
        return {
          error:
            'Calendly integration not fully configured (missing token or user URI).',
        };
      }

      try {
        const response = await callCalendlyAPI(
          token,
          `/event_types?user=${encodeURIComponent(calendlyConfig.user_uri)}`
        );

        const eventTypes = response.collection.map((item: any) => ({
          name: item.name,
          uri: item.uri,
          duration: item.duration,
          kind: item.kind,
          scheduling_url: item.scheduling_url || null,
        }));

        // If there's a default event type in config, mark it
        const defaultEventTypeUri = calendlyConfig.default_event_type_uri;
        if (defaultEventTypeUri) {
          const defaultType = eventTypes.find((et: any) => et.uri === defaultEventTypeUri);
          if (defaultType) {
            return {
              event_types: eventTypes,
              default_event_type: defaultType,
              note: 'Use the default_event_type if user doesn\'t specify which event type to use.',
            };
          }
        }

        return {
          event_types: eventTypes,
          note: eventTypes.length > 0 
            ? 'Use the first event type if user doesn\'t specify which one to use.'
            : 'No event types available.',
        };
      } catch (error: any) {
        console.error('Error listing Calendly event types:', error);
        return {
          error: `Failed to list Calendly event types: ${error.message}`,
        };
      }
    },
  });
}


