import { Express } from 'express';

import { CS571Route } from "@cs571/api-framework";
import { CS571DbConnector } from '../services/db-connector';

export class CS571VerifyBidRoute implements CS571Route {

    public static readonly ROUTE_NAME: string = (process.env['CS571_BASE_PATH'] ?? "") + '/verify-bid';

    private readonly connector: CS571DbConnector;

    public constructor(connector: CS571DbConnector) {
        this.connector = connector
    }

    public addRoute(app: Express): void {
        app.get(CS571VerifyBidRoute.ROUTE_NAME, (req, res) => {
            const xid = req.header('X-CS571-ID')
            if (xid) {
                if (this.connector.isValidBID(xid)) {
                    res.status(200).send({
                        name: "Known"
                    });
                } else {
                    res.status(401).send({
                        msg: 'That is not a valid Badger ID!'
                    })
                }
            } else {
                res.status(400).send({
                    msg: 'Invalid request body'
                })
            }
        })
    }

    public getRouteName(): string {
        return CS571VerifyBidRoute.ROUTE_NAME;
    }
}