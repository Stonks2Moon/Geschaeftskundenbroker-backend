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
            query: "INSERT INTO customer_session (session_id, customer_id, expiration_date) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR));",
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

    public static getCompanyByCompanyCode(companyCode: string): Query {
        return {
            query: "SELECT * FROM company WHERE company_code = ?;",
            args: [
                companyCode
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

    public static testQuery(): Query {
        return {
            query: "SELECT * FROM TABELLE",
            args: []
        }
    }
}