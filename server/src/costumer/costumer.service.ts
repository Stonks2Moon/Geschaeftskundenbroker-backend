import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Connector } from 'src/util/database/connector';
import { QueryBuilder } from 'src/util/database/query-builder';
import { CostumerSession } from './costumer-session.model';
import { Costumer } from './costumer.model';
import * as StaticConsts from 'src/util/static-consts';
import { userInfo } from 'os';

const bcrypt = require('bcrypt');
const cryptoRandomString = require('crypto-random-string');

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
        let sessionId: string
        

        // Check parameters
        if(login && login.email && login.password) {
            let result = (await Connector.executeQuery(QueryBuilder.getCostumerByLoginCredentials(login.email)))[0];

            if(!result || !bcrypt.compareSync(login.password, result.password_hash)) {
                throw new UnauthorizedException("Not authorized");
            }

            // new session id
            sessionId = cryptoRandomString({length: 64, type: 'alphanumeric'});

            // Delete old Costumer Sessions
            await Connector.executeQuery(QueryBuilder.deleteOldCostumerSessions(result.costumer_id));

            // Create new user session


        } else if(session && session.costumerId && session.sessionId) {

        } else {
            throw new BadRequestException("Insufficient authorization arguments");
        }
        return {
            costumer: Costumer,
            session: c
        };
    }
}
