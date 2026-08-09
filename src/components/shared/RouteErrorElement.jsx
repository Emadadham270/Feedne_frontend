import { useState } from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function RouteErrorElement() {
  const error = useRouteError();
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  let errorMessage = 'An unexpected application error occurred.';
  let errorStatus = 'Error';
  let stackTrace = '';

  if (isRouteErrorResponse(error)) {
    errorStatus = `${error.status} ${error.statusText}`;
    errorMessage = error.data?.message || error.statusText || 'Page error response';
  } else if (error instanceof Error) {
    errorMessage = error.message;
    stackTrace = error.stack || '';
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object') {
    errorMessage = error.message || JSON.stringify(error);
  }

  const handleCopyDetails = () => {
    const textToCopy = `Error: ${errorMessage}\nStatus: ${errorStatus}\nStack:\n${stackTrace}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-950 text-white p-6 relative overflow-hidden select-none">
      {/* Background Subtle Gradient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-tertiary-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6 text-center backdrop-blur-xl">
        {/* Icon Header */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shadow-inner">
          <AlertTriangle size={32} />
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-widest inline-block">
            {errorStatus}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Oops! Something went wrong
          </h1>
          <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
            We ran into an unexpected problem displaying this page. Don't worry, your data is safe!
          </p>
        </div>

        {/* Error Callout Message */}
        <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-4 text-left">
          <p className="text-xs font-mono text-red-400 font-semibold break-words">
            {errorMessage}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={handleReload}
            className="w-full sm:w-auto gap-2 px-6 shadow-lg shadow-primary-500/20"
          >
            <RefreshCw size={16} />
            <span>Try Again</span>
          </Button>

          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outlined" size="md" className="w-full gap-2 px-6 border-neutral-700 hover:bg-neutral-800">
              <Home size={16} />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>

        {/* Collapsible Technical Details (Developer Accordion) */}
        {(stackTrace || errorMessage) && (
          <div className="pt-4 border-t border-neutral-800/80 text-left">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
            >
              <span>Developer Diagnostics Details</span>
              {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showDetails && (
              <div className="mt-3 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-500">Stack Trace</span>
                  <button
                    onClick={handleCopyDetails}
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="bg-black/90 p-3 rounded-xl border border-neutral-800 text-[11px] font-mono text-neutral-300 overflow-x-auto max-h-48 scrollbar-thin select-text">
                  {stackTrace || errorMessage}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
