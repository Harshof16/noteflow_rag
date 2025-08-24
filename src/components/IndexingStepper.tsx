// components/IndexingStepper.tsx
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Scissors, BrainCircuit, Database, Check, AlertTriangle } from "lucide-react";
import clsx from "clsx";

const STEPS = [
  { key: 'uploading',   label: 'Uploading',   Icon: Upload },
  { key: 'parsing',     label: 'Parsing',     Icon: FileText },
  { key: 'chunking',    label: 'Chunking',    Icon: Scissors },
  { key: 'embedding',   label: 'Generating embeddings', Icon: BrainCircuit },
  { key: 'persisting',  label: 'Saving to vector DB',   Icon: Database },
] as const;

export function IndexingStepper({
  stage,
  progress = 0,
  error,
}: { stage: string; progress?: number; error?: string; }) {
  return (
    <div className="space-y-3 mt-2">
      <div className="space-y-2">
        {STEPS.map(({ key, label, Icon }) => {
          const state =
            error ? 'error'
            : key === stage ? 'active'
            : ['ready'].includes(stage) || STEPS.findIndex(s => s.key === s.key) < STEPS.findIndex(s => s.key === stage)
              ? 'done'
              : 'idle';

          return (
            <div key={key} className="flex items-center gap-2">
              <div className={clsx(
                "size-6 rounded-full flex items-center justify-center border",
                state === 'done' && "bg-green-50 border-green-200",
                state === 'active' && "bg-blue-50 border-blue-200 animate-pulse",
                state === 'idle' && "bg-gray-50 border-gray-200",
                state === 'error' && "bg-red-50 border-red-200"
              )}>
                {state === 'done' ? <Check className="size-4" /> :
                 state === 'error' ? <AlertTriangle className="size-4" /> :
                 <Icon className="size-4" />}
              </div>
              <div className="text-sm">{label}</div>
              <div className="ml-auto">
                {state === 'active' && <Badge variant="secondary">in progress</Badge>}
                {state === 'done' && <Badge className="bg-green-100 text-green-700 hover:bg-green-100">done</Badge>}
              </div>
            </div>
          );
        })}
      </div>
      <Progress value={error ? 0 : progress} />
      <div className="text-xs text-muted-foreground">
        {error ? `Failed: ${error}` :
         stage === 'ready' ? 'Indexed and ready' :
         'Indexing...'}
      </div>
    </div>
  );
}
