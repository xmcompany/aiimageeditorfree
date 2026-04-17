'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

// 读取 URL 中的 ?ref= 参数并存入 cookie，供注册时使用
export function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref && /^[a-z0-9]{8}$/.test(ref)) {
      // 存 30 天
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      document.cookie = `ref=${ref}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    }
  }, [searchParams]);

  return null;
}
