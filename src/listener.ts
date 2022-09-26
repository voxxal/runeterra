let HANDLES: Map<string, ((e: any) => boolean)[]> = new Map();

export const add = (e: string, handler: ((e: any) => boolean)) => {
    if (!HANDLES.has(e)) {
        HANDLES.set(e, []);
    }
    HANDLES.get(e)?.push(handler);
}

export const remove = (e: string, handler: ((e: any) => boolean)) => {
    HANDLES.get(e)?.filter((x) => x != handler);
}

export const emit = (e: string, eventData: any) => {
    HANDLES.get(e)?.filter((handler) => handler(eventData));
}