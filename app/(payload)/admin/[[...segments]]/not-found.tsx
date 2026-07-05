import { NotFoundPage } from '@payloadcms/next/views';
import { importMap } from '../importMap.js';
import config from '@/payload.config';

interface NotFoundProps {
  params: Promise<{
    segments?: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function NotFound({ params, searchParams }: NotFoundProps) {
  return (
    <NotFoundPage
      config={config}
      importMap={importMap}
      params={params as any}
      searchParams={searchParams as any}
    />
  );
}
