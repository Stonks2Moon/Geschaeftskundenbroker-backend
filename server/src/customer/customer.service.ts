import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Connector } from 'src/util/database/connector';
import { QueryBuilder } from 'src/util/database/query-builder';
import { CustomerSession } from './customer-session.model';
import { Customer } from './customer.model';
import * as StaticConsts from 'src/util/static-consts';
import { userInfo } from 'os';

const bcrypt = require('bcrypt');
const cryptoRandomString = require('crypto-random-string');

@Injectable()
export class CustomerService {

    /**
     * Return the complete Information for a Customer
     * @param customerId Id of the Customer
     */
    public async getCustomer(customerId: string) {

    }

    public async customerLogin(
        login?: {
            email: string,
            password: string
        },
        session?: CustomerSession
    ): Promise<{
        customer: Customer,
        session: CustomerSession
    }> {

        let customer: Customer;
        let sessionId: string
        

        // Check parameters
        if(login && login.email && login.password) {
            let result = (await Connector.executeQuery(QueryBuilder.getCustomerByLoginCredentials(login.email)))[0];

            if(!result || !bcrypt.compareSync(login.password, result.password_hash)) {
                throw new UnauthorizedException("Not authorized");
            }

            // new session id
            sessionId = cryptoRandomString({length: 64, type: 'alphanumeric'});

            // Delete old Customer Sessions
            await Connector.executeQuery(QueryBuilder.deleteOldCustomerSessions(result.customer_id));

            // Create new user session


        } else if(session && session.customerId && session.sessionId) {

        } else {
            throw new BadRequestException("Insufficient authorization arguments");
        }
        return {
            customer: customer,
            session: {
                customerId: customer.customerId,
                sessionId: sessionId
            }
        };
    }
}
