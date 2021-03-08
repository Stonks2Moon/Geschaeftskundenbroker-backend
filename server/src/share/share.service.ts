import { BadRequestException, Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { Share } from './share.model';
import * as StaticConsts from 'src/util/static-consts';
import { Connector } from 'src/util/database/connector';
import { QueryBuilder } from 'src/util/database/query-builder';
import { HistoricalDataDto } from './dto/historical-data.dto';
import { isDate, isEmpty } from 'class-validator';
import * as Moment from 'moment';
import { extendMoment } from 'moment-range';
const moment = extendMoment(Moment);

@Injectable()
export class ShareService {

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

    public async getHistoricalData(
        shareId: number,
        fromDate: Date,
        toDate: Date
    ): Promise<HistoricalDataDto> {

        const responseShare = await this.getShareData(shareId);

        if (isEmpty(fromDate)
            || isEmpty(toDate)
            || !isDate(fromDate)
            || !isDate(toDate)
            || moment(toDate.toString()).diff(fromDate.toString())) {
            throw new BadRequestException("No valid date information");
        }

        // let response: 


        throw new NotImplementedException('Not implemented yet!');
    }
}
