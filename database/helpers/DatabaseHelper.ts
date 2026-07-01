export interface DatabaseHelper {

    execute(
        sql: string,
        params?: unknown[]
    ): Promise<void>;

    query<T>(
        sql: string,
        params?: unknown[]
    ): Promise<T[]>;

    first<T>(
        sql: string,
        params?: unknown[]
    ): Promise<T | null>;

}