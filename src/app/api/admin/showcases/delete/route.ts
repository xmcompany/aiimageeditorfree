import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { inArray } from 'drizzle-orm';
import { getAuth } from '@/core/auth';
import { hasPermission } from '@/shared/services/rbac';
import { db } from '@/core/db';
import { showcase } from '@/config/db/schema';

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

  const body = await req.json() as { id?: string; ids?: string[] };

  // Support both { id: "..." } and { ids: ["..."] } formats
  const ids: string[] = body.ids?.length
    ? body.ids
    : body.id
    ? [body.id]
    : [];

  if (ids.length === 0) {
    return NextResponse.json({ code: 400, message: 'id or ids is required' }, { status: 400 });
  }

  await db().delete(showcase).where(inArray(showcase.id, ids));

  return NextResponse.json({ code: 0, message: `Deleted ${ids.length} item(s)` });
}
