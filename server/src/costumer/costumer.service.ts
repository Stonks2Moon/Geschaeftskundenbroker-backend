import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Connector } from 'src/util/database/connector';
import { QueryBuilder } from 'src/util/database/query-builder';
import { CostumerSession } from './costumer-session.model';
import { Costumer } from './costumer.model';
import * as StaticConsts from 'src/util/static-consts';

const bcrypt = require('bcrypt');

@Injectable()
export class CostumerService {

    /**
     * Return the complete Information for a Costumer
     * @param costumerId Id of the Costumer
     */
    public async getCostumer(costumerId: string) {

    }

    public async costumerLogin(
        login?: {
            email: string,
            password: string
        },
        session?: CostumerSession
    ): Promise<{
        costumer: Costumer,
        session: CostumerSession
    }> {

        let costumer: Costumer;
        

        // Check parameters
        if(login && login.email && login.password) {
            let result = (await Connector.executeQuery(QueryBuilder.getCostumerByLoginCredentials(login.email)))[0];

            if(!result || !bcrypt.compareSync(login.password, result.password_hash)) {
                throw new UnauthorizedException("Not authorized");
            }

            // Delete old Costumer Sessions
            await Connector.executeQuery(QueryBuilder.deleteOldCostumerSessions(result.costumer_id))


        } else if(session && session.costumerId && session.sessionId) {

        } else {
            throw new BadRequestException("Insufficient authorization arguments");
        }
        return null;
    }
}
