// Diese Datei beinhaltet alle verwendeten Konstanten

export const WEBHOOK_BASE_URL = "http://noipddns.ddns.net:8082/webhook";

/*------------- Customer -------------*/
export const HASH_SALT_ROUNDS = 10;

/*------------- Share -------------*/
export const DEFAULT_SEARCH_LIMIT = 20;

/*------------- API URL -------------*/
export const STOCK_EXCHANGE_API_URL = "ws://boerse.moonstonks.space:16001";

/*------------- ALGORITHM -------------*/
export const ALG_SPLIT_THRESHOLD = 10_000;
export const ALG_SPLIT_BATCH_VALUE = 5_000;
export const ALGORITHMS = {
    NO_ALG: 0,
    SPLIT_ALG: 1
}