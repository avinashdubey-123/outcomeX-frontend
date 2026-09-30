// interface Window {
//   ethereum?: {
//     request: (args: { method: string; params?: string[] }) => Promise<string[]>
//     on: (event: string, handler: (...args: string[]) => void) => void
//     removeListener: (event: string, handler: (...args: string[]) => void) => void
//   }
// }

// src/global.d.ts
interface Window {
  ethereum?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    on: (event: string, handler: (...args: unknown[]) => void) => void
  }
}
