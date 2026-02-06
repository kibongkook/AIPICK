'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-32 text-center sm:px-6 lg:px-8">
      <h1 className="text-6xl font-extrabold text-red-500">오류</h1>
      <p className="mt-4 text-xl font-bold text-foreground">
        문제가 발생했습니다
      </p>
      <p className="mt-2 text-gray-500">
        잠시 후 다시 시도해주세요.
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
      >
        다시 시도
      </button>
    </div>
  );
}
