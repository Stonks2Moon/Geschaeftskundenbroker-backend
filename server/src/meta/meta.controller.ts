import { Controller, Get } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import * as CONST from '../util/const'

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
    async exportCONST() {
        return {
            DEFAULT_SEARCH_LIMIT: CONST.DEFAULT_SEARCH_LIMIT,
            ALG_SPLIT_THRESHOLD: CONST.ALG_SPLIT_THRESHOLD,
            ALGORITHMS: CONST.ALGORITHMS
        }
    }
}
