import { Test, TestingModule } from '@nestjs/testing';
import { ShareController } from './share.controller';
import { Share } from './share.model';
import { ShareModule } from './share.module';

describe('', () => {

    let testShareController: ShareController

    beforeEach( async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ShareModule]
        }).compile()

        testShareController = module.get<ShareController>(ShareController)
    })

    it('Should get all shares', async () => {
        const shares: Array<Share> = await testShareController.getAllShares();

        expect(shares.length).toBeGreaterThan(0)
        expect(shares[0]).toBeDefined()
        expect(shares[0].lastRecordedValue).not.toBeNaN()
    })

    // it('Should search for a share by wkn with and without limit', () => {
    //     let share: Share = testShareController.getAllShares("")
    // })
})