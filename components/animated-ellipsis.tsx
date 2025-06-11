"use client"

export function AnimatedEllipsis() {
  return (
    <>
      <style jsx>{`
        .ellipsis-text-container {
          display: inline-block; /* Allows vertical-align to work as expected */
          vertical-align: bottom; /* Aligns baseline of dots with text more reliably */
          line-height: 1; /* Prevents extra space if font has large line-height */
          margin-left: 0.05em; /* Reduced space after preceding text for a tighter look */
        }
        .text-dot {
          display: inline-block; /* Required for transform and opacity animations */
          opacity: 0.3; /* Initial and end state for the dots */
          /* font-weight: bold; */ /* Removed to match surrounding text weight */
          animation: pulse-text-dot 1.8s infinite ease-in-out;
          padding-left: 0.05em; /* Minimal padding to create slight separation */
          padding-right: 0.05em; /* Minimal padding to create slight separation */
        }
        /* Adjust first and last dot slightly if needed to simulate kerning with text */
        .dot-1 {
          animation-delay: 0s;
          /* padding-left: 0; */ /* Example: if first dot needs to be tighter to text */
        }
        .dot-2 {
          animation-delay: 0.25s; /* Stagger for the wave effect */
        }
        .dot-3 {
          animation-delay: 0.5s; /* Further stagger */
          /* padding-right: 0; */ /* Example: if last dot needs less trailing space */
        }
        @keyframes pulse-text-dot {
          0% {
            opacity: 0.3;
            transform: scale(0.9);
          }
          25% { /* Peak of the individual dot's pulse */
            opacity: 1;
            transform: scale(1.15); /* Slightly more pronounced pulse */
          }
          50% { /* Start fading back */
            opacity: 0.3;
            transform: scale(0.9);
          }
          100% { /* Hold the faded state for the rest of the cycle */
            opacity: 0.3;
            transform: scale(0.9);
          }
        }
      `}</style>
      <span className="ellipsis-text-container" aria-label="loading animation">
        <span className="text-dot dot-1">.</span>
        <span className="text-dot dot-2">.</span>
        <span className="text-dot dot-3">.</span>
      </span>
    </>
  )
}
