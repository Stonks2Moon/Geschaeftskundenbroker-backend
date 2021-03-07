import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Share } from './share.model';
import { ShareService } from './share.service';

@ApiTags('share')
@Controller('share')
export class ShareController {

    constructor(
        private readonly shareService: ShareService
    ) { }

    @ApiOkResponse({
        description: "Returns all shares OR can be used to search for a share by wkn, isin or name."
    })
    @ApiNotFoundResponse({
        description: "Share not found"
    })
    @Get('all')
    async getAllShares(
        @Query('wkn') wkn?: string,
        @Query('isin') isin?: string,
        @Query('shareName') shareName?: string
    ): Promise<Array<Share>> {
        return this.shareService.getAllShares(wkn, isin, shareName);
    }

    @ApiOkResponse({
        description: "Returns historical data for a given share in given time range"
    })
    @ApiNotFoundResponse({
        description: "Share not found"
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
        description: "Returns a share by it's id",
        type: Share
    })
    @ApiNotFoundResponse({
        description: "Share not found"
    })
    @Get(':shareId')
    async getShareData(
        @Param('shareId') shareId: number
    ): Promise<Share> {
        return this.shareService.getShareData(shareId);
    }
}
