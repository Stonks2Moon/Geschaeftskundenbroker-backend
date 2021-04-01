import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, isString, IsString } from "class-validator";
import { Share } from "src/share/share.model";

abstract class ShareOrder {
    orderId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    depotId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @ApiProperty({ enum: ['buy', 'sell'] })
    @IsNotEmpty()
    //@IsEnum({ enum: ['buy', 'sell'] })
    type: 'buy' | 'sell';

    @ApiProperty({ enum: ['market', 'limit', 'stop', 'stopLimit'] })
    @IsNotEmpty()
    //@IsEnum({ enum: ['market', 'limit', 'stop', 'stopLimit'] })
    detail: 'market' | 'limit' | 'stop' | 'stopLimit'

    @ApiProperty()
    @IsDateString()
    validity: Date

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    limit?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    stop?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    stopLimit?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    market?: string;
}

export class PlaceShareOrder extends ShareOrder {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    shareId: string;
}

export class ReturnShareOrder extends ShareOrder {
    @ApiProperty({ required: false })
    orderId: string;

    @ApiProperty({ required: false })
    share: Share;
}