import { BadRequestException, Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { Share } from './share.model';
import * as StaticConsts from 'src/util/static-consts';
import { Connector } from 'src/util/database/connector';
import { QueryBuilder } from 'src/util/database/query-builder';
import { ChartValue, HistoricalDataDto } from './dto/historical-data.dto';
import { isDate, isDateString, isEmpty } from 'class-validator';
import * as Moment from 'moment';
import { extendMoment } from 'moment-range';
const moment = extendMoment(Moment);

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

        let resultLimit = StaticConsts.DEFAULT_SEARCH_LIMIT;
        if (limit && isNaN(limit)) {
            resultLimit = limit;
        }

        let response: Array<Share> = [];
        let result;
        if (wkn) {
            result = await Connector.executeQuery(QueryBuilder.getSharesByWkn(wkn, resultLimit));
        } else if (isin) {
            result = await Connector.executeQuery(QueryBuilder.getSharesByIsin(isin, resultLimit));
        } else if (shareName) {
            result = await Connector.executeQuery(QueryBuilder.getSharesByName(shareName, resultLimit));
        } else if (search) {
            result = await Connector.executeQuery(QueryBuilder.getSharesBySearch(search, resultLimit));
        } else {
            result = await Connector.executeQuery(QueryBuilder.getAllShares(resultLimit));
        }

        if (!result || result.length === 0) {
            throw new NotFoundException("No shares found");
        }

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
            response.push(share);
        });

        return response;
    }

    /**
     * Returns a share for a given share id
     * @param shareId ID of share
     * @returns a share object
     */
    public async getShareData(
        shareId: number
    ): Promise<Share> {

        if (!shareId || isNaN(shareId)) {
            throw new BadRequestException("Invalid share ID");
        }

        let result = (await Connector.executeQuery(QueryBuilder.getShareById(shareId)))[0];

        if (!result) {
            throw new NotFoundException("Share not found");
        }

        let share: Share = {
            shareId: result.share_id,
            shareName: result.name,
            wkn: result.wkn,
            isin: result.isin,
            lastRecordedValue: result.last_recorded_value,
            currencyCode: result.currency_code,
            currencyName: result.currency_name
        }

        return share;
    }

    /**
     * Returns an object to show historical data for shares
     * @param shareId ID of share
     * @param fromDate start date of timeframe
     * @param toDate end date of timeframe
     * @returns an object containing a share and the price + date infos
     */
    public async getHistoricalData(
        shareId: number,
        fromDate: Date,
        toDate: Date
    ): Promise<HistoricalDataDto> {

        const responseShare = await this.getShareData(shareId);

        if (isEmpty(fromDate)
            || isEmpty(toDate)
            || !isDateString(fromDate)
            || !isDateString(toDate)
            || moment(toDate.toString()).diff(fromDate.toString()) < 0) {
            throw new BadRequestException("No valid date information");
        }

        const result = await Connector.executeQuery(QueryBuilder.getHistoricalData(shareId, fromDate, toDate))

        if (!result || result.length === 0) {
            throw new NotFoundException("No data found");
        }

        let chartValues: Array<ChartValue> = []
        result.forEach(elem => {
            const value: ChartValue = {
                recordedAt: elem.recorded_at,
                recordedValue: elem.recorded_value
            }
            chartValues.push(value);
        });

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
    public shareIdInShareArray(shareId: number, shareArray: Share[]): boolean {
        for (const s of shareArray) {
            if (s.shareId === shareId) {
                return true
            }
        }
        return false
    }
}
