"use client";

import React, { useState, useEffect } from react;

interface YAMLValidatorGateProps {
  children: React.ReactNode;
}

interface ValidationState {
  valid: boolean;
  loading: boolean;
  error?: string;
  violations?: any[];
  system_status?: string;
}

const YAMLValidatorGate: React.FC<YAMLValidatorGateProps> = ({ children }) => {
  const [validation, setValidation] = useState<ValidationState>({
    valid: false,
    loading: true
  });

  const checkYAMLCompliance = async () => {
    try {
      setValidation(prev => ({ ...prev, loading: true }));
      
      const response = await fetch("/api/validate/yaml", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setValidation({
          valid: true,
          loading: false,
          system_status: OPERATIONAL
        });
      } else {
        const errorData = await response.json();
        setValidation({
          valid: false,
          loading: false,
          error: YAML Compliance Failed,
          violations: errorData.detail?.violations || [],
          system_status: DEGRADED
        });
      }
    } catch (error) {
      setValidation({
        valid: false,
        loading: false,
        error: YAML Validator Unreachable,
        system_status: OFFLINE
      });
    }
  };

  useEffect(() => {
    checkYAMLCompliance();
    
    // Check every 30 seconds
    const interval = setInterval(checkYAMLCompliance, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (validation.loading) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="bg-gray-900 border border-green-500 p-8 rounded-lg max-w-md text-center">
          <div className="text-green-500 text-xl mb-4">⚡ YAML VALIDATION</div>
          <div className="text-white">Checking system compliance...</div>
          <div className="mt-4 text-green-400 animate-pulse">TRUTH OR DIE</div>
        </div>
      </div>
    );
  }

  if (!validation.valid) {
    const criticalViolations = validation.violations?.filter(v => v.severity === CRITICAL) || [];
    
    return (
      <div className="fixed inset-0 bg-red-900/95 flex items-center justify-center z-50">
        <div className="bg-gray-900 border border-red-500 p-8 rounded-lg max-w-2xl">
          <div className="text-red-500 text-2xl mb-4 text-center">💀 SYSTEM HALT</div>
          <div className="text-white text-center mb-6">
            YAML COMPLIANCE FAILURE DETECTED
          </div>
          
          <div className="text-red-400 mb-4">
            Status: {validation.system_status}
          </div>
          
          {criticalViolations.length > 0 && (
            <div className="mb-6">
              <div className="text-red-400 mb-2">Critical Violations:</div>
              <div className="bg-black/50 p-4 rounded max-h-40 overflow-y-auto">
                {criticalViolations.slice(0, 5).map((violation, i) => (
                  <div key={i} className="text-red-300 text-sm mb-1">
                    🚫 {violation.type}: {violation.found || violation.issue || Unknown violation}
                  </div>
                ))}
                {criticalViolations.length > 5 && (
                  <div className="text-red-400 text-sm">
                    ... and {criticalViolations.length - 5} more violations
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="text-center">
            <button
              onClick={checkYAMLCompliance}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded mr-4"
            >
              Retry Validation
            </button>
            <div className="text-red-300 text-sm mt-4">
              System cannot proceed until YAML violations are resolved
            </div>
          </div>
          
          <div className="text-center mt-6 text-red-500 font-mono">
            YAML IS GOSPEL | TRUTH OR DIE
          </div>
        </div>
      </div>
    );
  }

  // YAML compliance verified - render children
  return <>{children}</>;
};

export default YAMLValidatorGate;
