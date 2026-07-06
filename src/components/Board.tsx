"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Metrics from "@/components/Metrics";
import Filters from "@/components/Filters";
import Column from "@/components/Column";
import { LeadCardView } from "@/components/LeadCard";
import LeadModal from "@/components/LeadModal";
import { fetcher, mutateJson } from "@/lib/fetcher";
import type {
  Lead,
  Niche,
  Stage,
  Metrics as MetricsType,
  SalesRep,
} from "@/lib/types";

type Props = {
  user: { id: string; name?: string | null; role: "ADMIN" | "SALES" };
};

function positionForIndex(list: Lead[], index: number): number {
  if (list.length === 0) return 1000;
  if (index <= 0) return list[0].position - 1000;
  if (index >= list.length) return list[list.length - 1].position + 1000;
  return (list[index - 1].position + list[index].position) / 2;
}

export default function Board({ user }: Props) {
  const isAdmin = user.role === "ADMIN";

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [activeNiche, setActiveNiche] = useState<string | null>(null);
  const [onlyMine, setOnlyMine] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  // Активная вкладка этапа в мобильном виде.
  const [mobileStageId, setMobileStageId] = useState<string | null>(null);

  // Минимальное представление текущего пользователя как продажника —
  // для оптимистичного отображения после «взятия в работу».
  const meAsRep: SalesRep = {
    id: user.id,
    name: user.name ?? "Вы",
    username: "",
    telegram: null,
    role: user.role,
  };

  // Debounce the search input.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const params = new URLSearchParams();
  if (debounced) params.set("search", debounced);
  if (activeNiche) params.set("niche", activeNiche);
  const leadsKey = `/api/leads?${params.toString()}`;

  const { data: niches = [] } = useSWR<Niche[]>("/api/niches", fetcher);
  const { data: stages = [] } = useSWR<Stage[]>("/api/stages", fetcher);
  const { data: metrics, mutate: mutateMetrics } = useSWR<MetricsType>(
    "/api/metrics",
    fetcher,
  );
  const { data: salesReps = [] } = useSWR<SalesRep[]>(
    isAdmin ? "/api/users?role=SALES" : null,
    fetcher,
  );
  const {
    data: leads = [],
    isLoading,
    mutate,
  } = useSWR<Lead[]>(leadsKey, fetcher);

  const sensors = useSensors(
    // Мышь/тачпад: тащим сразу после сдвига на 6px.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    // Тач-экраны: перетаскивание стартует только после долгого нажатия (250мс).
    // Обычный свайп при этом скроллит доску/колонку, а не хватает карточку.
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Group leads by stage, sorted (pinned first, then position).
  // «Мои лиды» — клиентский фильтр: только карточки текущего продажника.
  const byStage = useMemo(() => {
    const visible = onlyMine
      ? leads.filter((l) => l.salesRepId === user.id)
      : leads;
    const map = new Map<string, Lead[]>();
    for (const s of stages) map.set(s.id, []);
    for (const l of visible) {
      if (!map.has(l.stageId)) map.set(l.stageId, []);
      map.get(l.stageId)!.push(l);
    }
    for (const [, list] of map) {
      list.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return a.position - b.position;
      });
    }
    return map;
  }, [leads, stages, onlyMine, user.id]);

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  function refresh() {
    mutate();
    mutateMetrics();
  }

  // ─── Quick actions ────────────────────────────────────────
  async function persist(id: string, patch: Record<string, unknown>, next: Lead[]) {
    mutate(next, { revalidate: false });
    try {
      await mutateJson(`/api/leads/${id}`, "PATCH", patch);
    } finally {
      refresh();
    }
  }

  // Should this move also claim the lead for the current sales rep?
  function shouldClaim(lead: Lead, targetKey: string) {
    return (
      user.role === "SALES" &&
      lead.salesRepId === null &&
      targetKey !== "cold"
    );
  }

  function onMoveStage(lead: Lead, stageKey: string) {
    const target = stages.find((s) => s.key === stageKey);
    if (!target || target.id === lead.stageId) return;
    const targetList = leads
      .filter((l) => l.stageId === target.id)
      .sort((a, b) => a.position - b.position);
    const position = positionForIndex(targetList, targetList.length);
    const claim = shouldClaim(lead, stageKey);
    const next = leads.map((l) =>
      l.id === lead.id
        ? {
            ...l,
            stageId: target.id,
            stage: target,
            position,
            ...(claim ? { salesRepId: user.id, salesRep: meAsRep } : {}),
          }
        : l,
    );
    // Server auto-assigns when a rep moves an unassigned lead out of «Холодные».
    persist(lead.id, { stageId: target.id, position }, next);
  }

  // «Взять себе»: закрепить лида за собой и перенести в «Новые».
  function onTake(lead: Lead) {
    const target = stages.find((s) => s.key === "new");
    if (!target) return;
    const targetList = leads
      .filter((l) => l.stageId === target.id)
      .sort((a, b) => a.position - b.position);
    const position = positionForIndex(targetList, targetList.length);
    const next = leads.map((l) =>
      l.id === lead.id
        ? {
            ...l,
            stageId: target.id,
            stage: target,
            position,
            salesRepId: user.id,
            salesRep: meAsRep,
          }
        : l,
    );
    persist(
      lead.id,
      { stageKey: "new", position, takeOwnership: true },
      next,
    );
  }

  function onTogglePin(lead: Lead) {
    const next = leads.map((l) =>
      l.id === lead.id ? { ...l, pinned: !l.pinned } : l,
    );
    persist(lead.id, { pinned: !lead.pinned }, next);
  }

  // ─── Drag & drop ──────────────────────────────────────────
  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;

    const dragged = leads.find((l) => l.id === active.id);
    if (!dragged) return;

    const overData = over.data.current as
      | { type?: string; stageId?: string; lead?: Lead }
      | undefined;

    let targetStageId: string | undefined;
    let overLead: Lead | undefined;
    if (overData?.type === "column") {
      targetStageId = overData.stageId;
    } else if (overData?.type === "lead") {
      overLead = overData.lead;
      targetStageId = overLead?.stageId;
    } else {
      targetStageId = String(over.id);
    }
    if (!targetStageId) return;

    const targetList = leads
      .filter((l) => l.stageId === targetStageId && l.id !== dragged.id)
      .sort((a, b) => a.position - b.position);

    let index = targetList.length;
    if (overLead && overLead.id !== dragged.id) {
      const oi = targetList.findIndex((l) => l.id === overLead!.id);
      if (oi >= 0) index = oi;
    }

    const position = positionForIndex(targetList, index);
    if (targetStageId === dragged.stageId && position === dragged.position) return;

    const targetStage = stages.find((s) => s.id === targetStageId);
    // Claim only on a real stage change out of «Холодные».
    const claim =
      targetStageId !== dragged.stageId &&
      !!targetStage &&
      shouldClaim(dragged, targetStage.key);
    const next = leads.map((l) =>
      l.id === dragged.id
        ? {
            ...l,
            stageId: targetStageId!,
            stage: targetStage ?? l.stage,
            position,
            ...(claim ? { salesRepId: user.id, salesRep: meAsRep } : {}),
          }
        : l,
    );
    persist(dragged.id, { stageId: targetStageId, position }, next);
  }

  const orderedStages = [...stages].sort((a, b) => a.order - b.order);

  // Валидная активная вкладка для мобильного вида (fallback — первый этап).
  const currentMobileStageId =
    mobileStageId && orderedStages.some((s) => s.id === mobileStageId)
      ? mobileStageId
      : orderedStages[0]?.id ?? null;
  const currentMobileStage = orderedStages.find(
    (s) => s.id === currentMobileStageId,
  );

  return (
    <>
      <Sidebar user={user} />
      <div className="flex min-h-screen flex-col pl-16 md:pl-60">
      <Header user={user} center={<Metrics metrics={metrics} />} />

      <div className="border-b border-stone-200/80 bg-sand-50/60 px-4 py-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900 lg:px-6">
        <Filters
          niches={niches}
          activeNiche={activeNiche}
          onNiche={setActiveNiche}
          search={search}
          onSearch={setSearch}
          onlyMine={onlyMine}
          onOnlyMine={setOnlyMine}
          canAdd
          onAdd={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        />
      </div>

      <main className="flex-1 overflow-hidden px-4 py-4 lg:px-6">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-slate-400">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Загрузка доски…
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          >
            {/* Мобильные вкладки этапов — видны только на телефоне */}
            <div className="mb-3 md:hidden">
              <div className="scrollbar-thin -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
                {orderedStages.map((stage) => {
                  const active = stage.id === currentMobileStageId;
                  const count = (byStage.get(stage.id) ?? []).length;
                  return (
                    <button
                      key={stage.id}
                      onClick={() => setMobileStageId(stage.id)}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                        active
                          ? "bg-brand-600 text-white shadow-card"
                          : "bg-white text-stone-600 ring-1 ring-stone-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700"
                      }`}
                    >
                      {stage.name}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-xs tabular-nums ${
                          active
                            ? "bg-white/25"
                            : "bg-stone-100 dark:bg-slate-800"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Мобильный вид — одна колонка на весь экран */}
            <div className="md:hidden">
              {currentMobileStage && (
                <Column
                  key={currentMobileStage.id}
                  stage={currentMobileStage}
                  leads={byStage.get(currentMobileStage.id) ?? []}
                  stages={orderedStages}
                  onEdit={(l) => {
                    setEditing(l);
                    setModalOpen(true);
                  }}
                  onTogglePin={onTogglePin}
                  onMoveStage={onMoveStage}
                  currentUser={{ id: user.id, role: user.role }}
                  onTake={onTake}
                  fluid
                  hideHeader
                />
              )}
            </div>

            {/* Десктоп — все колонки в ряд с горизонтальным скроллом */}
            <div className="scrollbar-thin hidden gap-4 overflow-x-auto pb-3 md:flex">
              {orderedStages.map((stage) => (
                <Column
                  key={stage.id}
                  stage={stage}
                  leads={byStage.get(stage.id) ?? []}
                  stages={orderedStages}
                  onEdit={(l) => {
                    setEditing(l);
                    setModalOpen(true);
                  }}
                  onTogglePin={onTogglePin}
                  onMoveStage={onMoveStage}
                  currentUser={{ id: user.id, role: user.role }}
                  onTake={onTake}
                />
              ))}
            </div>

            <DragOverlay>
              {activeLead ? (
                <div className="w-[280px]">
                  <LeadCardView
                    lead={activeLead}
                    stages={orderedStages}
                    onEdit={() => {}}
                    onTogglePin={() => {}}
                    onMoveStage={() => {}}
                    overlay
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      <LeadModal
        open={modalOpen}
        lead={editing}
        niches={niches}
        stages={orderedStages}
        salesReps={salesReps}
        isAdmin={isAdmin}
        onClose={() => setModalOpen(false)}
        onSaved={refresh}
      />
      </div>
    </>
  );
}
