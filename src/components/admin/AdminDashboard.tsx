"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import {
  LEAD_COUNTRY_FILTER_OPTIONS,
  LEAD_FILTER_STATUS_OPTIONS,
  LEAD_STATUS_OPTIONS,
  type LeadCountryFilter,
  type LeadFilterStatus,
  type LeadStatus,
} from "@/lib/leads";
import { trackEvent } from "@/lib/analytics";
import { formatPreferredSlotValue } from "@/lib/booking";
import { Link } from "@/navigation";

type Lead = Doc<"leads">;

const listLeadsRef = api.admin.listLeads;
const updateLeadStatusRef = api.admin.updateLeadStatus;
const getViewerRef = api.admin.getViewer;
const listUnreadNotificationsRef = api.notifications.listUnread;
const markNotificationReadRef = api.notifications.markAsRead;
const listRecentDeliveriesRef = api.notifications.listRecentDeliveries;

export function AdminDashboard() {
  const t = useTranslations("Admin.dashboard");
  const common = useTranslations("Admin.common");
  const viewer = useQuery(getViewerRef, {});
  const leads = useQuery(listLeadsRef, viewer?.isAuthorized ? {} : "skip");
  const unreadNotifications = useQuery(listUnreadNotificationsRef, viewer?.isAuthorized ? {} : "skip");
  const recentDeliveries = useQuery(listRecentDeliveriesRef, viewer?.isAuthorized ? {} : "skip");
  const updateLeadStatus = useMutation(updateLeadStatusRef);
  const markNotificationRead = useMutation(markNotificationReadRef);
  const [statusFilter, setStatusFilter] = useState<LeadFilterStatus>("all");
  const [countryFilter, setCountryFilter] = useState<LeadCountryFilter>("all");
  const [sortKey, setSortKey] = useState<"submittedAtDesc" | "submittedAtAsc" | "status">("submittedAtDesc");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const filteredLeads = useMemo(() => {
    if (!leads) {
      return [];
    }

    const nextLeads = leads.filter((lead) => {
      if (statusFilter !== "all" && lead.status !== statusFilter) {
        return false;
      }
      if (countryFilter !== "all" && (lead.country ?? "EG") !== countryFilter) {
        return false;
      }
      return true;
    });

    nextLeads.sort((a, b) => {
      if (sortKey === "submittedAtAsc") {
        return a.submittedAt - b.submittedAt;
      }
      if (sortKey === "status") {
        return a.status.localeCompare(b.status);
      }
      return b.submittedAt - a.submittedAt;
    });

    return nextLeads;
  }, [countryFilter, leads, sortKey, statusFilter]);

  const effectiveSelectedLeadId =
    selectedLeadId && filteredLeads.some((lead) => lead._id === selectedLeadId)
      ? selectedLeadId
      : filteredLeads[0]?._id ?? null;

  const selectedLead =
    filteredLeads.find((lead) => lead._id === effectiveSelectedLeadId) ??
    null;

  if (viewer === undefined) {
    return <p className="text-sm text-slate-500">{common("loading")}</p>;
  }

  if (!viewer.isAuthenticated) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <h2 className="text-2xl font-black text-slate-900">{t("states.unauthenticated")}</h2>
        <p className="mt-2 text-sm text-slate-600">Please sign in to access the dashboard.</p>
        <Link
          href="/admin/login"
          locale={common("locale") as "ar" | "en"}
          className="mt-6 inline-flex rounded-full bg-brand-violet px-6 py-3 text-sm font-black text-white"
        >
          {common("login")}
        </Link>
      </div>
    );
  }

  if (!viewer.isAuthorized) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <h3 className="text-lg font-black">{t("states.notAuthorizedTitle")}</h3>
        <p className="mt-2 leading-relaxed">{t("states.notAuthorizedDescription", { email: viewer.email ?? "unknown" })}</p>
      </div>
    );
  }

  if (leads === undefined || unreadNotifications === undefined || recentDeliveries === undefined) {
    return <p className="text-sm text-slate-500">{common("loading")}</p>;
  }

  const safeUnreadNotifications = unreadNotifications ?? [];
  const safeRecentDeliveries = recentDeliveries ?? [];

  return (
    <div className="space-y-6">
      {safeUnreadNotifications.length > 0 ? (
        <div className="rounded-3xl border border-brand-orange/20 bg-brand-orange/5 p-5 text-sm text-slate-700">
          <div>
            <div className="font-black text-slate-900">{t("notifications.title")}</div>
            <div>{t("notifications.description", { count: safeUnreadNotifications.length })}</div>
          </div>
          <div className="mt-4 grid gap-3">
            {safeUnreadNotifications.map((notification) => (
              <div key={notification._id} className="flex items-start justify-between gap-4 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm">
                <div className="space-y-1">
                  <div className="font-black text-slate-900">{notification.title}</div>
                  <div className="text-xs text-slate-500">{notification.message}</div>
                </div>
                <button
                  type="button"
                  onClick={() => void markNotificationRead({ notificationId: notification._id })}
                  className="rounded-full bg-brand-orange px-3 py-2 text-[11px] font-black text-white"
                >
                  {t("notifications.markRead")}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <FilterCard label={t("filters.status")}>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as LeadFilterStatus)}
            className="admin-select"
          >
            {LEAD_FILTER_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? t("filters.allStatuses") : status}
              </option>
            ))}
          </select>
        </FilterCard>

        <FilterCard label={t("filters.country")}>
          <select
            value={countryFilter}
            onChange={(event) => setCountryFilter(event.target.value as LeadCountryFilter)}
            className="admin-select"
          >
            {LEAD_COUNTRY_FILTER_OPTIONS.map((countryCode) => (
              <option key={countryCode} value={countryCode}>
                {countryCode === "all" ? t("filters.allCountries") : countryCode}
              </option>
            ))}
          </select>
        </FilterCard>

        <FilterCard label={t("filters.sort")}>
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as typeof sortKey)}
            className="admin-select"
          >
            <option value="submittedAtDesc">{t("filters.newestFirst")}</option>
            <option value="submittedAtAsc">{t("filters.oldestFirst")}</option>
            <option value="status">{t("filters.byStatus")}</option>
          </select>
        </FilterCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.9fr)]">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-4">{t("table.parent")}</th>
                  <th className="px-4 py-4">{t("table.student")}</th>
                  <th className="px-4 py-4">{t("table.country")}</th>
                  <th className="px-4 py-4">{t("table.status")}</th>
                  <th className="px-4 py-4">{t("table.submitted")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead._id}
                    className={`cursor-pointer border-t border-slate-100 transition-colors hover:bg-slate-50 ${selectedLead?._id === lead._id ? "bg-brand-violet/5" : ""}`}
                    onClick={() => {
                      setSelectedLeadId(lead._id);
                      const notification = safeUnreadNotifications.find((item) => item.leadId === lead._id);
                      if (notification) {
                        void markNotificationRead({ notificationId: notification._id });
                      }
                    }}
                  >
                    <td className="px-4 py-4">
                      <div className="font-black text-slate-900">{lead.parentName}</div>
                      <div className="text-xs text-slate-500">{lead.phoneNumber}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-700">{lead.studentName}</div>
                      <div className="text-xs text-slate-500">{t("detail.age", { age: lead.studentAge })}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      <div>{lead.country ?? "EG"}</div>
                      <div className="text-xs text-slate-500">{lead.currency ?? "EGP"}</div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={lead.status as LeadStatus} />
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500">
                      {formatDate(lead.submittedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLeads.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">
              {t("states.empty")}
            </div>
          ) : null}
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-slate-50/60 p-5">
          {selectedLead ? (
            <LeadDetailCard
              lead={selectedLead}
              onStatusChange={async (status) => {
                await updateLeadStatus({ leadId: selectedLead._id, status });
                trackEvent("admin_lead_status_update", {
                  leadId: selectedLead._id,
                  status,
                });
              }}
            />
          ) : (
            <div className="text-sm text-slate-500">{t("states.selectLead")}</div>
          )}
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-5">
        <div className="mb-4">
          <h3 className="text-lg font-black text-slate-900">{t("delivery.title")}</h3>
          <p className="text-sm text-slate-500">{t("delivery.description")}</p>
        </div>
        <div className="grid gap-3">
          {safeRecentDeliveries.map((delivery) => (
            <div key={delivery._id} className="grid gap-2 rounded-2xl border border-slate-100 px-4 py-3 text-sm md:grid-cols-[120px_1fr_auto] md:items-center">
              <DeliveryBadge status={delivery.status} />
              <div className="text-slate-600">
                <div>{t("delivery.attempts", { attempts: delivery.attempts })}</div>
                <div className="text-xs text-slate-500">
                  {delivery.errorMessage ?? t("delivery.noError")}
                </div>
              </div>
              <div className="text-xs text-slate-400">
                {delivery.lastAttemptAt ? formatDate(delivery.lastAttemptAt) : t("delivery.pending")}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
        <div className="font-black text-slate-900">{t("ops.title")}</div>
        <div className="mt-1">{t("ops.description")}</div>
      </div>
    </div>
  );
}

function LeadDetailCard({
  lead,
  onStatusChange,
}: {
  lead: Lead;
  onStatusChange: (status: LeadStatus) => Promise<void>;
}) {
  const t = useTranslations("Admin.dashboard");
  const [isSaving, setIsSaving] = useState(false);

  const whatsappText = encodeURIComponent(
    `${t("whatsapp.messageIntro")} ${lead.parentName}.\n\n${t("whatsapp.messageBody", {
      studentName: lead.studentName,
      status: lead.status,
    })}`
  );
  const whatsappHref = `https://wa.me/${lead.phoneNumber.replace(/[^\d]/g, "")}?text=${whatsappText}`;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h3 className="text-2xl font-black tracking-tight text-slate-900">{lead.parentName}</h3>
        <p className="text-sm text-slate-600">{t("detail.submittedOn", { date: formatDate(lead.submittedAt) })}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DetailItem label={t("detail.student")} value={`${lead.studentName} - ${t("detail.age", { age: lead.studentAge })}`} />
        <DetailItem label={t("detail.phone")} value={lead.phoneNumber} />
        <DetailItem label={t("detail.email")} value={lead.email ?? t("detail.noEmail")} />
        <DetailItem label={t("detail.previousExperience")} value={lead.previousExperience} />
        <DetailItem label={t("detail.timezone")} value={lead.timezone} />
        <DetailItem label={t("detail.locale")} value={lead.locale.toUpperCase()} />
        <DetailItem label={t("detail.country")} value={`${lead.country ?? "EG"} - ${lead.currency ?? "EGP"}`} />
        <DetailItem
          label={t("detail.preferredSlots")}
          value={lead.preferredSlots.map((slot) => formatPreferredSlotValue(slot, lead.locale as "ar" | "en")).join(", ")}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-slate-500">{t("detail.statusLabel")}</label>
        <select
          value={lead.status}
          disabled={isSaving}
          onChange={async (event) => {
            setIsSaving(true);
            try {
              await onStatusChange(event.target.value as LeadStatus);
            } finally {
              setIsSaving(false);
            }
          }}
          className="admin-select"
        >
          {LEAD_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-5 py-3 text-sm font-black text-white"
        >
          {t("actions.whatsapp")}
        </a>
        <a
          href={`tel:${lead.phoneNumber}`}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700"
        >
          {t("actions.call")}
        </a>
      </div>
    </div>
  );
}

function FilterCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <label className="space-y-2">
        <span className="block text-xs font-black uppercase tracking-wider text-slate-500">{label}</span>
        {children}
      </label>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const classNameByStatus: Record<LeadStatus, string> = {
    "New Request": "bg-sky-100 text-sky-800",
    "Trial Scheduled": "bg-amber-100 text-amber-800",
    "Trial Completed": "bg-violet-100 text-violet-800",
    Subscribed: "bg-emerald-100 text-emerald-800",
    "Did Not Subscribe": "bg-rose-100 text-rose-800",
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${classNameByStatus[status]}`}>
      {status}
    </span>
  );
}

function DeliveryBadge({ status }: { status: string }) {
  const classNameByStatus: Record<string, string> = {
    sent: "bg-emerald-100 text-emerald-800",
    failed: "bg-rose-100 text-rose-800",
    skipped: "bg-slate-100 text-slate-700",
    pending: "bg-amber-100 text-amber-800",
  };

  return (
    <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ${classNameByStatus[status] ?? "bg-slate-100 text-slate-700"}`}>
      {status}
    </span>
  );
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}
