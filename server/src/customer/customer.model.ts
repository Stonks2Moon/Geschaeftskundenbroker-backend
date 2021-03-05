import { Company } from "src/company/company.model";

// Modell eines Nutzers
export interface Customer {
    customerId?: string,
    firstName: string,
    lastName: string,
    email: string,
    company?: Company,
    password?: string,
    companyCode?: string
}