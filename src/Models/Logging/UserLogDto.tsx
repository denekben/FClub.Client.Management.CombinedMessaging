export type UserLogDto = {
    id: string,
    appUserId?: string,
    serviceName: string,
    text: string,
    createdDate: Date,
    updatedDate?: Date
}