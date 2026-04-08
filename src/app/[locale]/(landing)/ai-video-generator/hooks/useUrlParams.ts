import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function useUrlParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const removeParam = (paramName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(paramName);
    const newQuery = params.toString();
    const newUrl = `${pathname}${newQuery ? `?${newQuery}` : ''}`;
    router.replace(newUrl);
  };

  return { removeParam };
}
