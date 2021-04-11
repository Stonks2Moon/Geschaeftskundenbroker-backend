// Diese Datei beinhaltet alle verwendeten Konstanten

/*------------- Customer -------------*/
export const HASH_SALT_ROUNDS = 10

/*------------- Share -------------*/
export const DEFAULT_SEARCH_LIMIT = 20

/*------------- API -------------*/
export const STOCK_EXCHANGE_PRICING_API_URL = "https://boerse.moonstonks.space/pricing/Business"
export const STOCK_EXCHANGE_API_URL = "ws://boerse.moonstonks.space:16001"
export const WEBHOOK_BASE_URL = "https://business.moonstonks.space/api/webhook"
export const STOCK_EXCHANGE_CALLBACK_TOKEN = require('../_config/config').stockeExchange.callbackToken
export const JOB_CALLBACKS = {
    ON_MATCH: `${WEBHOOK_BASE_URL}/onMatch?token=${STOCK_EXCHANGE_CALLBACK_TOKEN}`,
    ON_PLACE: `${WEBHOOK_BASE_URL}/onPlace?token=${STOCK_EXCHANGE_CALLBACK_TOKEN}`,
    ON_DELETE: `${WEBHOOK_BASE_URL}/onDelete?token=${STOCK_EXCHANGE_CALLBACK_TOKEN}`,
    ON_COMPLETE: `${WEBHOOK_BASE_URL}/onComplete?token=${STOCK_EXCHANGE_CALLBACK_TOKEN}`
}
export const STOCK_EXCHANGE_API_TOKEN = {
    BUSINESS: require('../_config/config').stockeExchange.businessApiToken,
    LIQUID: require('../_config/config').stockeExchange.lqApiToken
}

/*------------- ALGORITHM -------------*/
export const ALG_SPLIT_THRESHOLD = 500_000
export const ALG_SPLIT_BATCH_VALUE = 100_000
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

/*------------- Liquidity Provider -------------*/
export const LP_LIMIT_MULTIPLIER = 0.3