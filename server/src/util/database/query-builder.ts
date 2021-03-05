import { Query } from './query.model';

export class QueryBuilder {
    
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
            query: "DELETE FROM customer_session WHERE customer_id = ? OR CURRENT_DATE() > expiration_date",
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

    public static testQuery(): Query {
        return {
            query: "SELECT * FROM TABELLE",
            args: []
        }
    }
}