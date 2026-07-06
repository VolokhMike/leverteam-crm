"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Pencil,
  Pin,
  ArrowRight,
  ArrowLeft,
  X,
  Link2,
  Radio,
  UserCircle2,
  UserPlus,
  CalendarDays,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/Badge";
import type { Lead, Stage } from "@/lib/types";
import { REJECTED_STAGE } from "@/lib/constants";
import type { CSSProperties } from "react";

function fmtDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <span className="w-20 shrink-0 text-slate-400">{label}</span>
      <span className="min-w-0 flex-1 truncate font-medium text-slate-700 dark:text-slate-200">
        {children}
      </span>
    </div>
  );
}

type ViewProps = {
  lead: Lead;
  stages: Stage[];
  onEdit: (lead: Lead) => void;
  onTogglePin: (lead: Lead) => void;
  onMoveStage: (lead: Lead, stageKey: string) => void;
  currentUser?: { id: string; role: "ADMIN" | "SALES" };
  onTake?: (lead: Lead) => void;
  overlay?: boolean;
  isDragging?: boolean;
  innerRef?: (node: HTMLElement | null) => void;
  style?: CSSProperties;
  handleProps?: Record<string, unknown>;
};

/** Pure presentational card — safe to render inside a DragOverlay. */
export function LeadCardView({
  lead,
  stages,
  onEdit,
  onTogglePin,
  onMoveStage,
  currentUser,
  onTake,
  overlay = false,
  isDragging = false,
  innerRef,
  style,
  handleProps = {},
}: ViewProps) {
  const flow = stages
    .filter((s) => s.key !== REJECTED_STAGE)
    .sort((a, b) => a.order - b.order);
  const idx = flow.findIndex((s) => s.id === lead.stageId);
  const isRejected = lead.stage.key === REJECTED_STAGE;
  const next = idx >= 0 ? flow[idx + 1] : undefined;
  const prev = idx > 0 ? flow[idx - 1] : undefined;

  // Продажник может «взять себе» ещё не назначенного лида.
  const canTake =
    !!onTake && currentUser?.role === "SALES" && lead.salesRepId === null;

  // Prevent drag from starting when interacting with controls.
  const stop = (e: React.PointerEvent) => e.stopPropagation();

  return (
    <div
      ref={innerRef}
      style={style}
      {...handleProps}
      className={`group select-none rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm transition dark:border-slate-800 dark:bg-slate-900 ${
        overlay ? "dragging cursor-grabbing" : "cursor-grab hover:shadow-md"
      } ${isDragging ? "opacity-40" : ""} ${
        lead.pinned ? "ring-1 ring-brand-400/60" : ""
      }`}
    >
      {/* Header: title + quick action icons */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <a
          href={lead.telegramLink || "#"}
          target="_blank"
          rel="noreferrer"
          onPointerDown={stop}
          className="min-w-0 truncate text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
        >
          {lead.title}
        </a>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            onPointerDown={stop}
            onClick={() => onTogglePin(lead)}
            title={lead.pinned ? "Открепить" : "Закрепить"}
            className={`rounded p-1 transition hover:bg-slate-100 dark:hover:bg-slate-800 ${
              lead.pinned ? "text-brand-500" : "text-slate-400"
            }`}
          >
            <Pin className={`h-4 w-4 ${lead.pinned ? "fill-current" : ""}`} />
          </button>
          <button
            onPointerDown={stop}
            onClick={() => onEdit(lead)}
            title="Редактировать"
            className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tags: niche + stage */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {lead.niche && <Badge label={lead.niche.name} color={lead.niche.color} />}
        <Badge label={lead.stage.name} color={lead.stage.color} />
      </div>

      {/* Fields */}
      <div className="space-y-1.5">
        <Field icon={<Link2 className="h-3.5 w-3.5" />} label="Ссылка">
          {lead.telegramLink ? (
            <a
              href={lead.telegramLink}
              target="_blank"
              rel="noreferrer"
              onPointerDown={stop}
              className="text-brand-600 hover:underline dark:text-brand-400"
            >
              {lead.username ? `@${lead.username}` : lead.telegramLink}
            </a>
          ) : lead.username ? (
            `@${lead.username}`
          ) : (
            "—"
          )}
        </Field>
        <Field icon={<Radio className="h-3.5 w-3.5" />} label="Траффер">
          {lead.trafferName || "—"}
          {lead.trafferUsername ? (
            <span className="ml-1 text-slate-400">{lead.trafferUsername}</span>
          ) : null}
        </Field>
        <Field icon={<UserCircle2 className="h-3.5 w-3.5" />} label="Продажник">
          {lead.salesRep ? (
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {lead.salesRep.name}
            </span>
          ) : (
            <span className="italic text-slate-400">не назначен</span>
          )}
        </Field>
        <Field icon={<CalendarDays className="h-3.5 w-3.5" />} label="Добавлен">
          {fmtDate(lead.createdAt)}
        </Field>
      </div>

      {/* Quick action buttons */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2 dark:border-slate-800">
        {canTake && (
          <button
            onPointerDown={stop}
            onClick={() => onTake!(lead)}
            title="Закрепить этого лида за собой и взять в работу"
            className="inline-flex items-center gap-1 rounded-md bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-emerald-600"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Взять себе
          </button>
        )}
        {isRejected ? (
          <button
            onPointerDown={stop}
            onClick={() => onMoveStage(lead, flow[0].key)}
            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Вернуть в работу
          </button>
        ) : (
          <>
            {prev && (
              <button
                onPointerDown={stop}
                onClick={() => onMoveStage(lead, prev.key)}
                title={`Назад: ${prev.name}`}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Назад
              </button>
            )}
            {next && (
              <button
                onPointerDown={stop}
                onClick={() => onMoveStage(lead, next.key)}
                title={`Далее: ${next.name}`}
                className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-brand-700"
              >
                {next.name}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onPointerDown={stop}
              onClick={() => onMoveStage(lead, REJECTED_STAGE)}
              className="ml-auto inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
              <X className="h-3.5 w-3.5" />
              Отказ
            </button>
          </>
        )}
      </div>
    </div>
  );
}

type Props = {
  lead: Lead;
  stages: Stage[];
  onEdit: (lead: Lead) => void;
  onTogglePin: (lead: Lead) => void;
  onMoveStage: (lead: Lead, stageKey: string) => void;
  currentUser?: { id: string; role: "ADMIN" | "SALES" };
  onTake?: (lead: Lead) => void;
  overlay?: boolean;
};

/** Sortable, draggable card used inside the columns. */
export default function LeadCard(props: Props) {
  const { lead } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id, data: { type: "lead", lead } });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <LeadCardView
      {...props}
      innerRef={setNodeRef}
      style={style}
      isDragging={isDragging}
      handleProps={{ ...attributes, ...listeners }}
    />
  );
}
