import { ApiProperty } from "@nestjs/swagger";
import { Share } from "src/share/share.model";

abstract class ShareOrder {

    orderId: string;

    @ApiProperty()
    depotId: string;

    @ApiProperty()
    amount: number;

    @ApiProperty({enum: ['buy', 'sell']})
    type: 'buy' | 'sell';

    @ApiProperty({enum: ['market', 'limit', 'stop', 'stopLimit']})
    detail: 'market' | 'limit' | 'stop' | 'stopLimit'

    @ApiProperty({required: false})
    limit?: number;

    @ApiProperty({required: false})
    stop?: number;

    @ApiProperty({required: false})
    stopLimit?: number;

    @ApiProperty({required: false})
    market?: string;
}

export class PlaceShareOrder extends ShareOrder{
    @ApiProperty({required: false})
    shareId: number;
}

export class ReturnShareOrder extends ShareOrder  {
    @ApiProperty({required: false})
    orderId: string;
    
    @ApiProperty({required: false})
    share: Share;
}