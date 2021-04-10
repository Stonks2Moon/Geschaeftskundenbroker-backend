import { Address } from 'src/company/address.model'
import { Company } from 'src/company/company.model'
import { Share } from 'src/share/share.model'
import { Query } from './query.model'
import { Job } from "moonstonks-boersenapi"
import { PlaceShareOrder } from 'src/depot/dto/share-order.dto'
import { DepotEntry } from 'src/depot/dto/depot-entry.dto'

export class QueryBuilder {

    /**
     * Returns a query to create a customer
     * @param customer cutomer object to be created
     * @returns a Query object
     */
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

    /**
     * Returns a query to create a company
     * @param company company to be created
     * @param addressId adress fro company
     * @returns a Query object
     */
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

    /**
     * Returns a query to get a customer by credentials
     * @param email email of customer
     * @returns a Query object
     */
    public static getCustomerByLoginCredentials(email: string): Query {
        return {
            query: "SELECT * FROM customer WHERE email = ?;",
            args: [
                email
            ]
        }
    }

    /**
     * Returns a query to delete old customer sessions
     * @param customerId id of customer
     * @returns a Query object
     */
    public static deleteOldCustomerSessions(customerId: string): Query {
        return {
            query: "DELETE FROM customer_session WHERE customer_id = ? OR CURRENT_DATE() > expiration_date;",
            args: [
                customerId
            ]
        }
    }

    /**
     * Returns a query to create a customer session
     * @param customerId ID of customer
     * @param sessionId session ID of customer
     * @returns a Query object
     */
    public static createCustomerSession(customerId: string, sessionId: string): Query {
        return {
            query: "INSERT INTO customer_session (customer_id, session_id, expiration_date) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR));",
            args: [
                customerId,
                sessionId
            ]
        }
    }

    /**
     * Returns a query to refresh the session of a customer
     * @param customerId ID of customer 
     * @param sessionId session ID
     * @returns a Query object
     */
    public static refreshCustomerSession(customerId: string, sessionId: string): Query {
        return {
            query: "UPDATE customer_session SET expiration_date = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE customer_id = ? AND session_id = ?;",
            args: [
                customerId,
                sessionId
            ]
        }
    }

    /**
     * Returns a query to get a customer by session id
     * @param customerId customer ID
     * @param sessionId session ID
     * @returns a Query object
     */
    public static getCustomerSessionByIds(customerId: string, sessionId: string): Query {
        return {
            query: "SELECT * FROM customer_session WHERE customer_id = ? AND session_id = ?;",
            args: [
                customerId,
                sessionId
            ]
        }
    }

    /**
     * Returns a query to get a customer by it's ID
     * @param customerId ID of customer
     * @returns a Query object
     */
    public static getCustomerById(customerId: string): Query {
        return {
            query: "SELECT * FROM customer WHERE customer_id = ?;",
            args: [
                customerId
            ]
        }
    }

    /**
     * Retrurns a query to get a company by it's ID
     * @param companyId ID of the company
     * @returns a Query object
     */
    public static getCompanyById(companyId: string): Query {
        return {
            query: "SELECT * FROM company WHERE company_id = ?;",
            args: [
                companyId
            ]
        }
    }

    /**
     * Returns a query to get all available companies
     * @returns a Query object
     */
    public static getAllCompanies(): Query {
        return {
            query: "SELECT c.*, a.post_code, a.city, a.street, a.house_number FROM company AS c JOIN address AS a ON c.address_id = a.address_id ORDER BY c.company_name ASC;",
            args: []
        }
    }

    /**
     * Returns a query to get a company by it's company code
     * @param companyCode code of the company
     * @returns a Query object
     */
    public static getCompanyByCompanyCode(companyCode: string): Query {
        return {
            query: "SELECT * FROM company WHERE company_code = ?;",
            args: [
                companyCode
            ]
        }
    }

    /**
     * Returns a query to create an address
     * @param address address to be created
     * @returns a Query object
     */
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

    /**
     * Returns a query to get an address by it's ID
     * @param addressId ID of the address
     * @returns a Query object
     */
    public static getAddressById(addressId: string): Query {
        return {
            query: "SELECT * FROM address WHERE address_id = ?;",
            args: [
                addressId
            ]
        }
    }

    /**
     * Returns a query to create a depot for a company
     * @param depotId ID of depot
     * @param companyId ID of company
     * @param name name of the depot
     * @param description description for the depot
     * @returns a Query object
     */
    public static createDepot(depotId: string, companyId: string, name: string, description: string): Query {
        return {
            query: "INSERT INTO depot (depot_id, company_id, name, description) VALUES (?, ?, ?, ?);",
            args: [
                depotId,
                companyId,
                name,
                !description ? "" : description
            ]
        }
    }

