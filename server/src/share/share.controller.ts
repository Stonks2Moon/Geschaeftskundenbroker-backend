import { Controller, Get, Param, Query } from '@nestjs/common';
import { ShareService } from './share.service';

@Controller('share')
export class ShareController {

    constructor(
        private readonly shareService: ShareService
    ) { }

    @Get('all')
    async getAllShares(
        @Query('wkn') wkn?: string,
        @Query('isin') isin?: string,
        @Query('shareName') shareName?: string
    ): Promise<any> {
        return this.shareService.getAllShares(wkn, isin, shareName);
    }

    @Get('historical-data')
    async getHistoricalData(
        @Query('shareId') shareId: number,
        @Query('fromDate') fromDate: Date,
        @Query('toDate') toDate: Date,
    ): Promise<any> {
        return this.shareService.getHistoricalData(shareId, fromDate, toDate);
    }

    @Get(':shareId')
    async getShareData(
        @Param('shareId') shareId: number
    ): Promise<any> {
        return this.shareService.getShareData(shareId);
    }

}
