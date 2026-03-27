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
    cancelled: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
        colors[status] ?? "bg-gray-100 text-gray-700"
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
          className="rounded-lg border-gray-300"
          aria-label="Back to menu"
          onClick={() => navigate("/menu")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Admin dashboard
          </h1>
          <p className="text-sm text-gray-600">Total users: {total}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
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

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gradient-to-r from-pink-50/80 to-purple-50/80 text-gray-700">
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
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50/80"
                >
                  <td className="p-3 font-medium text-gray-900">{u.email}</td>
                  <td className="p-3 text-gray-700">{u.username ?? "—"}</td>
                  <td className="p-3 text-gray-700">{u.role}</td>
                  <td className="p-3">
                    <SubBadge status={u.subscription_status} />
                  </td>
                  <td className="p-3 text-gray-600">
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
