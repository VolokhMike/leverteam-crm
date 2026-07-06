"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import LeadCard from "@/components/LeadCard";
import { colorClasses } from "@/lib/constants";
import type { Lead, Stage } from "@/lib/types";

type Props = {
  stage: Stage;
  leads: Lead[];
  stages: Stage[];
  onEdit: (lead: Lead) => void;
  onTogglePin: (lead: Lead) => void;
  onMoveStage: (lead: Lead, stageKey: string) => void;
  currentUser?: { id: string; role: "ADMIN" | "SALES" | "TRAFFER" };
  onTake?: (lead: Lead) => void;
  /** Растянуть колонку на всю ширину (мобильный вид с вкладками). */
  fluid?: boolean;
  /** Скрыть заголовок колонки (на мобилке его заменяют вкладки). */
  hideHeader?: boolean;
};

export default function Column({
  stage,
  leads,
  stages,
  onEdit,
  onTogglePin,
  onMoveStage,
  currentUser,
  onTake,
  fluid = false,
  hideHeader = false,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { type: "column", stageId: stage.id },
  });
  const c = colorClasses(stage.color);

  return (
    <div
      className={`flex flex-col ${
        fluid ? "w-full" : "w-[288px] shrink-0"
      }`}
    >
      {/* Column header */}
      {!hideHeader && (
        <div className="mb-2.5 flex items-center gap-2 px-1">
          <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
          <h3 className="text-sm font-bold text-stone-800 dark:text-slate-100">
            {stage.name}
          </h3>
          <span className="rounded-full bg-stone-200/80 px-2 py-0.5 text-xs font-semibold tabular-nums text-stone-600 dark:bg-slate-800 dark:text-slate-300">
            {leads.length}
          </span>
        </div>
      )}

      {/* Droppable body */}
      <div
        ref={setNodeRef}
        className={`scrollbar-thin flex flex-1 flex-col gap-2 overflow-y-auto rounded-2xl p-2 transition ${
          fluid
            ? "max-h-[calc(100dvh-232px)]"
            : "max-h-[calc(100vh-210px)]"
        } ${
          isOver
            ? "bg-brand-50 ring-2 ring-inset ring-brand-300 dark:bg-brand-600/10 dark:ring-brand-500/40"
            : "bg-stone-100/70 dark:bg-slate-900/40"
        }`}
      >
        <SortableContext
          items={leads.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              stages={stages}
              onEdit={onEdit}
              onTogglePin={onTogglePin}
              onMoveStage={onMoveStage}
              currentUser={currentUser}
              onTake={onTake}
            />
          ))}
        </SortableContext>

        {leads.length === 0 && (
          <div className="flex flex-1 items-center justify-center py-8 text-xs text-slate-400">
            Перетащите карточку сюда
          </div>
        )}
      </div>
    </div>
  );
}
