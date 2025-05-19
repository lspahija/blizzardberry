import {NextResponse} from 'next/server';
import {Action, BackendAction, ExecutionContext, FrontendAction} from '@/app/api/(main)/lib/dataModel';
import {createAction} from "@/app/api/(main)/lib/actionStore";

function isBackendAction(action: any): action is BackendAction {
    return (
        action &&
        action.executionContext === ExecutionContext.SERVER &&
        action.executionModel &&
        'request' in action.executionModel &&
        action.executionModel.request &&
        typeof action.executionModel.request.url === 'string' &&
        typeof action.executionModel.request.method === 'string'
    );
}

function isFrontendAction(action: any): action is FrontendAction {
    return (
        action &&
        action.executionContext === ExecutionContext.CLIENT &&
        action.executionModel &&
        'functionName' in action.executionModel &&
        typeof action.executionModel.functionName === 'string'
    );
}

export async function POST(req: Request) {
    try {
        const action = await req.json();

        if (!isBackendAction(action) && !isFrontendAction(action)) {
            return NextResponse.json(
                { error: 'Invalid action: does not match BackendAction or FrontendAction structure' },
                { status: 400 }
            );
        }
        
        const typedAction: Action = action;

        console.log('Received action:', JSON.stringify(typedAction, null, 2));

        await createAction(
            typedAction.name, 
            typedAction.description, 
            typedAction.executionContext, 
            typedAction.executionModel
        );

        return NextResponse.json({ actionName: typedAction.name }, { status: 201 });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            { error: 'Failed to process action' },
            { status: 500 }
        );
    }
}
