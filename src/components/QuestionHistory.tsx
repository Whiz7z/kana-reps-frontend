type Entry = { prompt: string; answer: string; ok: boolean };

export function QuestionHistory({ items }: { items: Entry[] }) {
  const display = [...items].reverse().slice(0, 10);
  const remaining = items.length - 10;

  return (
    <div className="rounded-3xl border border-slate-100/80 bg-white p-4 shadow-xl shadow-slate-200/50 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-700">
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
            className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 text-sm font-medium text-slate-800">
                <span className="kana-practice-script break-all text-base">
                  {e.prompt}
                </span>
                <span className="text-slate-500"> → </span>
                <span className="kana-practice-script break-all text-base">
                  {e.answer}
                </span>
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
