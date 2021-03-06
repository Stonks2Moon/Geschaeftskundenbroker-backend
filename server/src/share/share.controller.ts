import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ShareService } from './share.service';

@ApiTags('share')
@Controller('share')
export class ShareController {

    constructor(
        private readonly shareService: ShareService
    ) { }

    @ApiOkResponse({
        description: "TODO"
    })
    @Get('all')
    async getAllShares(
        @Query('wkn') wkn?: string,
        @Query('isin') isin?: string,
        @Query('shareName') shareName?: string
    ): Promise<any> {
        return this.shareService.getAllShares(wkn, isin, shareName);
    }

    @ApiOkResponse({
        description: "TODO"
    })
    @Get('historical-data')
    async getHistoricalData(
        @Query('shareId') shareId: number,
        @Query('fromDate') fromDate: Date,
        @Query('toDate') toDate: Date,
    ): Promise<any> {
        return this.shareService.getHistoricalData(shareId, fromDate, toDate);
    }

    @ApiOkResponse({
        description: "TODO"
    })
    @Get(':shareId')
    async getShareData(
        @Param('shareId') shareId: number
    ): Promise<any> {
        return this.shareService.getShareData(shareId);
    }
}
