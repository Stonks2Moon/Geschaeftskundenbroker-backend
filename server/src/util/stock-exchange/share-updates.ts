import { Injectable } from "@nestjs/common";
import * as io from 'socket.io-client'
import * as StaticConsts from 'src/util/static-consts';
import { UpdatePrice } from "./update-price.model";
const crc = require('node-crc');

@Injectable()
export class UpdateShares {

    private stockExchangeServerSocket;

    constructor() {
        // Create socket
        try {
            this.stockExchangeServerSocket = io(StaticConsts.STOCK_EXCHANGE_API_URL);
            // this.stockExchangeServerSocket = new WebSocket("wss://echo.websocket.org");
        } catch (e) {
            console.error(e);
        }

        // Check if socket connected
        this.stockExchangeServerSocket.on("connect", () => {
            console.log(this.stockExchangeServerSocket.id);
        });

        // Check if socket disconnected
        this.stockExchangeServerSocket.on("disconnect", () => {
            console.log(this.stockExchangeServerSocket.id);
        });

        // Handle socket errors
        this.stockExchangeServerSocket.on("error", error => console.error(error));

        // Check if new prices are available
        this.stockExchangeServerSocket.on("price", (updatePrice: UpdatePrice) => {
            this.updateSharePrice(updatePrice);
        });
    }

    /**
     * Updates our prices on the database
     * @param updatePrice new data from socket
     */
    private updateSharePrice(updatePrice: UpdatePrice) {
        console.log(updatePrice.price + "Hallo Welt")
    }

    /**
     * Generates a ISIN for our database
     * @param shareId ID of the share from stock exchange
     * @returns a ISIN string
     */
    private generateISIN(shareId: string): string {
        return `DE${shareId}${crc.crc32(Buffer.from(shareId, 'utf8')).toString('hex')}`.toUpperCase();
    }

    /**
     * Generates a WKN for our database
     * @param name name of the share
     * @param shareId id of the share from stock exchange
     * @returns a WKN string
     */
    private generateWKN(name: string, shareId: string): string {
        return `${name.slice(0, 3)}${shareId.slice(2, shareId.length - 3)}`.toUpperCase();
    }
}