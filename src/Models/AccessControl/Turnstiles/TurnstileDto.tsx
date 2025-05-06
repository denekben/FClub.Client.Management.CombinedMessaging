export type TurnstileDto = {
    id: string,
    name?: string | null,
    isMain: boolean,
    branchId: string,
    service?: ServiceDto | null,
    createdDate: Date,
    updatedDate?: Date | null
}

export type ServiceDto = {
    id: string,
    name: string 
}