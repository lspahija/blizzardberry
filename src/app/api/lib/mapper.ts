import parse from "@bany/curl-to-json";
import {HttpModel, Method} from "@/app/api/lib/model";

export function map(curl: string): HttpModel {
    const resultJSON = parse(curl);

    return {
        url: resultJSON.url,
        method: resultJSON.method ? (resultJSON.method.toUpperCase() as Method) : ('GET' as Method),
        headers: resultJSON.header || undefined,
        queryParams: resultJSON.params || undefined,
        body: resultJSON.data || undefined,
    };
}