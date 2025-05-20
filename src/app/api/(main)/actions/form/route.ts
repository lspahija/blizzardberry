import {NextResponse} from 'next/server';
import {Action, BackendAction, ExecutionContext, FrontendAction} from '@/app/api/(main)/lib/dataModel';
import {createAction} from "@/app/api/(main)/lib/actionStore";

export async function POST(req: Request) {
    try {
        const action = await req.json();
        
        let typedAction: Action;
        if (action.executionContext === ExecutionContext.SERVER) {
            typedAction = action as BackendAction;
        } else {
            typedAction = action as FrontendAction;
        }

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