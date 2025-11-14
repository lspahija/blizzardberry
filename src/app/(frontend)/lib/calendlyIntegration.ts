import {
  Action,
  ExecutionContext,
  Parameter,
  ParameterType,
} from '@/app/api/lib/model/action/baseAction';
import {
  BackendModel,
  HttpMethod,
} from '@/app/api/lib/model/action/backendAction';

export interface CalendlyAction {
  name: string;
  description: string;
  url: string;
  method: HttpMethod;
  parameters: Parameter[];
  bodyTemplate?: string;
}

export const calendlyActions: CalendlyAction[] = [
  {
    name: 'Get Availability',
    description:
      'Retrieve available time slots for a Calendly event type within a specified date range',
    url: 'https://api.calendly.com/event_type_available_times?event_type={{eventTypeUri}}&start_time={{startTime}}&end_time={{endTime}}',
    method: 'GET',
    parameters: [
      {
        name: 'eventTypeUri',
        description:
          'The URI of the event type to check availability for (e.g., https://api.calendly.com/event_types/AAAAAAAAAAAAAAAA)',
        type: ParameterType.String,
        isArray: false,
      },
      {
        name: 'startTime',
        description:
          'Start time in ISO 8601 format (e.g., 2025-01-15T00:00:00Z). Must be in the future.',
        type: ParameterType.String,
        isArray: false,
      },
      {
        name: 'endTime',
        description:
          'End time in ISO 8601 format (e.g., 2025-01-16T00:00:00Z). Range cannot exceed 7 days.',
        type: ParameterType.String,
        isArray: false,
      },
    ],
  },
  {
    name: 'Create Scheduling Link',
    description:
      'Generate a single-use scheduling link for an invitee to book a meeting',
    url: 'https://api.calendly.com/scheduling_links',
    method: 'POST',
    parameters: [
      {
        name: 'eventTypeUri',
        description:
          'The URI of the event type for the scheduling link (e.g., https://api.calendly.com/event_types/AAAAAAAAAAAAAAAA)',
        type: ParameterType.String,
        isArray: false,
      },
      {
        name: 'maxEventCount',
        description:
          'Maximum number of events that can be scheduled using this link (default: 1)',
        type: ParameterType.Number,
        isArray: false,
      },
    ],
    bodyTemplate: JSON.stringify(
      {
        max_event_count: '{{maxEventCount}}',
        owner: '{{eventTypeUri}}',
        owner_type: 'EventType',
      },
      null,
      2
    ),
  },
];

export function createCalendlyActions(
  apiToken: string,
  agentId: string
): Action[] {
  return calendlyActions.map((template) => {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    };

    const model: BackendModel = {
      request: {
        url: template.url,
        method: template.method,
        headers,
        body: template.bodyTemplate,
      },
      parameters: template.parameters,
    };

    return {
      id: null,
      name: template.name,
      description: template.description,
      executionContext: ExecutionContext.SERVER,
      executionModel: model,
      agentId,
    };
  });
}
