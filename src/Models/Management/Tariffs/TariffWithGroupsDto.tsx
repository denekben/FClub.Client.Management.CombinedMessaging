import { ServiceDto } from "../Services/ServiceDto";
import { SocialGroupDto } from "../SocialGroups/SocialGroupDto";

export type TariffWithGroupsDto = {
    id: string,
    name: string,
    priceForNMonths: Record<number, number>,
    discountForSocialGroup?: DiscountForSocialGroupDto[] | null,
    allowMultiBranches: boolean,
    services: ServiceDto[],
    createdDate: Date,
    updatedDate?: Date | null,
}

export type DiscountForSocialGroupDto = {
    socialGroupDto: SocialGroupDto,
    dicsountValue: number
}