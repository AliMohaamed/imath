"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
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
import Link from "next/link";

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
  const locale = useLocale();
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
  const [query, setQuery] = useState("");

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const lead of leads ?? []) {
      counts[lead.status] = (counts[lead.status] ?? 0) + 1;
    }
    return counts;
  }, [leads]);

  const filteredLeads = useMemo(() => {
    if (!leads) {
      return [];
    }

    const needle = query.trim().toLowerCase();
    const nextLeads = leads.filter((lead) => {
      if (statusFilter !== "all" && lead.status !== statusFilter) {
        return false;
      }
      if (countryFilter !== "all" && (lead.country ?? "EG") !== countryFilter) {
        return false;
      }
      if (
        needle &&
        ![lead.parentName, lead.studentName, lead.phoneNumber, lead.email ?? ""].some((value) =>
          value.toLowerCase().includes(needle)
        )
      ) {
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
  }, [countryFilter, leads, query, sortKey, statusFilter]);

  const effectiveSelectedLeadId =
    selectedLeadId && filteredLeads.some((lead) => lead._id === selectedLeadId)
      ? selectedLeadId
      : filteredLeads[0]?._id ?? null;

  const selectedLead =
    filteredLeads.find((lead) => lead._id === effectiveSelectedLeadId) ??
    null;

  if (viewer === undefined) {
    return <p role="status" className="text-sm text-slate-500">{common("loading")}</p>;
  }

  if (!viewer.isAuthenticated) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <h2 className="text-xl font-black text-slate-900">{t("states.unauthenticated")}</h2>
        <p className="mt-2 text-sm text-slate-600">{t("states.signInPrompt")}</p>
        <Link
          href="/admin/login"
          className="mt-6 inline-flex rounded-xl bg-brand-violet px-6 py-3 text-sm font-black text-white transition-opacity hover:opacity-90"
        >
          {common("login")}
        </Link>
      </div>
    );
  }

  if (!viewer.isAuthorized) {
    return (
      <div role="alert" className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <h3 className="text-lg font-black">{t("states.notAuthorizedTitle")}</h3>
        <p className="mt-2 leading-relaxed">{t("states.notAuthorizedDescription", { email: viewer.email ?? "unknown" })}</p>
      </div>
    );
  }

  if (leads === undefined || unreadNotifications === undefined || recentDeliveries === undefined) {
    return <DashboardSkeleton label={common("loading")} />;
  }

  const safeUnreadNotifications = unreadNotifications ?? [];
  const safeRecentDeliveries = recentDeliveries ?? [];
  const unreadLeadIds = new Set(safeUnreadNotifications.map((item) => item.leadId));
  const hasActiveFilters = statusFilter !== "all" || countryFilter !== "all" || query.trim() !== "";
  const resetFilters = () => {
    setStatusFilter("all");
    setCountryFilter("all");
    setQuery("");
  };
  const selectLead = (lead: Lead) => {
    setSelectedLeadId(lead._id);
    const notification = safeUnreadNotifications.find((item) => item.leadId === lead._id);
    if (notification) {
      void markNotificationRead({ notificationId: notification._id });
    }
  };

  return (
    <div className="admin-rise space-y-5">
      {safeUnreadNotifications.length > 0 ? (
        <section
          aria-label={t("notifications.title")}
          className="rounded-2xl border border-brand-orange/30 bg-brand-orange/5 px-4 py-3"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="size-2 rounded-full bg-brand-orange" aria-hidden />
            {t("notifications.description", { count: safeUnreadNotifications.length })}
          </div>
          <ul className="mt-2 divide-y divide-brand-orange/15">
            {safeUnreadNotifications.map((notification) => (
              <li key={notification._id} className="flex items-center justify-between gap-4 py-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-slate-900">{notification.title}</div>
                  <div className="truncate text-xs text-slate-600">{notification.message}</div>
                </div>
                <button
                  type="button"
                  onClick={() => void markNotificationRead({ notificationId: notification._id })}
                  className="shrink-0 rounded-lg border border-brand-orange/40 bg-white px-3 py-1.5 text-xs font-bold text-orange-700 transition-colors hover:bg-brand-orange/10"
                >
                  {t("notifications.markRead")}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div role="group" aria-label={t("filters.status")} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
        {LEAD_FILTER_STATUS_OPTIONS.map((status) => {
          const active = statusFilter === status;
          const count = status === "all" ? leads.length : statusCounts[status] ?? 0;
          return (
            <button
              key={status}
              type="button"
              aria-pressed={active}
              onClick={() => setStatusFilter(status)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-bold transition-colors ${
                active
                  ? "border-brand-violet bg-brand-violet text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {status === "all" ? t("pipeline.all") : status}
              <span className={`tabular rounded-md px-1.5 py-0.5 text-xs ${active ? "bg-white/20" : "bg-slate-100 text-slate-600"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1">
          <span className="mb-1 block text-xs font-bold text-slate-500">{t("filters.search")}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("filters.searchPlaceholder")}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-500 hover:border-slate-300"
          />
        </label>
        <FilterField label={t("filters.country")}>
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
        </FilterField>
        <FilterField label={t("filters.sort")}>
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as typeof sortKey)}
            className="admin-select"
          >
            <option value="submittedAtDesc">{t("filters.newestFirst")}</option>
            <option value="submittedAtAsc">{t("filters.oldestFirst")}</option>
            <option value="status">{t("filters.byStatus")}</option>
          </select>
        </FilterField>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <span aria-live="polite" className="tabular">
          {t("filters.results", { shown: filteredLeads.length, total: leads.length })}
        </span>
        {hasActiveFilters ? (
          <button type="button" onClick={resetFilters} className="font-bold text-brand-violet underline-offset-4 hover:underline">
            {t("filters.reset")}
          </button>
        ) : null}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.9fr)]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="max-h-[70vh] overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-bold text-slate-500 shadow-[0_1px_0_var(--color-border)]">
                <tr>
                  <th scope="col" className="px-4 py-3 text-start">{t("table.parent")}</th>
                  <th scope="col" className="hidden px-4 py-3 text-start sm:table-cell">{t("table.student")}</th>
                  <th scope="col" className="hidden px-4 py-3 text-start md:table-cell">{t("table.country")}</th>
                  <th scope="col" className="px-4 py-3 text-start">{t("table.status")}</th>
                  <th scope="col" className="hidden px-4 py-3 text-start lg:table-cell">{t("table.submitted")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => {
                  const isSelected = selectedLead?._id === lead._id;
                  const isUnread = unreadLeadIds.has(lead._id);
                  return (
                    <tr
                      key={lead._id}
                      tabIndex={0}
                      aria-selected={isSelected}
                      onClick={() => selectLead(lead)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          selectLead(lead);
                        }
                      }}
                      className={`cursor-pointer border-t border-slate-100 transition-colors hover:bg-slate-50 ${
                        isSelected ? "bg-brand-violet/[0.06] shadow-[inset_3px_0_0_var(--color-brand-violet)]" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                          {isUnread ? (
                            <span
                              className="size-2 shrink-0 rounded-full bg-brand-orange"
                              title={t("detail.unread")}
                              aria-label={t("detail.unread")}
                            />
                          ) : null}
                          {lead.parentName}
                        </div>
                        <div dir="ltr" className="tabular text-xs text-slate-500 text-start">{lead.phoneNumber}</div>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <div className="font-medium text-slate-700">{lead.studentName}</div>
                        <div className="text-xs text-slate-500">{t("detail.age", { age: lead.studentAge })}</div>
                      </td>
                      <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                        <div>{lead.country ?? "EG"}</div>
                        <div className="text-xs text-slate-500">{lead.currency ?? "EGP"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={lead.status as LeadStatus} />
                      </td>
                      <td className="tabular hidden px-4 py-3 text-xs text-slate-500 lg:table-cell">
                        {formatDate(lead.submittedAt, locale)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredLeads.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-slate-600">
                <p>{t("states.empty")}</p>
                {hasActiveFilters ? (
                  <button type="button" onClick={resetFilters} className="mt-3 font-bold text-brand-violet hover:underline">
                    {t("filters.reset")}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <aside aria-label={t("detail.student")} className="rounded-2xl border border-slate-200 bg-white p-5 xl:sticky xl:top-6">
          {selectedLead ? (
            <LeadDetailCard
              key={selectedLead._id}
              lead={selectedLead}
              locale={locale}
              onStatusChange={async (status) => {
                await updateLeadStatus({ leadId: selectedLead._id, status });
                trackEvent("admin_lead_status_update", {
                  leadId: selectedLead._id,
                  status,
                });
              }}
            />
          ) : (
            <div className="py-8 text-center text-sm text-slate-600">{t("states.selectLead")}</div>
          )}
        </aside>
      </div>

      <details className="group rounded-2xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
          <div>
            <h3 className="text-base font-black text-slate-900">{t("delivery.title")}</h3>
            <p className="text-sm text-slate-600">{t("delivery.description")}</p>
          </div>
          <span aria-hidden className="text-slate-500 transition-transform group-open:rotate-180">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m4 6 4 4 4-4" />
            </svg>
          </span>
        </summary>
        <ul className="divide-y divide-slate-100 border-t border-slate-100">
          {safeRecentDeliveries.map((delivery) => (
            <li key={delivery._id} className="grid gap-2 px-5 py-3 text-sm md:grid-cols-[110px_1fr_auto] md:items-center">
              <DeliveryBadge status={delivery.status} />
              <div className="text-slate-700">
                <div>{t("delivery.attempts", { attempts: delivery.attempts })}</div>
                <div className="text-xs text-slate-500">{delivery.errorMessage ?? t("delivery.noError")}</div>
              </div>
              <div className="tabular text-xs text-slate-500">
                {delivery.lastAttemptAt ? formatDate(delivery.lastAttemptAt, locale) : t("delivery.pending")}
              </div>
            </li>
          ))}
        </ul>
      </details>

      <p className="text-xs leading-relaxed text-slate-500">
        <span className="font-bold text-slate-700">{t("ops.title")}. </span>
        {t("ops.description")}
      </p>
    </div>
  );
}

function LeadDetailCard({
  lead,
  locale,
  onStatusChange,
}: {
  lead: Lead;
  locale: string;
  onStatusChange: (status: LeadStatus) => Promise<void>;
}) {
  const t = useTranslations("Admin.dashboard");
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const whatsappText = encodeURIComponent(
    `${t("whatsapp.messageIntro")} ${lead.parentName}.\n\n${t("whatsapp.messageBody", {
      studentName: lead.studentName,
      status: lead.status,
    })}`
  );
  const whatsappHref = `https://wa.me/${lead.phoneNumber.replace(/[^\d]/g, "")}?text=${whatsappText}`;

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(lead.phoneNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="admin-rise space-y-5">
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-black tracking-tight text-slate-900">{lead.parentName}</h3>
          <StatusBadge status={lead.status as LeadStatus} />
        </div>
        <p className="text-sm text-slate-600">{t("detail.submittedOn", { date: formatDate(lead.submittedAt, locale) })}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-xl bg-[#128C4B] px-4 py-2.5 text-sm font-black text-white transition-opacity hover:opacity-90"
        >
          {t("actions.whatsapp")}
        </a>
        <a
          href={`tel:${lead.phoneNumber}`}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition-colors hover:bg-slate-50"
        >
          {t("actions.call")}
        </a>
      </div>

      <div className="space-y-2">
        <label htmlFor={`status-${lead._id}`} className="text-xs font-bold text-slate-500">
          {t("detail.statusLabel")}
        </label>
        <select
          id={`status-${lead._id}`}
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
        <p aria-live="polite" className="h-4 text-xs text-slate-500">{isSaving ? t("detail.saving") : ""}</p>
      </div>

      <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200 text-sm">
        <DetailRow label={t("detail.student")} value={`${lead.studentName} · ${t("detail.age", { age: lead.studentAge })}`} />
        <DetailRow
          label={t("detail.phone")}
          value={lead.phoneNumber}
          ltr
          action={
            <button type="button" onClick={() => void copyPhone()} className="text-xs font-bold text-brand-violet hover:underline">
              {copied ? t("detail.copied") : t("detail.copyPhone")}
            </button>
          }
        />
        <DetailRow label={t("detail.email")} value={lead.email ?? t("detail.noEmail")} ltr={Boolean(lead.email)} />
        <DetailRow label={t("detail.previousExperience")} value={lead.previousExperience} />
        <DetailRow
          label={t("detail.preferredSlots")}
          value={lead.preferredSlots.map((slot) => formatPreferredSlotValue(slot, lead.locale as "ar" | "en")).join(", ")}
        />
        <DetailRow
          label={t("detail.interestedPackage")}
          value={lead.interestedPackage ? t("detail.packageMonths", { months: lead.interestedPackage }) : t("detail.notSure")}
        />
        <DetailRow label={t("detail.country")} value={`${lead.country ?? "EG"} · ${lead.currency ?? "EGP"}`} />
        <DetailRow label={t("detail.timezone")} value={lead.timezone} />
        <DetailRow label={t("detail.locale")} value={lead.locale.toUpperCase()} />
      </dl>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block sm:w-44">
      <span className="mb-1 block text-xs font-bold text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function DetailRow({
  label,
  value,
  ltr,
  action,
}: {
  label: string;
  value: string;
  ltr?: boolean;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-2.5">
      <dt className="shrink-0 text-xs font-bold text-slate-500">{label}</dt>
      <dd className="min-w-0 text-end font-medium text-slate-800">
        <span dir={ltr ? "ltr" : undefined} className="tabular inline-block break-words">{value}</span>
        {action ? <div>{action}</div> : null}
      </dd>
    </div>
  );
}

function DashboardSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-4">
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-10 w-28 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
      <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />
      <div className="grid gap-5 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const classNameByStatus: Record<LeadStatus, string> = {
    "New Request": "bg-sky-100 text-sky-900",
    "Trial Scheduled": "bg-amber-100 text-amber-900",
    "Trial Completed": "bg-violet-100 text-violet-900",
    Subscribed: "bg-emerald-100 text-emerald-900",
    "Did Not Subscribe": "bg-rose-100 text-rose-900",
  };

  return (
    <span className={`inline-flex shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${classNameByStatus[status]}`}>
      {status}
    </span>
  );
}

function DeliveryBadge({ status }: { status: string }) {
  const classNameByStatus: Record<string, string> = {
    sent: "bg-emerald-100 text-emerald-900",
    failed: "bg-rose-100 text-rose-900",
    skipped: "bg-slate-100 text-slate-700",
    pending: "bg-amber-100 text-amber-900",
  };

  return (
    <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-bold ${classNameByStatus[status] ?? "bg-slate-100 text-slate-700"}`}>
      {status}
    </span>
  );
}

function formatDate(timestamp: number, locale: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}
