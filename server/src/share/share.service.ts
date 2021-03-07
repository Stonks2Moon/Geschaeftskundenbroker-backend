import { Injectable, NotImplementedException } from '@nestjs/common';
import { Share } from './share.model';

@Injectable()
export class ShareService {

    public async getAllShares(
        wkn?: string,
        isin?: string,
        shareName?: string
    ): Promise<Array<Share>> {
        throw new NotImplementedException('Not implemented yet!');
    }

    public async getShareData(
        shareId: number
    ): Promise<Share> {
        throw new NotImplementedException('Not implemented yet!');
    }

    public async getHistoricalData(
        shareId: number,
        fromDate: Date,
        toDate: Date
    ): Promise<any> {
        throw new NotImplementedException('Not implemented yet!');
    }
}
