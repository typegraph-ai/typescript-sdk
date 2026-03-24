export interface ParsedUrl {
    hostname: string;
    path: string;
    origin: string;
}
export declare function parseUrl(url: string): ParsedUrl | null;
export declare function normalizeUrl(url: string): string;
export declare function normalizePath(path: string): string;
export declare function isSameDomain(url: string, startUrl: string): boolean;
export declare function isSubdomain(url: string, startUrl: string): boolean;
export declare function matchesPattern(path: string, patterns: string[]): boolean;
//# sourceMappingURL=url-utils.d.ts.map