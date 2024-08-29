import { Express } from 'express';

import { CS571Config, CS571Route } from "@cs571/api-framework";
import { CS571DbConnector } from '../services/db-connector';
import { Util } from '../services/util';

export class CS571DenyEmailDeleteRoute implements CS571Route {

    private readonly connector: CS571DbConnector;
    private readonly config: CS571Config;

    public static readonly ROUTE_NAME: string = (process.env['CS571_BASE_PATH'] ?? "") + '/email-deny';

    public constructor(connector: CS571DbConnector, config: CS571Config) {
        this.connector = connector;
        this.config = config;
    }

    public addRoute(app: Express): void {
        app.delete(CS571DenyEmailDeleteRoute.ROUTE_NAME, (req, res) => {
            const secret: string = String(req.header('X-CS571-SECRET'));
            if (secret === this.config.SECRET_CONFIG.X_CS571_SECRET) {
                const email = req.body.email;
                if (Util.validateEmail(email)) {
                    this.connector.removeEmailDenial(email).then(() => {
                        res.status(200).send({
                            msg: "Deleted denial for email address!"
                        })
                    })
                } else {
                    res.status(400).send({
                        msg: "That is not a valid email address."
                    })
                }
            } else {
                res.status(400).send({
                    msg: 'Invalid request'
                })
            }
        })
    }

    public getRouteName(): string {
        return CS571DenyEmailDeleteRoute.ROUTE_NAME;
    }
}