import { Express } from 'express';

import { CS571Config, CS571Route } from "@cs571/api-framework";
import { CS571DbConnector } from '../services/db-connector';
import { Util } from '../services/util';
import BadgerAuthPublicConfig from '../model/configs/badgerauth-public-config';
import BadgerAuthSecretConfig from '../model/configs/badgerauth-secret-config';

export class CS571AllowEmailIsRoute implements CS571Route {

    private readonly connector: CS571DbConnector;
    private readonly config: CS571Config<BadgerAuthPublicConfig, BadgerAuthSecretConfig>;

    public static readonly ROUTE_NAME: string = (process.env['CS571_BASE_PATH'] ?? "") + '/email-allow';

    public constructor(connector: CS571DbConnector, config: CS571Config<BadgerAuthPublicConfig, BadgerAuthSecretConfig>) {
        this.connector = connector;
        this.config = config;
    }

    public addRoute(app: Express): void {
        app.get(CS571AllowEmailIsRoute.ROUTE_NAME, async (req, res) => {
            const email = req.query.email as string;
            if (Util.validateEmail(email)) {
                res.status(200).send({
                    allowed: await this.connector.isEmailTrulyAllowed(email)
                })
            } else {
                res.status(400).send({
                    msg: "That is not a valid email address."
                })
            }
        })
    }

    public getRouteName(): string {
        return CS571AllowEmailIsRoute.ROUTE_NAME;
    }
}