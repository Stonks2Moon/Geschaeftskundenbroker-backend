import { Test, TestingModule } from '@nestjs/testing';
import { ShareController } from './share.controller';
import { Share } from './share.model';

describe('', () => {

    let testShareController: ShareController

    beforeEach( async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ShareController]
        }).compile()

        testShareController = module.get<ShareController>(ShareController)
    })

    it('Should get all shares', async () => {
        let shares = await testShareController.getAllShares();
    })

    // it('Should search for a share by wkn with and without limit', () => {
    //     let share: Share = testShareController.getAllShares("")
    // })
    

})