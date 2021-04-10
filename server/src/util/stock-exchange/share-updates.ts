import { Injectable } from "@nestjs/common"
import * as io from 'socket.io-client'
import * as CONST from 'src/util/const'
import { Connector } from "../database/connector"
import { QueryBuilder } from "../database/query-builder"
import { UpdatePrice } from "./update-price.model"
import { Share, ShareManager } from "moonstonks-boersenapi"
import { connectableObservableDescriptor } from "rxjs/internal/observable/ConnectableObservable"
const axios = require('axios')
const crc32 = require("crc-32")

@Injectable()
export class UpdateShares {

    private stockExchangeServerSocket

    constructor() {
        // Create socket
        try {
            this.stockExchangeServerSocket = io(CONST.STOCK_EXCHANGE_API_URL)
        } catch (e) {
            console.error(e)
        }

        // // Check if socket connected
        // this.stockExchangeServerSocket.on("connect", () => {
        //     //console.log(this.stockExchangeServerSocket.id)
        // })

        // Check if socket disconnected
        // this.stockExchangeServerSocket.on("disconnect", () => {
        //     this.stockExchangeServerSocket.connect()
        // })

        // Handle socket errors
        try {
            this.stockExchangeServerSocket.on("error", e => console.error("Socket on \"error\": ", e))

            this.stockExchangeServerSocket.on("connect_error", (e) => {
                console.error("Socket on \"connect_error\": ", e)
                setTimeout(() => {
                    this.stockExchangeServerSocket.connect();
                }, 1000);
            });

            // Check if new prices are available
            this.stockExchangeServerSocket.on("price", async (updatePrice: UpdatePrice) => {
                try {
                    await UpdateShares.updateSharePrice(updatePrice)
                } catch (e) {
                    console.error("Caught Socket error on \"price\":")
                    console.error(e)
                }
            })
        } catch (e) {
            console.error("Caught Socket error at global try/catch:")
            console.error(e)
        }
    }

    /**
     * Updates our prices on the database
     * @param updatePrice new data from socket
     */
    public static async updateSharePrice(updatePrice: UpdatePrice): Promise<void> {

        // Get share from database
        let result = (await Connector.executeQuery(QueryBuilder.getShareById(updatePrice.shareId)))[0]

        // If no share is found add a new one to the database
        if (!result) {
            // Get all shares and filter for the specific share by id to get the share name
            let shares: Array<Share> = []

            // Call api and handle errors if stock exchange api is down
            try {
                const apiShares = (await axios.get('https://boerse.moonstonks.space/share')).data
                if (typeof apiShares === "object") {
                    shares = apiShares
                } else if (typeof apiShares === "string") {
                    console.log("Received string from API", apiShares)
                    shares = JSON.parse(apiShares)
                } else {
                    throw new Error("Unhandled return type for stock exchange /share")
                }
            } catch (e) {
                console.error("Stock Exchange not available", e)
                return
            }

            // Check if get shares was not successful
            if (!shares || shares.length === 0) return

            const share: Share = shares.filter(s =>
                s.id === updatePrice.shareId
            )[0]

            // Generate a wkn and a isin for our database
            const isin = UpdateShares.generateISIN(updatePrice.shareId)
            const wkn = UpdateShares.generateWKN(share.name, updatePrice.shareId)

            // If share does not exist, add share to database
            await Connector.executeQuery(QueryBuilder.addNewShare({
                shareId: share.id,
                shareName: share.name,
                isin: isin,
                wkn: wkn,
                lastRecordedValue: +share.price,
                currencyCode: "EUR",
                currencyName: ""
            }))
        }

        // console.log("Here", updatePrice.timestamp, new Date(+updatePrice.timestamp))

        // Update Database entries
        await Connector.executeQuery(QueryBuilder.updateSharePrice(+updatePrice.price, updatePrice.shareId))
        await Connector.executeQuery(QueryBuilder.addNewPriceRecordToHistoricalData(+updatePrice.price, new Date(+updatePrice.timestamp), updatePrice.shareId))
    }

    public stopSocket() {
        this.stockExchangeServerSocket.off()
    }

    /**
     * Generates a ISIN for our database
     * @param shareId ID of the share from stock exchange
     * @returns a ISIN string
     */
    private static generateISIN(shareId: string): string {
        return `DE${shareId}${crc32.str(shareId)}`.toUpperCase()
    }

    /**
     * Generates a WKN for our database
     * @param name name of the share
     * @param shareId id of the share from stock exchange
     * @returns a WKN string
     */
    private static generateWKN(name: string, shareId: string): string {
        return `${name.slice(0, 3)}${shareId.slice(2, shareId.length - 3)}`.toUpperCase()
    }
}
