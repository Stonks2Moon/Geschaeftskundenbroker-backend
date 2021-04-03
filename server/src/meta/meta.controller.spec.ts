import { Test, TestingModule } from '@nestjs/testing';
import { MetaController } from './meta.controller';
import { MetaModule } from './meta.module';


describe('', () => {

    let testMetaController: MetaController

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [MetaModule]
        }).compile()

        testMetaController = module.get<MetaController>(MetaController)
    })

    it('Should get meta data for frontend', async () => {
        const metaData = await testMetaController.exportCONST()

        expect(metaData).toBeDefined()
        expect(metaData.ALGORITHMS).toBeDefined()
        expect(metaData.DEFAULT_SEARCH_LIMIT).toEqual(20)
    })
})