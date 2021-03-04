import { Body, Controller, Post } from '@nestjs/common';
import { CostumerSession } from './costumer-session.model';
import { CostumerService } from './costumer.service';

@Controller('costumer')
export class CostumerController {
    constructor(private readonly costumerService: CostumerService) { }
    
    
    @Post('login')
    async login(
        @Body('login') login?: {
            email: string,
            password: string
        },
        @Body('session') session?: CostumerSession
    ) {
        return await this.costumerService.costumerLogin(login, session);
    }
}
