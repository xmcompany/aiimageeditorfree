import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getAuth } from '@/core/auth';
import { hasPermission } from '@/shared/services/rbac';
import { bulkToggleShowInGallery } from '@/shared/models/showcase';

export async function POST(req: NextRequest) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const adminAccess = await hasPermission(session.user.id, 'admin.access');
  if (!adminAccess) {
    return NextResponse.json({ code: 403, message: 'Forbidden' }, { status: 403 });
  }

  const { ids, show }: { ids: string[]; show: boolean } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ code: 400, message: 'ids required' }, { status: 400 });
  }

  const count = await bulkToggleShowInGallery(ids, !!show);

  return NextResponse.json({
    code: 0,
    message: `${show ? 'Shown' : 'Hidden'} ${count} items`,
  });
}
