import { CS571Config } from "@cs571/api-framework";
import nodemailer, { Transporter } from 'nodemailer'
import BadgerAuthSecretConfig from '../model/configs/badgerauth-secret-config';
import { CS571Email } from '../model/emails/email';

export class CS571Emailer {

    public static readonly BULK_DELAY_MS: number = 1000;
    private readonly client: Transporter;
    private readonly config: BadgerAuthSecretConfig;

    public constructor(config: CS571Config<any, BadgerAuthSecretConfig>) {
        this.config = config.SECRET_CONFIG;
        this.client = nodemailer.createTransport({
            service: this.config.EMAIL_SERV,
            auth: {
                user: this.config.EMAIL_ADDR,
                pass: this.config.EMAIL_PASS
            }
        });
    }

    public async bulkEmail(msgs: CS571Email[]) {
        msgs.forEach((msg: CS571Email, i: number) => {
            setTimeout(() => this.email(msg), CS571Emailer.BULK_DELAY_MS * i)
        })
    }

    public async email(msg: CS571Email) {
        await this.client.sendMail(
            {
                from: this.config.EMAIL_ADDR,
                ...msg.generate()
            }
        );
    }

    // https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
    public static isValidEmail(email: string): boolean { 
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            ) ? true : false;
    }

    public static isWiscEmail(email: string): boolean {
        return email.toLowerCase().endsWith("@wisc.edu") || email.toLowerCase().endsWith("@cs.wisc.edu")
    }

    public static isAnyEduEmail(email: string): boolean {
        return email.toLowerCase().endsWith(".edu")
    }

    public static isOtherEduEmail(email: string): boolean {
        return !CS571Emailer.isWiscEmail(email) && CS571Emailer.isAnyEduEmail(email)
    }
}