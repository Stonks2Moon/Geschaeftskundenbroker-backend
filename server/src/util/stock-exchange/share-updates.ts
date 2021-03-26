import { Injectable } from "@nestjs/common";
import * as WebSocket from "ws";
import * as StaticConsts from 'src/util/static-consts';
import { UpdatePrice } from "./update-price.model";

@Injectable()
export class UpdateShares {

    private stockExchangeServerSocket;

    constructor() {
        // Create socket
        try {
            this.stockExchangeServerSocket = new WebSocket(StaticConsts.STOCK_EXCHANGE_API_URL);
            // this.stockExchangeServerSocket = new WebSocket("wss://echo.websocket.org");
        } catch (e) {
            console.error(e);
        }

        // Handle socket errors
        this.stockExchangeServerSocket.on("error", error => console.error(error));

        // Check if new prices are available
        this.stockExchangeServerSocket.on("price", (updatePrice: UpdatePrice) => {
            console.log(updatePrice);
            this.updateSharePrice(updatePrice);
        });
    }

    /**
     * Updates our prices on the database
     * @param updatePrice new data from socket
     */
    private updateSharePrice(updatePrice: UpdatePrice) {
        console.log(updatePrice.price + "Hallo")

    }
}