    /**
     * Returns a query to get the depots for a given company ID
     * @param companyId ID of the company
     * @returns a Query object
     */
    public static getDepotByCompanyId(companyId: string): Query {
        return {
            query: "SELECT * FROM depot WHERE company_id = ?;",
            args: [
                companyId
            ]
        }
    }

    /**
     * Returns a query to get all entries of a depot
     * @param depotId ID of the depot
     * @returns a Query object
     */
    public static getDepotEntriesByDepotId(depotId: string): Query {
        return {
            query: "SELECT entry_id, depot_id, d.share_id, amount, cost_value, created_at, isin, wkn, last_recorded_value, name, currency_code FROM depot_entry AS d JOIN share AS s ON d.share_id = s.share_id WHERE d.depot_id = ?;",
            args: [
                depotId
            ]
        }
    }

    /**
     * Returns a query to get all depot entries for a given share ID and depot ID
     * @param depotId ID of the depot 
     * @param shareId ID of the share
     * @returns a Query object
     */
    public static getDepotEntriesForShare(depotId: string, shareId: number): Query {
        return {
            query: "SELECT * FROM depot_entry WHERE depot_id = ? AND share_id = ?;",
            args: [
                depotId,
                shareId
            ]
        }
    }


    public static createDepotEntry(depotEntry: DepotEntry): Query {
        return {
            query: "INSERT INTO depot_entry (depot_id, share_id, amount, cost_value, created_at) VALUES (?, ?, ?, ?, NOW());",
            args: [
                depotEntry.depotId,
                depotEntry.share.shareId,
                depotEntry.amount,
                depotEntry.costValue
            ]
        }
    }


    /**
     * Returns a query to get a depot by it's ID
     * @param depotId ID of the depot
     * @returns a Query object
     */
    public static getDepotById(depotId: string): Query {
        return {
            query: "SELECT * FROM depot WHERE depot_id = ?;",
            args: [
                depotId
            ]
        }
    }

    /**
     * Returns a query to get all shares with a limit
     * @param resultLimit limit
     * @returns a Query object
     */
    public static getAllShares(resultLimit: number): Query {
        return {
            query: "SELECT share_id, isin, wkn, last_recorded_value, name, currency_code, currency_name FROM share JOIN currency ON share.currency_code = currency.iso_code LIMIT ?;",
            args: [
                resultLimit
            ]
        }
    }

    /**
     * Returns a query to get a share by it's ID
     * @param shareId ID of the share
     * @returns a Query object
     */
    public static getShareById(shareId: string): Query {
        return {
            query: "SELECT share_id, isin, wkn, last_recorded_value, name, currency_code, currency_name FROM share JOIN currency ON share.currency_code = currency.iso_code WHERE share_id = ?;",
            args: [
                shareId
            ]
        }
    }

    /**
     * Returns a query to get a share by it's isin 
     * @param isin isin of the share
     * @param resultLimit limit
     * @returns a Query object
     */
    public static getSharesByIsin(isin: string, resultLimit: number): Query {
        return {
            query: "SELECT share_id, isin, wkn, last_recorded_value, name, currency_code, currency_name FROM share JOIN currency ON share.currency_code = currency.iso_code WHERE isin = ? LIMIT ?;",
            args: [
                isin,
                resultLimit
            ]
        }
    }

    /**
     * Returns a query to get a share by it's wkn
     * @param wkn wkn of the share
     * @param resultLimit limit
     * @returns a Query object
     */
    public static getSharesByWkn(wkn: string, resultLimit: number): Query {
        return {
            query: "SELECT share_id, isin, wkn, last_recorded_value, name, currency_code, currency_name FROM share JOIN currency ON share.currency_code = currency.iso_code WHERE wkn = ? LIMIT ?;",
            args: [
                wkn,
                resultLimit
            ]
        }
    }

    /**
     * Returns a query to get all shares with a given string in the name
     * @param shareName name to be searched for
     * @param resultLimit limit for results
     * @returns a Query object
     */
    public static getSharesByName(shareName: string, resultLimit: number): Query {
        return {
            query: `SELECT share_id, isin, wkn, last_recorded_value, name, currency_code, currency_name FROM share JOIN currency ON share.currency_code = currency.iso_code WHERE name LIKE '%${shareName}%' LIMIT ?;`,
            args: [
                resultLimit
            ]
        }
    }

    /**
     * Returns a query to search a given string in a shares wkn, isin and name
     * @param search search string
     * @param resultLimit result limit
     * @returns a Query object
     */
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

