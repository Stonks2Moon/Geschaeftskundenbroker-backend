import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { CustomerSession } from "src/customer/customer-session.model"
import { Share } from "src/share/share.model"
import { Depot } from "../depot.model"

export class LpPosition {

    @ApiProperty()
    lpId: number
    
    @ApiProperty()
    @Type(() => Depot)  
    depot: Depot

    @ApiProperty()
    @Type(() => Share)  
    share: Share

    @ApiProperty()
    lqQuote: number
}