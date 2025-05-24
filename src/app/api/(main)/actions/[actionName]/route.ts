import { NextResponse } from 'next/server';
import { getAction, deleteAction } from '@/app/api/lib/actionStore';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ actionName: string }> }
) {
  const { actionName } = await params;

  const action = await getAction(actionName);

  if (!action) {
    return NextResponse.json(
      { error: `Action '${actionName}' not found` },
      { status: 404 }
    );
  }

  return NextResponse.json(action);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ actionName: string }> }
) {
  try {
    const { actionName } = await params;

    const action = await getAction(actionName);
    if (!action) {
      return NextResponse.json(
        { error: `Action '${actionName}' not found` },
        { status: 404 }
      );
    }

    await deleteAction(actionName);

    return NextResponse.json({
      message: `Action '${actionName}' deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting action:', error);
    return NextResponse.json(
      { error: 'Failed to delete action' },
      { status: 500 }
    );
  }
}
