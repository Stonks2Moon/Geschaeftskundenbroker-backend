import { Connector } from "../database/connector"
import { Query } from "../database/query.model"

/**
 * Call this function to clean up data base entries that were generated after testing
 * @param ids a list of ids of generated entries
 */
export async function cleanUp(ids: CleanUpIds): Promise<void> {
    let steps = [
        {
            // Depot related table entries
            ids: ids.depotIds,
            tables: [
                { name: "depot_entry", id: "depot_id" },
                { name: "share_order", id: "depot_id" },
                { name: "job", id: "depot_id" },
                { name: "depot", id: "depot_id" },
                { name: "liquidity_provider", id: "depot_id" }
            ]
        },
        {
            // Customer related table entries
            ids: ids.customerIds,
            tables: [
                { name: "customer_session", id: "customer_id" },
                { name: "customer", id: "customer_id" },
            ]
        },
        {
            // Company related table entries
            ids: ids.companyIds,
            tables: [
                { name: "bank_account", id: "company_id" },
                { name: "company", id: "company_id" },
            ]
        },
        {
            // Address related table entries
            ids: ids.addressIds,
            tables: [
                { name: "address", id: "address_id" }
            ]
        },
        {
            // Share related table entries
            ids: ids.shareIds,
            tables: [
                { name: "share_price", id: "share_id" },
                { name: "share", id: "share_id" }
            ]
        },

    ]

    for (const s of steps) {
        // Skip step if no ids
        if (s.ids.length === 0) continue

        for (const t of s.tables) {
            const query: Query = constructDeleteStatement(t.name, t.id, s.ids)
            try {
                await Connector.executeQuery(query)
            } catch (e) {
                console.log("Failed Query on CleanUp: ", query)
            }
        }

    }
}

function constructDeleteStatement(name: string, id: string, ids: any[]): Query {
    let base: string = `DELETE FROM ${name} WHERE `

    let conditionCounter = 0
    for (const i in ids) {
        if (!i) continue
        base += `${id} = ? OR `
        conditionCounter++
    }

    // Avoid syntax error when ids are undefined
    if (conditionCounter === 0) {
        return {
            query: base + "1=2;",
            args: []
        }
    }

    // Remove trailing AND
    base = base.slice(0, -4) + ";"

    // Return as query object
    return {
        query: base,
        args: [...ids]
    }
}

export interface CleanUpIds {
    customerIds: string[],
    depotIds: string[],
    companyIds: string[],
    addressIds: number[],
    shareIds: string[]
}
