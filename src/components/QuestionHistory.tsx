type Entry = { prompt: string; answer: string; ok: boolean };

export function QuestionHistory({ items }: { items: Entry[] }) {
  const display = [...items].reverse().slice(0, 10);
  const remaining = items.length - 10;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-700">
        Recent questions
      </h2>
      <div className="max-h-96 space-y-2 overflow-y-auto">
        {items.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">
            No questions answered yet
          </p>
        )}
        {display.map((e, i) => (
          <div
            key={i}
            className="rounded-lg border border-purple-200 bg-gradient-to-r from-pink-50 to-purple-50 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 text-sm font-medium text-gray-800">
                <span className="break-all">{e.prompt}</span>
                <span className="text-gray-500"> → </span>
                <span className="break-all">{e.answer}</span>
              </div>
              <span
                className={`shrink-0 text-lg ${
                  e.ok ? "text-green-600" : "text-red-600"
                }`}
              >
                {e.ok ? "✓" : "✗"}
              </span>
            </div>
          </div>
        ))}
        {remaining > 0 && (
          <p className="py-2 text-center text-sm text-gray-500">
            … and {remaining} more
          </p>
        )}
      </div>
    </div>
  );
}
