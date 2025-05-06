import { TariffDto } from "../Tariffs/TariffDto"

export type MembershipDto = {
    id: string,                
    totalCost: number,         
    monthQuantity: number,    
    branchId: string,
    tariff: TariffDto,        
    expiresDate: Date,     
    createdDate: Date,       
    updatedDate?: Date | null
  }