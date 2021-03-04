import { Controller, Get } from '@nestjs/common';

@Controller('test-endpoint')
export class TestEndpointController {
    @Get()
    sendTestMessage() {
        return "Deploy works."
    }
}
