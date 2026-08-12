/* This file follows Payload's generated root layout contract. */
import config from "@payload-config";
import "@payloadcms/next/css";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import type { ServerFunctionClient } from "payload";
import type { ReactNode } from "react";

import { importMap } from "./cms/importMap.js";
import { requireLibraryAccess } from "@/lib/library-access";
import "./custom.scss";

const serverFunction: ServerFunctionClient = async (args) => {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

export default async function PayloadLayout({ children }: { children: ReactNode }) {
  await requireLibraryAccess("/cms");

  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  );
}
