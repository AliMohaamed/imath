"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  const convex = useMemo(() => {
    if (!convexUrl) return null;
    return new ConvexReactClient(convexUrl);
  }, [convexUrl]);

  if (!convex) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 m-4 border-2 border-dashed border-red-200 bg-red-50 rounded-xl text-center space-y-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-xl">!</div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-red-900">Convex Configuration Missing</h3>
          <p className="text-sm text-red-700 max-w-md">
            The environment variable <code>NEXT_PUBLIC_CONVEX_URL</code> is not defined. 
            This usually means you haven&apos;t run <code>npx convex dev</code> yet.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <code className="bg-red-100 p-2 rounded text-xs text-red-800">npx convex dev</code>
          <p className="text-xs text-red-500 italic">Run the command above to initialize your local backend.</p>
        </div>
        <div className="pt-4 border-t border-red-100 w-full">
          {/* Allow children to render anyway if you want to see the UI shell, but most hooks will fail */}
          <p className="text-[10px] text-red-400 uppercase tracking-widest font-bold">Development Mode</p>
        </div>
      </div>
    );
  }

  return (
    <ConvexAuthProvider client={convex}>
      {children}
    </ConvexAuthProvider>
  );
}
