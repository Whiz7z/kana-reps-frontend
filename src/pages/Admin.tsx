import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { fetchAdminUsers, type AdminUserRow } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Filter = "all" | "trial" | "active" | "expired";

function SubBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    trial: "bg-blue-100 text-blue-800",
    active: "bg-green-100 text-green-800",
    expired: "bg-red-100 text-red-800",
    cancelled: "bg-slate-100 text-slate-800",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
        colors[status] ?? "bg-slate-100 text-slate-700"
      )}
    >
      {status}
    </span>
  );
}

export function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    void fetchAdminUsers()
      .then((r) => {
        setUsers(r.users);
        setTotal(r.total);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed"));
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return users;
    return users.filter((u) => u.subscription_status === filter);
  }, [users, filter]);

  const counts = useMemo(
    () => ({
      trial: users.filter((u) => u.subscription_status === "trial").length,
      active: users.filter((u) => u.subscription_status === "active").length,
      expired: users.filter((u) => u.subscription_status === "expired").length,
    }),
    [users]
  );

  if (err) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 shadow-sm">
        {err}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          aria-label="Back to menu"
          onClick={() => navigate("/menu")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="kana-page-title text-3xl font-bold">Admin dashboard</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Total users: {total}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100/80 bg-[var(--color-paper)] p-4 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:shadow-black/40 sm:p-6">
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={filter === "all" ? "primary" : "muted"}
            onClick={() => setFilter("all")}
          >
            All ({users.length})
          </Button>
          <Button
            size="sm"
            variant={filter === "trial" ? "primary" : "muted"}
            onClick={() => setFilter("trial")}
          >
            Trial ({counts.trial})
          </Button>
          <Button
            size="sm"
            variant={filter === "active" ? "primary" : "muted"}
            onClick={() => setFilter("active")}
          >
            Active ({counts.active})
          </Button>
          <Button
            size="sm"
            variant={filter === "expired" ? "primary" : "muted"}
            onClick={() => setFilter("expired")}
          >
            Expired ({counts.expired})
          </Button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-violet-50/95 text-slate-700 dark:border-slate-600 dark:bg-violet-950/40 dark:text-slate-200">
              <tr>
                <th className="p-3 font-semibold">Email</th>
                <th className="p-3 font-semibold">Name</th>
                <th className="p-3 font-semibold">Role</th>
                <th className="p-3 font-semibold">Subscription</th>
                <th className="p-3 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 dark:border-slate-700 dark:hover:bg-white/5"
                >
                  <td className="p-3 font-medium text-slate-900 dark:text-slate-100">
                    {u.email}
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">
                    {u.username ?? "—"}
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">{u.role}</td>
                  <td className="p-3">
                    <SubBadge status={u.subscription_status} />
                  </td>
                  <td className="p-3 text-slate-600">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
