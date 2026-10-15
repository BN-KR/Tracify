import { StepsExplorer } from "@/components/dashboard/tracing/steps-explorer";
export default async function StepsPage({params,searchParams}:{params:Promise<{projectId:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}) {
 const {projectId}=await params;const raw=await searchParams;const initialQuery=Object.fromEntries(Object.entries(raw).filter((entry):entry is [string,string]=>typeof entry[1]==="string").map(([k,v])=>[k,v.slice(0,200)]));return <StepsExplorer projectId={projectId} initialQuery={initialQuery}/>;
}