    /**
     * Returns a query to get historical data for a share
     * @param shareId ID of the share
     * @param fromDate start date of timeframe
     * @param toDate end date of timeframe
     * @returns a Query object
     */
    public static getHistoricalData(shareId: string, fromDate: Date, toDate: Date): Query {
        return {
            query: "SELECT * FROM share_price WHERE share_id = ? AND recorded_at >= ? AND recorded_at <= ? GROUP BY recorded_at ORDER BY recorded_at ASC;",
            args: [
                shareId,
                fromDate,
                toDate
            ]
        }
    }

    /**
     * Returns a query to get historical data for a share
     * @param shareId ID of the share
     * @param fromDate start date of timeframe
     * @param toDate end date of timeframe
     * @returns a Query object
     */
     public static getHistoricalDataPerSecond(shareId: string, fromDate: Date, toDate: Date): Query {
        return {
            query: "SELECT AVG(recorded_value) AS recorded_value, share_id, recorded_at FROM share_price WHERE share_id = ? AND recorded_at >= ? AND recorded_at <= ? GROUP BY recorded_at ORDER BY recorded_at ASC;",
            args: [
                shareId,
                fromDate,
                toDate
            ]
        }
    }

    /**
     * Returns a query to get statistical data for a share
     * @param shareId ID of the share
     * @returns a Query object
     */
     public static getStatistics(shareId: string, yesterday: Date): Query {
        return {
            query: 'WITH yesterday(recorded_value) AS (SELECT recorded_value FROM share_price WHERE recorded_at <= ? AND share_id = ? ORDER BY recorded_at ASC LIMIT 1) SELECT last_recorded_value - yesterday.recorded_value as difference, ((last_recorded_value/yesterday.recorded_value)-1)*100 as percent FROM share, yesterday WHERE share_id = ? ',
            args: [
                yesterday,
                shareId,
                shareId,
            ]
        }
    }

    /**
     * Used to update the price of a share
     * @param price new price
     * @param shareId id of share
     * @returns a query to update the last recorded price of a share
     */
    public static updateSharePrice(price: number, shareId: string): Query {
        return {
            // INSERT INTO customer (customer_id, first_name, last_name, email, password_hash, company_id) VALUES (?, ?, ?, ?, ?, ?)            
            query: "UPDATE share SET last_recorded_value = ? WHERE share_id = ?;",
            args: [
                price,
                shareId
            ]
        }
    }

    /**
     * Used to add a new entrie for historical data
     * @param price price of the share
     * @param shareId id of the share
     * @returns a query to insert new data to historical 
     */
    public static addNewPriceRecordToHistoricalData(price: number, recordedAt: Date, shareId: string): Query {
        return {
            query: "INSERT INTO share_price (share_id, recorded_at, recorded_value) VALUES (?, ?, ?);",
            args: [
                shareId,
                recordedAt,
                price
            ]
        }
    }

    /**
     * Used to add new shares to our database
     * @param share share object with all infos which are needed for an db entry
     * @returns a query to insert a new entry in database
     */
    public static addNewShare(share: Share): Query {
        return {
            query: "INSERT INTO share (share_id, isin, wkn, last_recorded_value, name, currency_code) VALUES (?, ?, ?, ?, ?, ?);",
            args: [
                share.shareId,
                share.isin,
                share.wkn,
                share.lastRecordedValue,
                share.shareName,
                share.currencyCode
            ]
        }
    }

    /**
     * Method to return a DB query to write jobs to database
     * @param job Job
     * @param depotId depotId of user 
     * @param order Order with all information needed
     * @returns a Query object 
     */
    public static writeJobToDb(job: Job, depotId: string, order: PlaceShareOrder, jobType: string, isLp: boolean): Query {
        return {
            query: "INSERT INTO job (job_id, depot_id, share_id, amount, transaction_type, order_limit, order_stop, order_validity, detail, market, job_type, is_lp_job) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
            args: [
                +job.id,
                depotId,
                job.placeOrder.shareId,
                job.placeOrder.amount,
                job.placeOrder.type,
                job.placeOrder.limit ?? 0,
                job.placeOrder.stop ?? 0,
                order.validity,
                order.detail,
                order.market ?? "",
                jobType,
                isLp
            ]
        }
    }

    /**
     * Returns a DB query to update the job on the DB (used for webhooks)
     * @param jobId id of the job
     * @param orderId id of the order
     * @returns a Query object
     */
    public static updateJobWithOrderId(jobId: string, orderId: string): Query {
        return {
            query: "UPDATE job SET exchange_order_id = ? WHERE job_id = ?;",
            args: [
                orderId,
                jobId
            ]
        }
    }

