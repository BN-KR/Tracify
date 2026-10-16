"use client";

import dynamic from "next/dynamic";

// The banner only renders after hydration (it reads browser storage), so it can
// load in its own chunk without changing what visitors see.
export const ConsentBanner = dynamic(() => import("./consent-banner").then((module) => module.ConsentBanner), { ssr: false });
