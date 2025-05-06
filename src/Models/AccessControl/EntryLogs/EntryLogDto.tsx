export type EntryLogDto = {
    id: string,           
    clientId: string,
    clientFullName: string,
    turnstileId: string,
    branchName?: string | null,
    serviceName?: string | null,
    entryType: string,
    createdDate: Date,
    updatedDate: Date
}