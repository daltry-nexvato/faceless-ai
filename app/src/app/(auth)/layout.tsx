import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          {APP_NAME}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Create faceless YouTube videos with AI
        </p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
