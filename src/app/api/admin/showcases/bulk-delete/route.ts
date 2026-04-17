import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getAuth } from '@/core/auth';
import { hasPermission } from '@/shared/services/rbac';
import { db } from '@/core/db';
import { showcase } from '@/config/db/schema';
import { inArray } from 'drizzle-orm';

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

  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ code: 400, message: 'ids required' }, { status: 400 });
  }

  await db().delete(showcase).where(inArray(showcase.id, ids));

  return NextResponse.json({ code: 0, message: `Deleted ${ids.length} items` });
}
