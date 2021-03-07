import { ApiProperty } from '@nestjs/swagger';
import { DepotEntrySummaryPosition } from './depot-entry.dto';

export class DepotEntrySummary {
    @ApiProperty()
    depotId: string;
    
    @ApiProperty({isArray: true, type: DepotEntrySummaryPosition})
    position: DepotEntrySummaryPosition[];
}