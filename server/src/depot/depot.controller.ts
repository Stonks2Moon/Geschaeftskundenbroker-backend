import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DepotService } from './depot.service';

@ApiTags('depot')
@Controller('depot')
export class DepotController {
    constructor(private readonly depotService: DepotService) { }
}
