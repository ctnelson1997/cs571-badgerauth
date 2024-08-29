import { Express } from 'express';

import { CS571Config, CS571Route } from "@cs571/api-framework";
import { CS571Emailer } from '../services/emailer';
import { CS571Verifier } from '../services/verifier';
import { CS571ConfirmAddressEmail } from '../model/emails/confirm-addr-email';
import BadgerAuthSecretConfig from '../model/configs/badgerauth-secret-config';
import { CS571DbConnector } from '../services/db-connector';

export class CS571RequestVerifyEmailRoute implements CS571Route {

    public static readonly ROUTE_NAME: string = (process.env['CS571_BASE_PATH'] ?? "") + '/request-verify-email';

    private readonly config: CS571Config<any, BadgerAuthSecretConfig>;
    private readonly emailer: CS571Emailer;
    private readonly verifier: CS571Verifier;
    private readonly connector: CS571DbConnector;

    public constructor(config: CS571Config<any, BadgerAuthSecretConfig>, emailer: CS571Emailer, verifier: CS571Verifier, connector: CS571DbConnector) {
        this.config = config;
        this.emailer = emailer;
        this.verifier = verifier;
        this.connector = connector;
    }

    public addRoute(app: Express): void {
        app.post(CS571RequestVerifyEmailRoute.ROUTE_NAME, async (req, res) => {
            const email = req.body.email;
            const captcha = req.body.captcha;
            if (
                email &&
                await this.connector.isEmailTrulyAllowed(email)
            ) {
                fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${this.config.SECRET_CONFIG.CAPTCHA_PRIVATE}&response=${captcha}`)
                    .then(res => res.json())
                    .then(captchaRes => {
                        if (captchaRes.success) {
                            const sess = this.verifier.createSession(email);
                            this.emailer.email(
                                new CS571ConfirmAddressEmail(sess.email, sess.code)
                            ).then(() => {
                                res.status(200).cookie('cs571_otp', sess.email, {
                                    domain: this.config.PUBLIC_CONFIG.IS_REMOTELY_HOSTED ? this.config.PUBLIC_CONFIG.HOST : undefined,
                                    secure: this.config.PUBLIC_CONFIG.IS_REMOTELY_HOSTED,
                                    sameSite: "lax",
                                    partitioned: true,
                                    httpOnly: false,
                                    maxAge: 900000,
                                }).send({
                                    email: sess.email,
                                    iat: sess.iat,
                                    eat: sess.eat
                                })
                            }).catch(() => {
                                res.status(500).send({
                                    msg: "There was an issue sending the verification code. Try again in a few minutes."
                                })
                            })
                        } else {
                            res.status(418).send({
                                msg: "Are you a robot?"
                            })
                        }
                    })
            } else {
                res.status(401).send({
                    msg: "The email provided is not valid or is not an allowed email address."
                })
            }
        })
    }

    public getRouteName(): string {
        return CS571RequestVerifyEmailRoute.ROUTE_NAME;
    }


}