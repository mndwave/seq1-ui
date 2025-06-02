export interface ButtonAnimationState {
  [key: string]: {
    action: "add" | "copy" | "delete"
    state: "grow" | "shrink"
  } | undefined
} 