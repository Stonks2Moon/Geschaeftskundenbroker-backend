import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Connector } from 'src/util/database/connector';
import { QueryBuilder } from 'src/util/database/query-builder';
import { CustomerSession } from './customer-session.model';
import { Customer } from './customer.model';
import * as StaticConsts from 'src/util/static-consts';
import { Company } from 'src/company/company.model';
import { CompanyService } from 'src/company/company.service';
import * as EmailValidator from 'email-validator';
import { uuid } from 'uuidv4';
import { CustomerDto } from './dto/customer.dto';
import { LoginInputDto } from './dto/login-input.dto';
import { LoginDto } from './dto/login.dto';
// import { isSameType } from '../util/typeguard.js';
const bcrypt = require('bcrypt');
const cryptoRandomString = require('crypto-random-string');

@Injectable()
export class CustomerService {
    constructor(
        @Inject(forwardRef(() => CompanyService))
        private readonly companyService: CompanyService
    ) { }

    /**
     * Returns the complete Information for a Customer
     * @param customerId Id of the Customer
     * @returns a customer object
     */
    public async getCustomer(customerId: string): Promise<Customer> {
        let result = (await Connector.executeQuery(QueryBuilder.getCustomerById(customerId)))[0];

        if (!result) {
            throw new NotFoundException("Customer not found");
        }

        const company: Company = await this.companyService.getCompanyById(result.company_id);

        const customer: Customer = {
            customerId: result.customer_id,
            firstName: result.first_name,
            lastName: result.last_name,
            email: result.email,
            company: company
        }

        return customer;
    }

    /**
     * Used to login a customer via email + password OR session
     * @param login email + password of customer
     * @param session customer session
     * @returns a customer + customer session
     */
    public async customerLogin(_l: LoginDto): Promise<{
        customer: Customer,
        session: CustomerSession
    }> {

        let customer: Customer;
        let customerId: string;
        let sessionId: string;

        const login = _l.login;
        const session = _l.session;


        // Check parameters
        if (login && login.email && login.password) {
            let result = (await Connector.executeQuery(QueryBuilder.getCustomerByLoginCredentials(login.email)))[0];

            if (!result || !bcrypt.compareSync(login.password, result.password_hash)) {
                throw new UnauthorizedException("Not authorized");
            }

            // new session id
            sessionId = cryptoRandomString({ length: 64, type: 'alphanumeric' });


            // Delete old Customer Sessions
            await Connector.executeQuery(QueryBuilder.deleteOldCustomerSessions(result.customer_id));

            // Create new user session
            await Connector.executeQuery(QueryBuilder.createCustomerSession(result.customer_id, sessionId));

            customerId = result.customer_id;
            customer = await this.getCustomer(customerId);

        } else if (session && session.customerId && session.sessionId) {
            let result = (await Connector.executeQuery(QueryBuilder.getCustomerSessionByIds(session.customerId, session.sessionId)))[0];

            if (!result) {
                throw new UnauthorizedException("Not authorized");
            }

            // Refresh session
            await Connector.executeQuery(QueryBuilder.refreshCustomerSession(session.customerId, session.sessionId));

            customer = await this.getCustomer(session.customerId);
            sessionId = session.sessionId;
            customerId = customer.customerId;

        } else {
            throw new BadRequestException("Insufficient authorization arguments");
        }

        customer = await this.getCustomer(customerId)
        return {
            customer: customer,
            session: {
                customerId: customerId,
                sessionId: sessionId
            }
        }
    }

    /**
     * Used to register a new customer with given data
     * @param customer data for registration
     * @returns a customer and session to login
     */
    public async registerCustomer(customer: CustomerDto): Promise<{
        customer: Customer,
        session: CustomerSession
    }> {

        // if(!isSameType(customer, CustomerDto)) {
        //     throw new BadRequestException("Invalid requets parameters");
        // }

        // Validate registration input, throws error if invalid
        await this.validateRegistrationInput(customer);

        // Get company to work with ID
        const company: Company = await this.companyService.getCompanyByCompanyCode(customer.companyCode);

        // Generate customerId
        const customerId: string = uuid();

        // Hash password and write to DB
        const passwordHash: string = bcrypt.hashSync(customer.password, StaticConsts.HASH_SALT_ROUNDS);

        // Write info to DB
        await Connector.executeQuery(QueryBuilder.createCustomer({
            customerId: customerId,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            password: passwordHash,
            companyId: company.companyId
        }));

        const registeredCustomer: { customer: Customer, session: CustomerSession } = await this.customerLogin({
            login: {
                email: customer.email,
                password: customer.password
            }
        });

        return registeredCustomer;
    }

    /**
     * Validates the input for a user registration
     * @param customer customer object to be validated
     */
    private async validateRegistrationInput(customer: Customer): Promise<void> {

        // check if email address is already registered
        let result = (await Connector.executeQuery(QueryBuilder.getCustomerByLoginCredentials(customer.email)))[0];

        if (result != undefined || result != null) {
            throw new BadRequestException("Email Address already registered");
        }

        // check if email has valid format
        if (!EmailValidator.validate(customer.email)) {
            throw new BadRequestException("Invalid Email Address");
        }

        // Check if name only contains characters, spaces and -
        const fullName: string = `${customer.firstName} ${customer.lastName}`
        if (fullName.match("[\\-a-zA-Z\\s\'\"]+")[0] != fullName) {
            throw new BadRequestException("Invalid first or last name");
        }

        // Check if company code exists
        try {
            const company: Company = await this.companyService.getCompanyByCompanyCode(customer.companyCode);
            if (!company) {
                throw new NotFoundException("No company");
            }
        } catch (e) {
            throw new BadRequestException("Invalid Company Code");
        }


    }
}
