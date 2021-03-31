import { Injectable } from '@nestjs/common';

@Injectable()
export class WebhookService {
    public async onPlace(data: any): Promise<void> {
        console.log("Inside WebhookService: onPlace")
        console.log(data)
    }

    public async onMatch(data: any): Promise<void> {
        console.log("Inside WebhookService: onMatch")
        console.log(data)

    }


    public async onComplete(data: any): Promise<void> {
        console.log("Inside WebhookService: onComplete")
        console.log(data)

    }

    public async onDelete(data: any): Promise<void> {
        console.log("Inside WebhookService: onDelete")
        console.log(data)
    }

}
