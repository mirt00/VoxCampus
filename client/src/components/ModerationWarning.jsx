const MESSAGES = {
  blocked_keyword: "Your post contains inappropriate language. Please revise and resubmit.",
  spam_pattern: "Your post looks like spam. Please write a genuine campus suggestion.",
  toxic_content: "Your post was flagged for harmful content. Please keep it respectful.",
  irrelevant: "Your post does not appear to be related to campus issues. Please describe a specific campus concern.",
};

export default function ModerationWarning({ reason, matched, layer, onDismiss }) {
  const message = MESSAGES[reason] || "Your post was blocked by content moderation.";

  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        {/* Warning triangle */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-red-700 text-sm mb-1">Post Blocked</p>
          <p className="text-red-600 text-sm leading-relaxed">{message}</p>

          {matched && (
            <p className="mt-2 text-xs text-red-400">
              Triggered by: <span className="font-semibold bg-red-100 px-1.5 py-0.5 rounded">{matched}</span>
            </p>
          )}

          {layer && (
            <p className="mt-1 text-xs text-red-300">Layer {layer} moderation</p>
          )}
        </div>

        <button onClick={onDismiss}
          className="flex-shrink-0 text-red-300 hover:text-red-500 transition-colors text-lg leading-none">
          ×
        </button>
      </div>
    </div>
  );
}
