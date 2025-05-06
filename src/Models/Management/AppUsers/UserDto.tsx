import { FullNameDto } from "../../Shared/FullNameDto"
import { RoleDto } from "./RoleDto"

export type UserDto = {
    id: string,
    fullName: FullNameDto,
    phone?: string,
    email: string,
    isBlocked: boolean,
    allowEntry: boolean,
    role: RoleDto,
    createdDate: Date,
    updatedDate?: Date
}