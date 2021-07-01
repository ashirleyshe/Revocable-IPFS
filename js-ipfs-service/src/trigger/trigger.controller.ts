import { Controller, Get, Post, Body, Delete } from '@nestjs/common';
import { TriggerService } from './trigger.service';
import fs = require('fs');


@Controller('ipfs/event/trigger')
export class TriggerController {
    constructor(private readonly triggerService: TriggerService) { }

    @Get('/sc/IL/getALog')
    async get_all_logs(@Body() body: any): Promise<any> {
        return this.triggerService.get_all_logs(body);
    }

    @Post('/sc/IL/keepLog')
    async keep_log(@Body() body: any): Promise<any> {
        return this.triggerService.keep_log(body);
    }

    @Post('/sc/FS/setFAC')
    async set_fac(@Body() body: any): Promise<any> {
        return this.triggerService.set_fac(body);
    }

    @Post('/rsv')
    async get_RSV(@Body() body: any): Promise<any> {
        return this.triggerService.get_RSV(body);
    }

    @Post('/pinadd')
    upload_to_ipfs(@Body() body: any) {
        return this.triggerService.upload_to_ipfs(body);
    }

    @Post('/pinrm')
    async unpin_from_ipfs(@Body() body: any): Promise<any> {
        return await this.triggerService.unpin_from_ipfs(body);
    }

    // change to local ts file to run
    /*
    @Get('/sc/FS/getState')
    async get_state(@Body() body: any): Promise<any> {
        return this.triggerService.get_state(body);
    }
    */

    // change to local ts file to run
    /*
    @Post('/sc/FS/getFlag')
    async get_flag(@Body() body: any): Promise<any> {
        return this.triggerService.get_flag(body);
    }
    */

    /*
    // done in sgx
    @Get('/')
    async get_nodeFAC(): Promise<any> {
        return this.triggerService.get_nodeFAC();
    }
    
   // done in sgx
    @Delete('/')
    async delete_from_ipfs(@Body() body: Promise<object>) {
        const FAC = await this.triggerService.delete_from_ipfs(body);
        return FAC;
    }

    // no need
    @Get('/client')
    async get_jwt(): Promise<any> {
        return this.triggerService.get_jwt();
    }
    */

}
