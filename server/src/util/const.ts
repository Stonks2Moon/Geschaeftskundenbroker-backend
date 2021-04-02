// Diese Datei beinhaltet alle verwendeten Konstanten

/*------------- Customer -------------*/
export const HASH_SALT_ROUNDS = 10

/*------------- Share -------------*/
export const DEFAULT_SEARCH_LIMIT = 20

/*------------- API URLS -------------*/
export const STOCK_EXCHANGE_API_URL = "ws://boerse.moonstonks.space:16001"
export const WEBHOOK_BASE_URL = "https://business.moonstonks.space/api/webhook"

/*------------- ALGORITHM -------------*/
export const ALG_SPLIT_THRESHOLD = 10_000
export const ALG_SPLIT_BATCH_VALUE = 5_000
export const ALGORITHMS = {
    NO_ALG: 0,
    SPLIT_ALG: 1
}

/*------------- JOB -------------*/
export const JOB_TYPES = {
    PLACE: "place",
    DELETE: "delete",
    // MATCH: "match",
    // COMPLETE: "complete"
}

/*------------- ShareOrder -------------*/
export const ORDER = {
    TYPE: {
        BUY: "buy",
        SELL: "sell"
    },
    DETAIL: {
        MARKET: "market",
        LIMIT: "limit",
        STOP: "stop",
        STOP_LIMIT: "stopLimit"
    }
}