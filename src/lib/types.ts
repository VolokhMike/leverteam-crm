// Client-facing shapes (JSON-serialized versions of the Prisma types).

export type Role = "ADMIN" | "SALES";

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
  producerName: string | null;
  notes: string | null;
  pinned: boolean;
  position: number;
  nicheId: string | null;
  stageId: string;
  salesRepId: string | null;
  createdAt: string;
  updatedAt: string;
  niche: Niche | null;
  stage: Stage;
  salesRep: SalesRep | null;
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
