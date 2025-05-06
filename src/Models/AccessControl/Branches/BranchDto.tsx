import { AddressDto } from "../../Shared/AddressDto";

export type BranchDto = {
    id: string,
    name?: string | null,
    maxOccupancy: number,
    currentClientQuantity: number,
    address: AddressDto
}