/**
 * UI DEATH CHECK - DETERMINES IF UI SHOULD RENDER OR DIE
 * CHECKS FOR UI_DEATH_STATE.json
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

export interface UIDeathState {
  ui_killed: boolean;
  death_reason: string;
  timestamp: string;
  violation_count: number;
  fatal_failures: string[];
}

export function checkUIDeathState(): UIDeathState | null {
  const deathFilePath = join(process.cwd(), "UI_DEATH_STATE.json");
  
  try {
    if (existsSync(deathFilePath)) {
      const deathStateRaw = readFileSync(deathFilePath, "utf-8");
      const deathState: UIDeathState = JSON.parse(deathStateRaw);
      
      if (deathState.ui_killed) {
        return deathState;
      }
    }
    return null;
  } catch (error) {
    console.error("Error checking UI death state:", error);
    return null;
  }
}

export function isUIAlive(): boolean {
  return checkUIDeathState() === null;
}
