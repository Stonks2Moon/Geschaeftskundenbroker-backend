import { Address } from 'src/company/address.model';
import { Company } from 'src/company/company.model';
import { Query } from './query.model';

export class QueryBuilder {

    public static createCustomer(customer: {
        customerId: string
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        companyId: string
    }): Query {
        return {
            query: "INSERT INTO customer (customer_id, first_name, last_name, email, password_hash, company_id) VALUES (?, ?, ?, ?, ?, ?);",
            args: [
                customer.customerId,
                customer.firstName,
                customer.lastName,
                customer.email,
                customer.password,
                customer.companyId
            ]
        }
    }

    public static createCompany(company: Company, addressId: number): Query {
        return {
            query: "INSERT INTO company (company_id, company_code, company_name, address_id) VALUES (?, ?, ?, ?)",
            args: [
                company.companyId,
                company.companyCode,
                company.companyName,
                addressId
            ]
        }
    }

    public static getCustomerByLoginCredentials(email: string): Query {
        return {
            query: "SELECT * FROM customer WHERE email = ?;",
            args: [
                email
            ]
        }
    }

    public static deleteOldCustomerSessions(customerId: string): Query {
        return {
            query: "DELETE FROM customer_session WHERE customer_id = ? OR CURRENT_DATE() > expiration_date;",
            args: [
                customerId
            ]
        }
    }

    public static createCustomerSession(customerId: string, sessionId: string): Query {
        return {
            query: "INSERT INTO customer_session (customer_id, session_id, expiration_date) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR));",
            args: [
                customerId,
                sessionId
            ]
        }
    }

    public static refreshCustomerSession(customerId: string, sessionId: string): Query {
        return {
            query: "UPDATE customer_session SET expiration_date = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE customer_id = ? AND session_id = ?;",
            args: [
                customerId,
                sessionId
            ]
        }
    }

    public static getCustomerSessionByIds(customerId: string, sessionId: string): Query {
        return {
            query: "SELECT * FROM customer_session WHERE customer_id = ? AND session_id = ?;",
            args: [
                customerId,
                sessionId
            ]
        }
    }

    public static getCustomerById(customerId: string): Query {
        return {
            query: "SELECT * FROM customer WHERE customer_id = ?;",
            args: [
                customerId
            ]
        }
    }

    public static getCompanyById(companyId: string): Query {
        return {
            query: "SELECT * FROM company WHERE company_id = ?;",
            args: [
                companyId
            ]
        }
    }

    public static getAllCompanies(): Query {
        return {
            query: "SELECT c.*, a.post_code, a.city, a.street, a.house_number FROM company AS c JOIN address AS a ON c.address_id = a.address_id ORDER BY c.company_name ASC;",
            args: []
        }
    }

    public static getCompanyByCompanyCode(companyCode: string): Query {
        return {
            query: "SELECT * FROM company WHERE company_code = ?;",
            args: [
                companyCode
            ]
        }
    }

    public static createAddress(address: Address): Query {
        return {
            query: "INSERT INTO address (post_code, city, street, house_number) VALUES (?, ?, ?, ?);",
            args: [
                address.postCode,
                address.city,
                address.street,
                address.houseNumber
            ]
        }
    }

    public static getAddressById(addressId: string): Query {
        return {
            query: "SELECT * FROM address WHERE address_id = ?;",
            args: [
                addressId
            ]
        }
    }

    public static createDepot(depotId: string, companyId: string, name: string, description: string): Query {
        return {
            query: "INSERT INTO depot (depotId, company_id, name, description) VALUES (?, ?, ?, ?);",
            args: [
                depotId,
                companyId,
                name,
                !description ? "" : description
            ]
        }
    }

    public static getDepotByCompanyId(companyId: string): Query {
        return {
            query: "SELECT * FROM depot WHERE company_id = ?;",
             args: [
                 companyId
             ]
        }
    }

    public static getDepotEntriesByDepotId(depotId: string): Query {
        return {
            query: "SELECT * FROM depot_entry AS d JOIN share AS s ON d.share_id = s.share_id WHERE d.depot_id = ?;",
            args: [
                depotId
            ]
        }
    }

    public static getDepotEntriesForShare(depotId: string, shareId: number): Query {
        return {
            query: "SELECT * FROM depot_entry WHERE depot_id = ? AND share_id = ?;",
            args: [
                depotId,
                shareId
            ]
        }
    }


    public static getDepotById(depotId: string): Query {
        return {
            query: "SELECT * FROM depot WHERE depot_id = ?;",
            args: [
                depotId
            ]
        }
    }

    // public static testQuery(): Query {

    public static getAllShares(resultLimit: number): Query {
        return {
            query: "SELECT share_id, isin, wkn, last_recorded_value, name, currency_code, currency_name FROM share JOIN currency ON share.currency_code = currency.iso_code LIMIT ?;",
            args: [
                resultLimit
            ]
        }
    }

    public static getShareById(shareId: number): Query {
        return {
            query: "SELECT share_id, isin, wkn, last_recorded_value, name, currency_code, currency_name FROM share JOIN currency ON share.currency_code = currency.iso_code WHERE share_id = ?;",
            args: [
                shareId
            ]
        }
    }

    public static getSharesByIsin(isin: string, resultLimit: number): Query {
        return {
            query: "SELECT share_id, isin, wkn, last_recorded_value, name, currency_code, currency_name FROM share JOIN currency ON share.currency_code = currency.iso_code WHERE isin = ? LIMIT ?;",
            args: [
                isin,
                resultLimit
            ]
        }
    }

    public static getSharesByWkn(wkn: string, resultLimit: number): Query {
        return {
            query: "SELECT share_id, isin, wkn, last_recorded_value, name, currency_code, currency_name FROM share JOIN currency ON share.currency_code = currency.iso_code WHERE wkn = ? LIMIT ?;",
            args: [
                wkn,
                resultLimit
            ]
        }
    }

    public static getSharesByName(shareName: string, resultLimit: number): Query {
        return {
            query: `SELECT share_id, isin, wkn, last_recorded_value, name, currency_code, currency_name FROM share JOIN currency ON share.currency_code = currency.iso_code WHERE name LIKE '%${shareName}%' LIMIT ?;`,
            args: [
                resultLimit
            ]
        }
    }

    public static getSharesBySearch(search: string, resultLimit: number): Query {
        return {
            query: `SELECT share_id, isin, wkn, last_recorded_value, name, currency_code, currency_name FROM share JOIN currency ON share.currency_code = currency.iso_code WHERE name LIKE '%${search}%' OR wkn = ? OR isin = ? LIMIT ?;`,
            args: [
                search,
                search,
                resultLimit
            ]
        }
    }

    public static getHistoricalData(shareId: number, fromDate: Date, toDate: Date): Query {
        return {
            query: "SELECT * FROM share_price WHERE share_id = ? AND recorded_at >= ? AND recorded_at <= ?;",
            args: [
                shareId,
                fromDate,
                toDate
            ]
        }
    }
}