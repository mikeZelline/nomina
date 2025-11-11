declare module '@primeuix/utils' {
  export type EventBus = any;
  export const eventBus: any;
  export interface EventBusOptions {
    on(type: string, handler: (evt: unknown) => void): void;
    off(type: string, handler: (evt: unknown) => void): void;
    emit(type: string, evt?: unknown): void;
    clear(): void;
  }
  export const uuid: () => string;
  export const zIndex: any;
  export const objectUtils: any;
  export const domHandler: any;
  export const classNames: (...values: any[]) => string;
  export const mergeProps: (...props: any[]) => any;
  export const cn: (...values: any[]) => string;
}

declare module '@primeuix/utils/eventbus' {
  export interface EventBusOptions {
    on(type: string, handler: (evt: unknown) => void): void;
    off(type: string, handler: (evt: unknown) => void): void;
    emit(type: string, evt?: unknown): void;
    clear(): void;
  }
  export function EventBus(): EventBusOptions;
}

declare module '@primeuix/utils/*' {
  const value: any;
  export default value;
}

declare module '@primeuix/styled' {
  export type StyleType = any;
  export interface StyledComponentOptions {
    name?: string;
    as?: any;
    [key: string]: any;
  }

  export function styled(component: any, options?: StyledComponentOptions): any;
  export type Styled = typeof styled;
  export const Styled: Styled;
  export function definePreset<T extends Record<string, unknown>>(...presets: T[]): T;
  export function usePreset<T extends Record<string, unknown>>(...presets: T[]): T;
  export function updatePreset<T extends Record<string, unknown>>(...presets: T[]): T;
  export function updatePrimaryPalette<T = unknown, P = unknown>(palette?: T): P;
  export function updateSurfacePalette<T = unknown, P = unknown>(palette?: T): P;
  export function useTheme<T = unknown>(theme: T): T;
  export const ThemeService: any;
  export const ThemeUtils: any;
  export const Theme: any;
  export const css: any;
}

declare module '@primeuix/themes' {
  const value: any;
  export default value;
}

declare module '@primeuix/themes/*' {
  const value: any;
  export default value;
}

