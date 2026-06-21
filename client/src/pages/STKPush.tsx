import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://zentechapi.jmatecsystems.com";

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

function STKPush() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
          text:
            json.data?.CustomerMessage ??
            "Check your phone to complete the payment.",
          confirmButtonColor: "#1F5E3F",
        });
        setPhone("");
        setAmount("");
        loadTransactions();
      } else {
        await Swal.fire({
          icon: "error",
          title: "Request failed",
          text: json.message ?? "Something went wrong.",
          confirmButtonColor: "#9B3B2C",
        });
      }
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Network error",
        text: (err as Error).message,
        confirmButtonColor: "#9B3B2C",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const statusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-teal-50 text-teal-700 border border-teal-200 rounded-full";
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200 rounded-full";
      case "failed":
        return "bg-red-50 text-red-700 border border-red-200 rounded-full";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200 rounded-full";
    }
  };

  const addAmount = (value: number) => {
    const current = amount ? parseInt(amount) : 0;
    setAmount(String(current + value));
  };

  const totalAmount = transactions.reduce(
    (sum, t) => sum + (t.status === "completed" ? parseInt(t.amount) : 0),
    0,
  );

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">M-Pesa Express</h1>
            <p className="text-sm text-gray-600">Payments dashboard</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Send a payment prompt
        </h2>
        <p className="text-gray-600 mb-8">
          Push a payment request directly to a customer's phone and watch the
          transaction settle in real time.
        </p>

        {/* Form */}
        <div className="border-b border-gray-200 pb-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Phone number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712 345 678"
                className="w-full px-4 py-2 border border-gray-300 rounded text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-teal-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Safaricom number with country code or leading 0
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Amount
              </label>
              <div className="flex gap-2 items-center">
                <span className="text-gray-600">KES</span>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex gap-2">
              {[50, 100, 250, 500, 1000].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => addAmount(value)}
                  className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  +{value}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded transition disabled:opacity-50"
            >
              {submitting ? "Processing Request..." : "Send STK Push →"}
            </button>
          </form>
        </div>

        {/* Transactions Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Recent transactions
              </h3>
              <p className="text-xs text-gray-500">
                {transactions.length} records
              </p>
            </div>
            <button
              onClick={loadTransactions}
              disabled={loading}
              className="text-sm bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded transition disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {transactions.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              {loading ? "Loading records..." : "No transactions found"}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 text-xs">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 text-xs">
                        CUSTOMER
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 text-xs">
                        RECEIPT
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 text-xs">
                        AMOUNT
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 text-xs">
                        STATUS
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 text-xs">
                        WHEN
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions
                      .slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage,
                      )
                      .map((t, index) => (
                        <tr key={t.id}>
                          <td className="px-4 py-4 text-gray-600 font-semibold text-xs">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {t.phone_number}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-600 font-mono text-xs">
                            {t.mpesa_receipt ??
                              t.checkout_request_id.slice(0, 12)}
                          </td>
                          <td className="px-4 py-4 font-medium text-gray-900">
                            KES {t.amount}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusStyles(
                                t.status,
                              )}`}
                            >
                              {t.status.charAt(0).toUpperCase() +
                                t.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-600 text-xs">
                            {new Date(t.created_at).toLocaleDateString(
                              "en-KE",
                              {
                                day: "2-digit",
                                month: "short",
                              },
                            )}{" "}
                            {new Date(t.created_at).toLocaleTimeString(
                              "en-KE",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {transactions.length > itemsPerPage && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, transactions.length)}{" "}
                    of {transactions.length}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((p) =>
                          p * itemsPerPage < transactions.length ? p + 1 : p,
                        )
                      }
                      disabled={
                        currentPage * itemsPerPage >= transactions.length
                      }
                      className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default STKPush;
