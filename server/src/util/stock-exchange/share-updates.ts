import { Injectable } from "@nestjs/common";
import * as io from 'socket.io-client'
import * as StaticConsts from 'src/util/static-consts';
import { Connector } from "../database/connector";
import { QueryBuilder } from "../database/query-builder";
import { UpdatePrice } from "./update-price.model";
import { Share, ShareManager } from "moonstonks-boersenapi";
const crc32 = require("crc-32");

@Injectable()
export class UpdateShares {

    private stockExchangeServerSocket;

    constructor() {
        // Create socket
        try {
            this.stockExchangeServerSocket = io(StaticConsts.STOCK_EXCHANGE_API_URL);
        } catch (e) {
            console.error(e);
        }

        // Check if socket connected
        this.stockExchangeServerSocket.on("connect", () => {
            //console.log(this.stockExchangeServerSocket.id);
        });

        // Check if socket disconnected
        this.stockExchangeServerSocket.on("disconnect", () => {
            //console.log(this.stockExchangeServerSocket.id);
        });

        // Handle socket errors
        this.stockExchangeServerSocket.on("error", error => console.error(error));

        // Check if new prices are available
        this.stockExchangeServerSocket.on("price", async (updatePrice: UpdatePrice) => {
            await UpdateShares.updateSharePrice(updatePrice);
        });
    }

    /**
     * Updates our prices on the database
     * @param updatePrice new data from socket
     */
    public static async updateSharePrice(updatePrice: UpdatePrice): Promise<void> {

        // Get share from database
        let result = (await Connector.executeQuery(QueryBuilder.getShareById(updatePrice.shareId)))[0];

        // If no share is found add a new one to the database
        if (!result) {
            // Get all shares and filter for the spcific share by id to get the share name
            const shares: Array<Share> = await ShareManager.getShares();

            const share: Share = shares.filter(s =>
                s.id === updatePrice.shareId
            )[0];

            // Generate a wkn and a isin for our database
            const isin = UpdateShares.generateISIN(updatePrice.shareId);
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
            }));
        }

        // Update Database entries
        await Connector.executeQuery(QueryBuilder.updateSharePrice(+updatePrice.price, updatePrice.shareId));
        await Connector.executeQuery(QueryBuilder.addNewPriceRecordToHistoricalData(+updatePrice.price, new Date(+updatePrice.timestamp), updatePrice.shareId));
    }

    /**
     * Generates a ISIN for our database
     * @param shareId ID of the share from stock exchange
     * @returns a ISIN string
     */
    private static generateISIN(shareId: string): string {
        return `DE${shareId}${crc32.str(shareId)}`.toUpperCase();
    }

    /**
     * Generates a WKN for our database
     * @param name name of the share
     * @param shareId id of the share from stock exchange
     * @returns a WKN string
     */
    private static generateWKN(name: string, shareId: string): string {
        return `${name.slice(0, 3)}${shareId.slice(2, shareId.length - 3)}`.toUpperCase();
    }
}
