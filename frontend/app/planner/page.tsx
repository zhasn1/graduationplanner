import { notFound } from "next/navigation";
import { PlannerBoard } from "@/components/planner/PlannerBoard";
import { getProgramPlan } from "@/lib/planner";

interface PlannerRouteProps {
  searchParams: Promise<{ program_id?: string }>;
}

const Planner = async ({ searchParams }: PlannerRouteProps) => {
  const { program_id } = await searchParams;
  if (!program_id) notFound();

  const plan = getProgramPlan(program_id);
  if (!plan) notFound();

  return <PlannerBoard plan={plan} />;
};

export default Planner;
