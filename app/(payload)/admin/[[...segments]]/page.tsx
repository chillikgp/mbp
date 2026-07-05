import { RootPage } from '@payloadcms/next/views';
import { importMap } from '../importMap.js';
import config from '@/payload.config';

interface PageProps {
  params: Promise<{
    segments?: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  return (
    <RootPage
      config={config}
      importMap={importMap}
      params={params as any}
      searchParams={searchParams as any}
    />
  );
}
