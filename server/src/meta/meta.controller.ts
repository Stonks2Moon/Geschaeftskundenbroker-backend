import { Controller, Get } from '@nestjs/common';
import * as StaticConsts from '../util/static-consts';

@Controller('meta')
export class MetaController {
    
    @Get('')
    async exportStaticConsts() {
        return {
            DEFAULT_SEARCH_LIMIT: StaticConsts.DEFAULT_SEARCH_LIMIT,
            ALG_SPLIT_THRESHOLD: StaticConsts.ALG_SPLIT_THRESHOLD,
            ALGORITHMS: StaticConsts.ALGORITHMS
        }
    }
}
