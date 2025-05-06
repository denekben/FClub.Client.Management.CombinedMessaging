export type GetCurrentUserLogs = {
    textSearchPhrase?: string | null,
    sortByCreatedDate?: boolean | null,
    pageNumber?: number,
    pageSize?: number
}

export type GetLogs = {
    userId?: string | null,
    textSearchPhrase?: string | null,
    sortByCreatedDate?: boolean | null,
    pageNumber?: number,
    pageSize?: number
}