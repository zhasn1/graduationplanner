import { notFound } from "next/navigation";
import { PlannerBoard } from "@/components/planner/PlannerBoard";
import { getProgramPlan } from "@/lib/planner";

interface PlannerRouteProps {
  searchParams: Promise<{ program_id?: string }>;
}

const Planner = async ({ searchParams }: PlannerRouteProps) => {
  const { program_id } = await searchParams;
  const id = Array.isArray(program_id) ? program_id[0] : program_id;
  if (!id) notFound();

  const plan = getProgramPlan(id);
  if (!plan) notFound();

  return <PlannerBoard plan={plan} />;
};

export default Planner;
