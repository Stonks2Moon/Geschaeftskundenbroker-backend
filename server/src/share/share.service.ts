import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class ShareService {

    public async getAllShares(
        wkn?: string,
        isin?: string,
        shareName?: string
    ): Promise<any> {
        throw new NotImplementedException('Not implemented yet!');
    }

    public async getShareData(
        shareId: number
    ): Promise<any> {
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
