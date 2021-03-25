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
            console.log("ab")
            console.error(e);
        }
        // // // Socket open
        // this.stockExchangeServerSocket.on("open", () => {
        //     this.stockExchangeServerSocket.send(Math.random())
        // });

        // Check if new prices are available
        this.stockExchangeServerSocket.on("price", (updatePrice: UpdatePrice) => {
            console.log(updatePrice);
            this.updateSharePrice(updatePrice);
            // UpdateShares.updateSharePrice(message);
        });
    }

    private updateSharePrice(share) {
        console.log(share + "Hallo")

    }
}