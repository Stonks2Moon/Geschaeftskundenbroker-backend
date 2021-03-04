import { Query } from './query.model';

export class QueryBuilder {
    
    public static getCostumerByLoginCredentials(email: string): Query {
        return {
            query: "SELECT * FROM customer WHERE email = ?;",
            args: [
                email
            ]
        }
    }

    public static deleteOldCostumerSessions(costumerId: string): Query {
        return {
            query: "DELETE FROM customer_session WHERE costumer_id = ? OR CURRENT_DATE() > expiration_date",
            args: [
                costumerId
            ]
        }
    }

    public static createCostumerSession(costumerId: string, sessionId: string): Query {
        return {
            query: "INSERT INTO costumer_session (session_id, costumer_id, expiration_date) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR));",
            args: [
                costumerId,
                sessionId
            ]
        }
    }

    public static refreshCostumerSession(costumerId: string, sessionId: string): Query {
        return {
            query: "UPDATE costumer_session SET expiration_date = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE costumer_id = ? AND session_id = ?;",
            args: [
                costumerId,
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