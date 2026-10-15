import { type IntegrationOptions } from "./observation";
export type { IntegrationOptions } from "./observation";
export declare function wrapOpenAI<T extends object>(client: T, options?: IntegrationOptions): T;
export declare function wrapAnthropic<T extends object>(client: T, options?: IntegrationOptions): T;
