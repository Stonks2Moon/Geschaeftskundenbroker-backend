import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import * as StaticConsts from '../util/static-consts';

@Controller('meta')
export class MetaController {

    /**
     * Used to give constant variables used in backend to frontend
     * @returns an object with used backend constants
     */
    @ApiTags('')
    @ApiResponse({
        schema: {
            properties: {
                'DEFAULT_SEARCH_LIMIT': { type: 'number' },
                'ALG_SPLIT_THRESHOLD': { type: 'number' },
                'ALGORITHMS': {
                    type: 'object',
                    properties: {
                        'NO_ALG': { type: 'number' },
                        'SPLIT_ALG': { type: 'number' },
                    }
                }
            }
        }
    })
    @Get('')
    async exportStaticConsts() {
        return {
            DEFAULT_SEARCH_LIMIT: StaticConsts.DEFAULT_SEARCH_LIMIT,
            ALG_SPLIT_THRESHOLD: StaticConsts.ALG_SPLIT_THRESHOLD,
            ALGORITHMS: StaticConsts.ALGORITHMS
        }
    }
}
