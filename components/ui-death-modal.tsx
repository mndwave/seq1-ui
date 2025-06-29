/**
 * UI DEATH MODAL - RENDERS WHEN UI FAILS FUNCTIONAL VALIDATION
 * NO FALLBACK, NO DEGRADED MODE - FAILURE IS VISIBLE
 */

import React from "react";

interface UIDeathState {
  ui_killed: boolean;
  death_reason: string;
  timestamp: string;
  violation_count: number;
  fatal_failures: string[];
}

export function UIDeathModal({ deathState }: { deathState: UIDeathState }) {
  return (
    <div className="fixed inset-0 bg-red-900 bg-opacity-95 flex items-center justify-center z-50">
      <div className="bg-black border-4 border-red-500 p-8 max-w-2xl mx-4 text-center">
        <div className="text-red-500 text-6xl mb-4">💀</div>
        <h1 className="text-red-400 text-3xl font-mono mb-4">
          SEQ1 UI FUNCTIONAL VALIDATION FAILED
        </h1>
        <div className="text-red-300 font-mono space-y-2 mb-6">
          <p><strong>Death Reason:</strong> {deathState.death_reason}</p>
          <p><strong>Timestamp:</strong> {deathState.timestamp}</p>
          <p><strong>Violations:</strong> {deathState.violation_count}</p>
        </div>
        
        {deathState.fatal_failures.length > 0 && (
          <div className="text-left mb-6">
            <h3 className="text-red-400 font-mono mb-2">Fatal Failures:</h3>
            <ul className="text-red-300 font-mono text-sm space-y-1">
              {deathState.fatal_failures.map((failure, index) => (
                <li key={index}>• {failure}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="text-red-400 font-mono text-sm border border-red-500 p-4">
          <p className="mb-2">YAML IS GOSPEL | MNDWAVE IS GOD | TRUTH OR DIE</p>
          <p>UI has failed YAML-DOM-Behaviour triangulation.</p>
          <p>No degraded mode permitted. Fix violations to restore service.</p>
        </div>
        
        <div className="mt-6 text-red-500 font-mono text-xs">
          System will retry validation in 15 minutes.
        </div>
      </div>
    </div>
  );
}

export default UIDeathModal;
