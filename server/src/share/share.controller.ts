import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiNotFoundResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger'
import { HistoricalDataDto } from './dto/historical-data.dto'
import { Share } from './share.model'
import { ShareService } from './share.service'

@ApiTags('share')
@Controller('share')
export class ShareController {

    constructor(
        private readonly shareService: ShareService
    ) { }

    /**
     * Used to search for shares
     * @param wkn wkn of share
     * @param isin isin of share
     * @param shareName name of share
     * @param search used to search string in wkn, isin and name
     * @param limit limit for results (if nothing is provided, default applies)
     * @returns an array of shares
     */
    @ApiOkResponse({
        description: "Returns all shares OR can be used to search for a share by wkn, isin or name."
    })
    @ApiNotFoundResponse({
        description: "Share not found"
    })
    @ApiQuery({
        name: "wkn",
        required: false,
        type: String
    })
    @ApiQuery({
        name: "isin",
        required: false,
        type: String
    })
    @ApiQuery({
        name: "shareName",
        required: false,
        type: String
    })
    @ApiQuery({
        name: "search",
        required: false,
        type: String
    })
    @ApiQuery({
        name: "limit",
        required: false,
        type: Number
    })
    @Get('all')
    async getAllShares(
        @Query('wkn') wkn?: string,
        @Query('isin') isin?: string,
        @Query('shareName') shareName?: string,
        @Query('search') search?: string,
        @Query('limit') limit?: number
    ): Promise<Array<Share>> {
        return this.shareService.getAllShares(wkn, isin, shareName, search, limit)
    }

    /**
     * used to get historical data for a share
     * @param shareId id of the share
     * @param fromDate start date of historical data range
     * @param toDate end date of historical data range
     * @returns the historical data for a share
     */
    @ApiOkResponse({
        description: "Returns historical data for a given share in given time range",
        type: HistoricalDataDto
    })
    @ApiNotFoundResponse({
        description: "Share not found"
    })
    @Get('historical-data')
    async getHistoricalData(
        @Query('shareId') shareId: string,
        @Query('fromDate') fromDate: Date,
        @Query('toDate') toDate: Date,
    ): Promise<HistoricalDataDto> {
        return this.shareService.getHistoricalData(shareId, fromDate, toDate)
    }

    /**
     * Used to get all information for a share by it's id
     * @param shareId id of share
     * @returns a share object
     */
    @ApiOkResponse({
        description: "Returns a share by it's id",
        type: Share
    })
    @ApiNotFoundResponse({
        description: "Share not found"
    })
    @Get(':shareId')
    async getShareData(
        @Param('shareId') shareId: string
    ): Promise<Share> {
        return this.shareService.getShareData(shareId)
    }
}