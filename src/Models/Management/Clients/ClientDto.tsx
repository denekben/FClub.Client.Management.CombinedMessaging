import { MembershipDto } from "../Memberships/MembershipDto";
import { FullNameDto } from "../../Shared/FullNameDto";
import { SocialGroupDto } from "../SocialGroups/SocialGroupDto";

export type ClientDto = {
    id: string,                  
    fullName: FullNameDto,        
    phone?: string | null,         
    email: string,
    isStaff: boolean,
    allowEntry: boolean,
    allowNotifications: boolean,
    membership?: MembershipDto | null,
    socialGroup?: SocialGroupDto | null,
    createdDate: Date,
    updatedDate?: Date | null,
  }