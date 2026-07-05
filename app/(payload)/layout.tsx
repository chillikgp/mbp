import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts';
import { importMap } from './admin/importMap.js';
import config from '@/payload.config';
import '@payloadcms/next/css';
import React from 'react';

const serverFunction = async function (args: any) {
  'use server';
  return handleServerFunctions({ ...args, config, importMap });
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  );
}
