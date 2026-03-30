import { Stream } from "stream";

declare function create_export(stream: Stream, data: any[]): Promise<void>;
declare function monthly_summary(stream: Stream, data: any[], enddate: string, rate: string): Promise<void>;

declare const _default: {
    create_export: typeof create_export;
    monthly_summary: typeof monthly_summary;
};

export default _default;
