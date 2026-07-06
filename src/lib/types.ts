// Client-facing shapes (JSON-serialized versions of the Prisma types).

export type Role = "ADMIN" | "SALES" | "TRAFFER";

export type Niche = {
  id: string;
  key: string;
  name: string;
  color: string;
  order: number;
};

export type Stage = {
  id: string;
  key: string;
  name: string;
  color: string;
  order: number;
};

export type SalesRep = {
  id: string;
  name: string;
  username: string;
  telegram: string | null;
  role: Role;
};

export type Lead = {
  id: string;
  title: string;
  telegramLink: string | null;
  username: string | null;
  trafferName: string | null;
  trafferUsername: string | null;
  notes: string | null;
  pinned: boolean;
  position: number;
  nicheId: string | null;
  stageId: string;
  salesRepId: string | null;
  trafferId: string | null;
  createdAt: string;
  updatedAt: string;
  niche: Niche | null;
  stage: Stage;
  salesRep: SalesRep | null;
  traffer: SalesRep | null;
};

export type Metrics = {
  total: number;
  inWork: number;
  inQueue: number;
  bought: number;
  byStage: Record<string, number>;
};

export type Employee = {
  id: string;
  name: string;
  username: string;
  telegram: string | null;
  role: Role;
  active: boolean;
  createdAt: string;
  _count: { leads: number };
};

export type EmployeeDetail = Employee & { leads: Lead[] };

// ─── Статистика команды ─────────────────────────────────────

// Статистика трафера: качество приведённого трафика.
export type TrafferStats = {
  totalLeads: number; // всего приведено
  qualified: number; // дошли до «Квалифицированные» и дальше
  bought: number; // купили
  rejected: number; // отказ
  qualifiedRate: number; // % квалификации
  boughtRate: number; // % конверсии в покупку
};

// Статистика продажника: воронка закреплённых лидов.
export type SalesStats = {
  totalLeads: number; // всего закреплено
  inWork: number; // в работе (не купили и не отказ)
  bought: number; // закрыто (купили)
  rejected: number; // отказ
  winRate: number; // % выигранных сделок
};

// Член команды в списке «Команда / Статистика».
export type TeamMember = Employee & {
  traffer?: TrafferStats;
  sales?: SalesStats;
};

export type TeamMemberDetail = TeamMember & {
  telegram: string | null;
  byStage: Record<string, number>; // распределение лидов по этапам
  recentLeads: Lead[];
};
