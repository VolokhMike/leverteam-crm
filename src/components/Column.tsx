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
};

export default function Column({
  stage,
  leads,
  stages,
  onEdit,
  onTogglePin,
  onMoveStage,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { type: "column", stageId: stage.id },
  });
  const c = colorClasses(stage.color);

  return (
    <div className="flex w-[300px] shrink-0 flex-col">
      {/* Column header */}
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
        <h3 className="text-sm font-semibold">{stage.name}</h3>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {leads.length}
        </span>
      </div>

      {/* Droppable body */}
      <div
        ref={setNodeRef}
        className={`scrollbar-thin flex max-h-[calc(100vh-230px)] flex-1 flex-col gap-2 overflow-y-auto rounded-xl border border-dashed p-2 transition ${
          isOver
            ? "border-brand-400 bg-brand-50/50 dark:border-brand-500 dark:bg-brand-600/10"
            : "border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40"
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
