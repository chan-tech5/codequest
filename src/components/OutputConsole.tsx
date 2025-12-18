import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

interface OutputConsoleProps {
  output: string;
  isLoading: boolean;
  isSuccess?: boolean;
  isError?: boolean;
}

export const OutputConsole = ({ 
  output, 
  isLoading, 
  isSuccess, 
  isError 
}: OutputConsoleProps) => {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="font-mono text-sm text-muted-foreground">Output</span>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        {isSuccess && <CheckCircle2 className="h-4 w-4 text-primary" />}
        {isError && <XCircle className="h-4 w-4 text-destructive" />}
      </div>
      <pre className={`min-h-[120px] p-4 font-mono text-sm ${
        isError ? 'text-destructive' : isSuccess ? 'text-primary' : 'text-foreground'
      }`}>
        {isLoading ? (
          <span className="text-muted-foreground">Running your code...</span>
        ) : output || (
          <span className="text-muted-foreground">// Output will appear here</span>
        )}
      </pre>
    </div>
  );
};
