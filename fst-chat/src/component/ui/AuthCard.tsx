import { type PropsWithChildren, type ReactElement } from "react";

export function AuthCard({
  title,
  subtitle,
  children,
}: PropsWithChildren<{ title: string; subtitle?: string }>): ReactElement {
  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-gradient-to-r dark:from-[#010221] dark:via-[#080c3b] dark:to-[#080c3f] bg-gradient-to-r from-white via-gray-100 to-gray-200">
      <div className="w-full max-w-md rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-2xl p-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{subtitle}</p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}