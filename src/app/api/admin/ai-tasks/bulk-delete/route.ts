import { NextRequest, NextResponse } from 'next/server';
import { getUserInfo } from '@/shared/models/user';
import { hasPermission } from '@/shared/services/rbac';
import { PERMISSIONS } from '@/core/rbac';
import { deleteAITasks } from '@/shared/models/ai_task';

export async function POST(req: NextRequest) {
  const user = await getUserInfo();
  if (!user) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const allowed = await hasPermission(user.id, PERMISSIONS.AITASKS_WRITE);
  if (!allowed) {
    return NextResponse.json({ code: 403, message: 'Permission denied' }, { status: 403 });
  }

  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ code: 400, message: 'ids required' }, { status: 400 });
  }

  const deleted = await deleteAITasks(ids);

  return NextResponse.json({ code: 0, message: `Deleted ${deleted} task(s)` });
}
