export type NotificationDto = {
    id: string,
    title: string,
    text: string,
    createdDate: Date,
    updatedDate?: Date | null
}