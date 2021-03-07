import { ApiProperty } from "@nestjs/swagger";
import { CustomerSession } from "../customer-session.model";
import { LoginInputDto } from "./login-input.dto";

export class LoginDto {
    @ApiProperty({required: false})
    login?: LoginInputDto;
    
    @ApiProperty({required: false})
    session?: CustomerSession;
}