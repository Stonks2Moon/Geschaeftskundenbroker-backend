import { Test, TestingModule } from "@nestjs/testing"
import { PlaceShareOrder } from "src/depot/dto/share-order.dto"
import { HistoricalDataDto } from "src/share/dto/historical-data.dto"
import { ShareController } from "src/share/share.controller"
import { Share } from "src/share/share.model"
import { ShareModule } from "src/share/share.module"
import { addDays } from "../cron/cron-jobs.service"
import { Connector } from "../database/connector"
import { QueryBuilder } from "../database/query-builder"
import { UpdateShares } from "./share-updates"
import { UpdatePrice } from "./update-price.model"
import * as CONST from "../const"
import { TradeAlgorithm } from "./trade-algorithm"
import { executeApiCall, getOrderFunction } from "./stock-wrapper"
import { connectableObservableDescriptor } from "rxjs/internal/observable/ConnectableObservable"

const moment = require('moment')
const cryptoRandomString = require('crypto-random-string')
// const rewire = require("rewire") 

describe('Test various functions of the stock exchange logic', () => {
    
    // Controllers for testing
    let shareController: ShareController

    // Rewire for private method
    // const shareUpdateRewire = rewire("./share-updates")
    
    let fakeShare: Share = {
        shareId: cryptoRandomString({length: 10, type:'alphanumeric'}),
        shareName: "Test Share",
        isin: "TestISIN",
        wkn: "TestWKN",
        lastRecordedValue: 1000,
        currencyCode: "EUR",
        currencyName: ""
    }

    let placeShareOrder: PlaceShareOrder = {
        depotId: "",
        amount: 0,
        detail: "market",
        orderId: "",
        shareId: "",
        type: "buy",
        validity: addDays(new Date(), 1),
    }


    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ShareModule]
        }).compile()

        shareController = module.get<ShareController>(ShareController)
        // Create a fake Share on the DB
        await Connector.executeQuery(QueryBuilder.addNewShare(fakeShare))
    })

    it('Should update the price of a fake share', async () => {

        // Update the price of the fake Share
        const updatePrice: UpdatePrice = {
            price: 1500,
            shareId: fakeShare.shareId,
            timestamp: (new Date()).getTime()
        }
        await UpdateShares.updateSharePrice(updatePrice)

        // Get the current share price
        const currentShare: Share = await shareController.getShareData(fakeShare.shareId)

        expect(currentShare).toBeDefined()
        expect(currentShare.lastRecordedValue).toEqual(updatePrice.price)

        // Check if historical data has been updated
        const from: string = addDays(new Date(), -5).toISOString()
        const to: string = addDays(new Date(), 5).toISOString()

        // console.log(from, to)
        // console.log(moment(to.toString()).diff(from.toString()))
        const hist: HistoricalDataDto = await shareController.getHistoricalData(fakeShare.shareId, from, to)

        // Get it manually
        const result = (await Connector.executeQuery({
            query: "SELECT * FROM share_price WHERE share_id = ?;",
            args: [
                fakeShare.shareId
            ]
        }))

        expect(hist).toBeDefined()
        expect(hist.share.shareId).toEqual(fakeShare.shareId)
        expect(hist.chartValues.length).toEqual(1)
    })

    it('Should test the private functions of share updates', () => {
        // console.log(shareUpdateRewire.__get__('generateISIN')('Hello'))
    })

    it('Should test the ability to start and stop sockets', () => {
        const updateShare: UpdateShares = new UpdateShares()
        updateShare.stopSocket()
    })

    it('Should create a new share and update its price', async () => {
        let newFakeShare: Share = {
            shareId: cryptoRandomString({length: 10, type:'alphanumeric'}),
            shareName: "Test Share",
            isin: "test01isin",
            wkn: "TestWKN",
            lastRecordedValue: 1000,
            currencyCode: "EUR",
            currencyName: ""
        }
    })

    it('Should split a large order into smaller ones', async () => {
        // Get a random share
        const share: Share = (await shareController.getAllShares())[0]
        
        // Calculate a sufficiently large number of shares to be orderer
        const amount: number = Math.ceil(CONST.ALG_SPLIT_THRESHOLD / share.lastRecordedValue) + 2
        const costValue: number = amount * share.lastRecordedValue

        placeShareOrder.amount = amount
        placeShareOrder.shareId = share.shareId

        const orderArray: PlaceShareOrder[] = await TradeAlgorithm.splitBuyOrderInSmallerOrders(placeShareOrder)

        expect(orderArray).toBeDefined()
        expect(orderArray.length).toBeGreaterThan(0)
        expect(orderArray[0].amount).toBeGreaterThanOrEqual(orderArray[orderArray.length - 1].amount)
    })

    it('Should get a order function from the stock wrapper', () => {
        const orderFunction: {func, args} = getOrderFunction(placeShareOrder)

        expect(orderFunction.func.args.length).toEqual(2)
        expect(orderFunction.args[0]).toEqual(placeShareOrder.shareId)
        expect(orderFunction.args[1]).toEqual(placeShareOrder.amount)
    })

    it('Should test the stock wrapper\'s function execution', async () => {
        let result: string = await executeApiCall<string>((a, b) => {
            return `${a} ${b}`
        }, ["Hello", "World"], null)

        expect(result).toEqual("Hello World")

        try {
            await executeApiCall<string>((a, b) => {
                throw Error("Hello World")
            }, ["Hello", "World"], null)
        } catch (e) {
            expect(e.name).toMatch("Error")
            expect(e.message).toMatch("Hello World")
        }

        // async function wrapper() {
        //     await executeApiCall<string>((a, b) => {
        //         throw Error("Hello World")
        //     }, ["Hello", "World"], null)
        // }

        // expect(wrapper).toThrow()
    })

    it('Should test the stock wrapper\'s exports', () => {
        expect(require("./stock-wrapper").stockExchangeApi).toBeDefined()
        expect(require("./stock-wrapper").orderManager).toBeDefined()
        expect(require("./stock-wrapper").marketManager).toBeDefined()
    })


    afterAll(async () => {
        // delete all fake data
 
        // Delete historical data
        await Connector.executeQuery({
            query: "DELETE FROM share_price WHERE share_id = ?;",
            args: [
                fakeShare.shareId
            ]
        })

        // Last step
        // Delete share
        await Connector.executeQuery({
            query: "DELETE FROM share WHERE share_id = ?;",
            args: [
                fakeShare.shareId
            ]
        })
    })
})