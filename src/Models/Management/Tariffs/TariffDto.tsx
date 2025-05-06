import { ServiceDto } from "../Services/ServiceDto";

export type TariffDto = {
    id: string,
    name: string,
    priceForNMonths: Record<number, number>,
    discountForSocialGroup?: Record<string, number> | null,
    allowMultiBranches: boolean,
    services: ServiceDto[],
    createdDate: Date,
    updatedDate?: Date | null,
}