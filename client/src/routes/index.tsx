import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "STK Push" },
      { name: "description", content: "Send an M-Pesa STK push and view recent transactions." },
    ],
  }),
  component: Index,
});

type Transaction = {
  id: number;
  phone_number: string;
  amount: string;
  status: string;
  merchant_request_id: string;
  checkout_request_id: string;
  mpesa_receipt: string | null;
  result_code: number | null;
  account_reference: string | null;
  created_at: string;
  updated_at: string;
};

function Index() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/transactions`);
      const json = await res.json();
      if (json.success) setTransactions(json.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/stk-push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, amount }),
      });
      const json = await res.json();
      if (json.success) {
        await Swal.fire({
          icon: "success",
          title: "Request sent!",
          text: json.data?.CustomerMessage ?? "Check your phone to complete the payment.",
          confirmButtonColor: "#0d9488",
        });
        setPhone("");
        setAmount("");
        loadTransactions();
      } else {
        await Swal.fire({
          icon: "error",
          title: "Request failed",
          text: json.message ?? "Something went wrong.",
          confirmButtonColor: "#0d9488",
        });
      }
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Network error",
        text: (err as Error).message,
        confirmButtonColor: "#0d9488",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const statusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "failed":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <header>
          <h1 className="text-3xl font-semibold text-slate-900">M-Pesa STK Push</h1>
          <p className="mt-1 text-sm text-slate-600">
            Send a payment prompt and track recent transactions.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0703816487"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-slate-700">
                Amount (KES)
              </label>
              <input
                id="amount"
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send STK Push"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Transactions</h2>
            <button
              onClick={loadTransactions}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {transactions.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              {loading ? "Loading..." : "No transactions yet."}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {transactions.map((t) => (
                <li key={t.id} className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">{t.phone_number}</p>
                      <p className="text-sm text-slate-500">
                        KES {t.amount}
                        {t.mpesa_receipt ? ` · ${t.mpesa_receipt}` : ""}
                      </p>
                      {t.account_reference && (
                        <p className="mt-1 truncate text-xs text-slate-400">
                          {t.account_reference}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles(
                          t.status,
                        )}`}
                      >
                        {t.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(t.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