    /**
     * Returns a DB query to delete a job after it's done
     * @param jobId id of the job
     * @returns a Query object
     */
    public static deleteJobByJobId(jobId: string): Query {
        return {
            query: "DELETE FROM job WHERE job_id = ?",
            args: [
                jobId
            ]
        }
    }

    /**
     * Returns a DB query to delete a job
     * @param orderId id of the order
     * @returns a Query object
     */
    public static deleteJobByOrderId(orderId: string): Query {
        return {
            query: "DELETE FROM job WHERE exchange_order_id = ?",
            args: [
                orderId
            ]
        }
    }

    /**
     * Returns a DB query to get a job by it's id or by an order id
     * @param info object with order id or job id
     * @returns a Query object
     */
    public static getJobById(info: {
        jobId?: string,
        orderId?: string
    }): Query {
        const field: string = info.jobId ? "job_id" : "exchange_order_id"
        const value: string = info.jobId ? info.jobId : info.orderId
        return {
            query: `SELECT * FROM job WHERE ${field} = ?;`,
            args: [
                value
            ]
        }
    }

    /**
     * Creates and entry on the share_order table
     * @param order order object to be created on the db
     * @returns a Query object
     */
    public static createShareOrder(order: PlaceShareOrder): Query {
        return {
            query: "INSERT INTO share_order (order_id, depot_id, share_id, amount, transaction_type, order_stop, order_limit, order_validity, detail, market) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            args: [
                order.orderId,
                order.depotId,
                order.shareId,
                order.amount,
                order.type,
                order.stop,
                order.limit,
                order.validity,
                order.detail,
                order.market
            ]
        }
    }


    /**
     * Returns a query to get a job for a given order id
     * @param orderId id of the order
     * @returns a Query object
     */
    public static getJobByOrderId(orderId: string): Query {
        return {
            query: "SELECT * FROM job WHERE exchange_order_id = ?;",
            args: [
                orderId
            ]
        }
    }

    /**
     * Returns a query to get all jobs for a given depot id
     * @param depotId id of the depot
     * @returns a Query object
     */
    public static getJobsByDepotId(depotId: string): Query {
        return {
            query: "SELECT * FROM job WHERE depot_id = ?;",
            args: [
                depotId
            ]
        }
    }

    /**
     * Return a list of all completed share orders for a given depot
     * @param depotId id of depot
     * @returns a query object
     */
    public static getShareOrdersByDepotId(depotId: string): Query {
        return {
            query: "SELECT * FROM share_order WHERE depot_id = ? ORDER BY created_at DESC;",
            args: [
                depotId
            ]
        }
    }


    /**
     * Creates an entry on the LP table
     * @param depotId id of the depot
     * @param shareId id of the share
     * @param lqQuote quote of share assets
     * @returns a Query object 
     */
    public static createLpEntry(depotId: string, shareId: string, lqQuote: number): Query {
        return {
            query: "INSERT INTO liquidity_provider (depot_id, share_id, lq_quote) VALUES (?, ?, ?);",
            args: [
                depotId,
                shareId, 
                lqQuote
            ]
        }
    }


    /**
     * Remove an entry from the LP table by depot and share id
     * @param depotId id of the depot
     * @param shareId id of the share
     * @returns a Query object
     */
    public static removeLpEntry(lpId: number): Query {
        return {
            query: "DELETE FROM liquidity_provider WHERE lp_id = ?;",
            args: [
                lpId
            ]
        }
    }

    
    /**
     * Retrieves all LP positions for a given depot
     * @param depotId id of the depot
     * @returns a Query object
     */
    public static getLpByDepot(depotId: string): Query {
        return {
            query: "SELECT * FROM liquidity_provider WHERE depot_id = ?;",
            args: [
                depotId
            ]
        }
    }


    /**
     * Retrieves a single LP position by id
     * @param lpId id of the LP position
     * @returns a Query object
     */
    public static getLpById(lpId: number): Query {
        return {
            query: "SELECT * FROM liquidity_provider WHERE lp_id = ?;",
            args: [
                lpId
            ]
        }
    }


    /**
     * Returns all active LP entries
     * @returns a Query object
     */
    public static getAllLpEntries(): Query {
        return {
            query: "SELECT * FROM liquidity_provider;", 
            args: []
        }
    }

    /**
     * Returns a query to get all lp jobs by depotId and shareId
     * @param depotId id of depot
     * @param shareId id of share
     * @returns a query object
     */
    public static getLpJobs(depotId: string, shareId: string) : Query {
        return {
            query: "SELECT * FROM job WHERE depot_id = ? AND share_id = ? AND is_lp_job = TRUE",
            args: [
                depotId,
                shareId
            ]
        }
    }
}