import { ServiceDto } from "../Services/ServiceDto"
import { AddressDto } from "../../Shared/AddressDto"

export type BranchDto = {
    id: string,
    name?: string | null,
    maxOccupancy: number,
    address: AddressDto,
    services?: ServiceDto[] | null,
    createdDate: Date,
    updatedDate?: Date | null
}