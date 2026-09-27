import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, CheckCircle2, XCircle, Clock } from "lucide-react";
import Card from "../../components/ui/Card";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Button";
import { LoadingCard, ErrorCard } from "../../components/ui/AsyncStates";
import {
  usePendingDealerRequests,
  useApproveDealerRequest,
  useRejectDealerRequest,
} from "../../hooks/useDealers";

const PendingDealerRequests = () => {
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [banner, setBanner] = useState(null);

  const { data, loading, error } = usePendingDealerRequests();
  const approveRequest = useApproveDealerRequest();
  const rejectRequest = useRejectDealerRequest();

  const requests = data ?? [];

  const handleApprove = async (id) => {
    setBanner(null);
    try {
      await approveRequest.mutateAsync(id);
      setBanner({
        type: "success",
        text: "Approved — activation code emailed to the dealer.",
      });
    } catch (err) {
      setBanner({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Couldn't approve this request. Please try again.",
      });
    }
  };

  const handleReject = async (id) => {
    setBanner(null);
    try {
      await rejectRequest.mutateAsync({
        id,
        payload: { reason: rejectReason },
      });
      setBanner({
        type: "success",
        text: "Request rejected.",
      });
      setRejectingId(null);
      setRejectReason("");
    } catch (err) {
      setBanner({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Couldn't reject this request. Please try again.",
      });
    }
  };

  return (
    <section className="w-full">
      <Link
        to="/adminDash"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
      >
        <ArrowLeft size={15} /> Back to dashboard
      </Link>

      <div className="mb-6">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          Admin
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Pending Dealer Requests
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review new dealer registration requests. Approving sends the dealer an
          activation code by email; rejecting closes the request.
        </p>
      </div>

      {loading && <LoadingCard rows={4} />}
      {!loading && error && <ErrorCard message={error} />}

      {banner && (
        <div
          className={`mb-6 px-4 py-3 rounded-xl text-sm border flex items-center gap-2 ${
            banner.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-600"
          }`}
        >
          {banner.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <XCircle size={16} />
          )}
          {banner.text}
        </div>
      )}

      {!loading && !error && requests.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Clock size={24} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">
            No pending dealer requests right now.
          </p>
          <p className="text-slate-400 text-xs mt-1">
            New requests will appear here.
          </p>
        </Card>
      ) : (
        !loading &&
        !error && (
          <div className="space-y-4">
            {requests.map((req) => (
              <Card key={req.id} className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h2 className="text-lg font-bold text-slate-800">
                        {req.name}
                      </h2>
                      <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                        Pending
                      </span>
                    </div>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                      <div>
                        <dt className="text-xs text-slate-400 uppercase tracking-wider">
                          Email
                        </dt>
                        <dd className="text-slate-800 font-medium">
                          {req.emailId}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-400 uppercase tracking-wider">
                          Mobile
                        </dt>
                        <dd className="text-slate-800 font-medium">
                          {req.mobileNo}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-400 uppercase tracking-wider">
                          GSTIN
                        </dt>
                        <dd className="text-slate-800 font-medium font-mono text-xs">
                          {req.gstin}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-400 uppercase tracking-wider">
                          Location
                        </dt>
                        <dd className="text-slate-800 font-medium">
                          {req.dist}, {req.state} — {req.pinCode}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-400 uppercase tracking-wider">
                          RTO Office
                        </dt>
                        <dd className="text-slate-800 font-medium">
                          {req.rtoOffice}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-xs text-slate-400 uppercase tracking-wider">
                          Address
                        </dt>
                        <dd className="text-slate-800 font-medium">
                          {req.address}
                        </dd>
                      </div>
                      {req.submittedAt && (
                        <div className="sm:col-span-2">
                          <dt className="text-xs text-slate-400 uppercase tracking-wider">
                            Submitted
                          </dt>
                          <dd className="text-slate-800 font-medium">
                            {new Date(req.submittedAt).toLocaleString()}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <PrimaryButton
                      onClick={() => handleApprove(req.id)}
                      disabled={
                        approveRequest.isPending &&
                        approveRequest.variables === req.id
                      }
                      className="text-sm px-5 py-2"
                    >
                      {approveRequest.isPending &&
                      approveRequest.variables === req.id
                        ? "Approving..."
                        : "Approve"}
                    </PrimaryButton>
                    <SecondaryButton
                      onClick={() =>
                        setRejectingId((cur) =>
                          cur === req.id ? null : req.id,
                        )
                      }
                      disabled={
                        approveRequest.isPending &&
                        approveRequest.variables === req.id
                      }
                      className="text-sm px-5 py-2"
                    >
                      Reject
                    </SecondaryButton>
                  </div>
                </div>

                {rejectingId === req.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <label className="block text-xs font-medium mb-1.5 text-slate-700">
                      Reason (optional, included in the rejection email)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g. Incomplete GSTIN details"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                      <SecondaryButton
                        onClick={() => handleReject(req.id)}
                        disabled={
                          rejectRequest.isPending &&
                          rejectRequest.variables?.id === req.id
                        }
                        className="text-sm px-5 py-2 whitespace-nowrap !bg-red-500 !text-white !border-red-500 hover:!bg-red-600"
                      >
                        {rejectRequest.isPending &&
                        rejectRequest.variables?.id === req.id
                          ? "Rejecting..."
                          : "Confirm Reject"}
                      </SecondaryButton>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )
      )}
    </section>
  );
};

export default PendingDealerRequests;
