import { ApiProperty } from "@nestjs/swagger";

export class LoginInputDto {
    @ApiProperty()
    email: string;
    @ApiProperty()
    password: string;
}