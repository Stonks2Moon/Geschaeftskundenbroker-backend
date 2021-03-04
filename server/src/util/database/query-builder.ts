import { Query } from './query.model';

export class QueryBuilder {
    
    public static testQuery(): Query {
        return {
            query: "SELECT * FROM TABELLE",
            args: []
        }
    }
}