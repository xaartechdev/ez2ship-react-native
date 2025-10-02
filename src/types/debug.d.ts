// TypeScript declarations for VS Code debugging utilities
declare global {
  var debugBreakpoint: (label: string, data?: any) => void;
  var logApiData: (operation: string, data?: any) => void;
}

export {};