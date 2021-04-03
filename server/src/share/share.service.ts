import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Share } from './share.model'
import * as CONST from '../util/const'
import { Connector } from 'src/util/database/connector'
import { QueryBuilder } from '../util/database/query-builder'
import { ChartValue, HistoricalDataDto } from './dto/historical-data.dto'
import { isDateString, isEmpty } from 'class-validator'
import * as Moment from 'moment'
import { extendMoment } from 'moment-range'
const moment = extendMoment(Moment)

@Injectable()
export class ShareService {

    /**
     * Returns an array of shares for given search parameters OR all shares if nothing is set
     * @param wkn wkn of share
     * @param isin isin of share
     * @param shareName name of share
     * @param search search string (searches in wkn, isin and name)
     * @param limit limit for results
     * @returns an array of shares which match with given data
     */
    public async getAllShares(
        wkn?: string,
        isin?: string,
        shareName?: string,
        search?: string,
        limit?: number
    ): Promise<Array<Share>> {

        // Check if limit is given, else use default result limit
        let resultLimit = CONST.DEFAULT_SEARCH_LIMIT
        if (limit && isNaN(limit)) {
            resultLimit = limit
        }

        let response: Array<Share> = []
        let result
        // Check what is given for search and call database to get all shares, which match with the case
        if (wkn) {
            result = await Connector.executeQuery(QueryBuilder.getSharesByWkn(wkn, resultLimit))
        } else if (isin) {
            result = await Connector.executeQuery(QueryBuilder.getSharesByIsin(isin, resultLimit))
        } else if (shareName) {
            result = await Connector.executeQuery(QueryBuilder.getSharesByName(shareName, resultLimit))
        } else if (search) {
            result = await Connector.executeQuery(QueryBuilder.getSharesBySearch(search, resultLimit))
        } else {
            result = await Connector.executeQuery(QueryBuilder.getAllShares(resultLimit))
        }

        // If no shares are found throw 404 error
        if (!result || result.length === 0) {
            throw new NotFoundException("No shares found")
        }

        // Add data to response array
        result.forEach((elem) => {
            const share: Share = {
                shareName: elem.name,
                shareId: elem.share_id,
                isin: elem.isin,
                wkn: elem.wkn,
                lastRecordedValue: elem.last_recorded_value,
                currencyCode: elem.currency_code,
                currencyName: elem.currency_name
            }
            response.push(share)
        })

        return response
    }

    /**
     * Returns a share for a given share id
     * @param shareId ID of share
     * @returns a share object
     */
    public async getShareData(
        shareId: string
    ): Promise<Share> {

        // Check if share ID is given and a number
        if (!shareId) {
            throw new BadRequestException("Invalid share ID")
        }

        // Get share from database
        let result = (await Connector.executeQuery(QueryBuilder.getShareById(shareId)))[0]

        // If no share is found throw 404 error
        if (!result) {
            throw new NotFoundException("Share not found")
        }

        // Create return object
        let share: Share = {
            shareId: result.share_id,
            shareName: result.name,
            wkn: result.wkn,
            isin: result.isin,
            lastRecordedValue: result.last_recorded_value,
            currencyCode: result.currency_code,
            currencyName: result.currency_name
        }

        return share
    }

    /**
     * Returns an object to show historical data for shares
     * @param shareId ID of share
     * @param fromDate start date of timeframe
     * @param toDate end date of timeframe
     * @returns an object containing a share and the price + date infos
     */
    public async getHistoricalData(
        shareId: string,
        fromDate: Date,
        toDate: Date
    ): Promise<HistoricalDataDto> {

        // Get data about share (for response)
        // If the share is invalid, the code below is not executed,
        // because the getShare method throws an error directly
        const responseShare = await this.getShareData(shareId)

        // Check if given date data is correct (using moment.js to check if from date is before to date)
        if (isEmpty(fromDate)
            || isEmpty(toDate)
            || !isDateString(fromDate)
            || !isDateString(toDate)
            || moment(toDate.toString()).diff(fromDate.toString()) < 0) {
            throw new BadRequestException("No valid date information")
        }

        // Get data from database
        const result = await Connector.executeQuery(QueryBuilder.getHistoricalData(shareId, fromDate, toDate))

        // Create response data (values + timestamps for chart)
        let chartValues: Array<ChartValue> = []
        result.forEach(elem => {
            const value: ChartValue = {
                recordedAt: elem.recorded_at,
                recordedValue: elem.recorded_value
            }
            chartValues.push(value)
        })

        // Create response object
        const response: HistoricalDataDto = {
            share: responseShare,
            chartValues: chartValues
        }

        return response
    }

    /**
     * Checks if a share id is in a given array of shares
     * @param shareId ID of share to be checked
     * @param shareArray array in which is searched
     * @returns a boolean
     */
    public shareIdInShareArray(shareId: string, shareArray: Share[]): boolean {
        for (const s of shareArray) {
            if (s.shareId === shareId) {
                return true
            }
        }
        return false
    }
}
