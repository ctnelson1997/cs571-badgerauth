import { CS571Config, CS571Route } from "@cs571/api-framework";

import { Express } from 'express';
import BadgerAuthSecretConfig from "../model/configs/badgerauth-secret-config";
import { CS571DbConnector } from "../services/db-connector";

import jwt from 'jsonwebtoken';

export class CS571GetMyBidsRoute implements CS571Route {

    public static readonly ROUTE_NAME: string = (process.env['CS571_BASE_PATH'] ?? "") + '/get-my-bids';

    private readonly config: CS571Config<any, BadgerAuthSecretConfig>;
    private readonly connector: CS571DbConnector;

    public constructor(config: CS571Config<any, BadgerAuthSecretConfig>, connector: CS571DbConnector) {
        this.config = config;
        this.connector = connector;
    }

    public addRoute(app: Express): void {
        app.get(CS571GetMyBidsRoute.ROUTE_NAME, (req, res) => {
            jwt.verify(req.cookies?.cs571_badgerauth, this.config.SECRET_CONFIG.EMAIL_VERIF_SECRET, (err: any, token: any) => {
                if (err) {
                    res.status(401).send({
                        msg: "You must be logged in to manage your Badger IDs!"
                    });
                } else {
                    this.connector.getBadgerIdsForEmail(token.email).then(ids => {
                        res.status(200).send(ids)
                    })
                }
            })
        })
    }

    public getRouteName(): string {
        return CS571GetMyBidsRoute.ROUTE_NAME;
    }
}