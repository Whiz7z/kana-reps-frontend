type Entry = {
  prompt: string;
  answer: string;
  ok: boolean;
  meaning?: string;
};

export function QuestionHistory({ items }: { items: Entry[] }) {
  const display = [...items].reverse().slice(0, 10);
  const remaining = items.length - 10;

  return (
    <div className="rounded-3xl border border-slate-100/80 bg-[var(--color-paper)] p-4 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:shadow-black/40 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-200">
        Recent questions
      </h2>
      <div className="max-h-96 space-y-2 overflow-y-auto">
        {items.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">
            No questions answered yet
          </p>
        )}
        {display.map((e, i) => (
          <div
            key={i}
            className="rounded-2xl border border-violet-200/80 bg-violet-50/70 p-3 dark:border-violet-800/50 dark:bg-violet-950/35"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                <div>
                  <span className="kana-practice-script break-all text-base">
                    {e.prompt}
                  </span>
                  <span className="text-slate-500"> → </span>
                  <span className="kana-practice-script break-all text-base">
                    {e.answer}
                  </span>
                </div>
                {e.meaning && (
                  <div className="mt-1 text-xs font-normal text-slate-600 dark:text-slate-400">
                    {e.meaning}
                  </div>
                )}
              </div>
              <span
                className={`shrink-0 text-lg ${
                  e.ok ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {e.ok ? "✓" : "✗"}
              </span>
            </div>
          </div>
        ))}
        {remaining > 0 && (
          <p className="py-2 text-center text-sm text-slate-500">
            … and {remaining} more
          </p>
        )}
      </div>
    </div>
  );
}
