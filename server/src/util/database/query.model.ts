// Model einer Query für Datenbankabfragen
export interface Query {
    query: string, 
    args: any[]
}