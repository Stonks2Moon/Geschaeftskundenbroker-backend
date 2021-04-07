import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HistoricalDataDto } from './dto/historical-data.dto';
import { ShareController } from './share.controller';
import { Share } from './share.model';
import { ShareModule } from './share.module';

describe('', () => {

    let testShareController: ShareController
    let testShares: Array<Share> = [];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ShareModule]
        }).compile()

        testShareController = module.get<ShareController>(ShareController)

        // Some initialization
        testShares = await testShareController.getAllShares();
        if (testShares.length <= 0) {
            throw new Error("Could not get test shares from DB");
        }
    })

    it('Should get all shares with and without limit', async () => {
        let shares: Array<Share> = await testShareController.getAllShares();

        expect(shares.length).toBeGreaterThan(0)
        expect(shares[0]).toBeDefined()
        expect(shares[0].lastRecordedValue).not.toBeNaN()

        shares = await testShareController.getAllShares(undefined, undefined, undefined, undefined, 1)
        expect(shares.length).toEqual(1)
    })

    it('Should search for a share by wkn', async () => {
        const wkn = testShares[0].wkn
        const shares: Array<Share> = await testShareController.getAllShares(wkn);

        expect(shares.length).toEqual(1)
        expect(shares[0]).toBeDefined()
        expect(shares[0].shareId).toEqual(testShares[0].shareId)
    })

    it('Should search for a share by isin', async () => {
        const isin = testShares[0].isin
        const shares: Array<Share> = await testShareController.getAllShares(undefined, isin);

        expect(shares.length).toEqual(1)
        expect(shares[0]).toBeDefined()
        expect(shares[0].shareId).toEqual(testShares[0].shareId)
    })

    it('Should search for a share by name', async () => {
        const name = testShares[0].shareName
        const shares: Array<Share> = await testShareController.getAllShares(undefined, undefined, name);

        expect(shares.length).toEqual(1)
        expect(shares[0]).toBeDefined()
        expect(shares[0].shareId).toEqual(testShares[0].shareId)
    })

    it('Should search for a share by search', async () => {
        const name = testShares[0].shareName
        const shares: Array<Share> = await testShareController.getAllShares(undefined, undefined, undefined, name);

        expect(shares.length).toEqual(1)
        expect(shares[0]).toBeDefined()
        expect(shares[0].shareId).toEqual(testShares[0].shareId)
    })

    it('Should get a share by id', async () => {
        const id = testShares[0].shareId
        const share: Share = await testShareController.getShareData(id)

        expect(share).toBeDefined()
        expect(share.shareId).toEqual(testShares[0].shareId)
    })

    it('Should get historical data for a share', async () => {
        const fromDate = "1970-01-01 01:01:01"
        const toDate = "2022-12-31 01:01:01"
        const id = testShares[0].shareId

        const historicalData: HistoricalDataDto = await testShareController.getHistoricalData(id, fromDate, toDate)

        expect(historicalData).toBeDefined()
        expect(historicalData.share).toBeDefined()
        expect(historicalData.share.shareId).toEqual(id)
        expect(historicalData.chartValues.length).toBeGreaterThanOrEqual(0)
    })

    it('Should test share exceptions', async () => {
        try {
            await testShareController.getAllShares("not_a_real_wkn")
            expect(0).toEqual(1)
        } catch(e) {
            expect(e.message).toEqual("No shares found")
        }

        try {
            await testShareController.getShareData(undefined)
            expect(0).toEqual(1)
        } catch(e) {
            expect(e.message).toEqual("Invalid share ID")
        }

        try {
            await testShareController.getShareData("not_a_real_share_id")
            expect(0).toEqual(1)
        } catch(e) {
            expect(e.message).toEqual("Share not found")
        }

        try {
            await testShareController.getHistoricalData(testShares[0].shareId, "", "")
            expect(0).toEqual(1)
        } catch(e) {
            expect(e.message).toEqual("No valid date information")
        }

        
    })
})