import { CS571Config, CS571Route } from "@cs571/api-framework";

import { Express } from 'express';
import BadgerAuthSecretConfig from "../model/configs/badgerauth-secret-config";
import { CS571DbConnector } from "../services/db-connector";


export class CS571GetAllBidsRoute implements CS571Route {

    public static readonly ROUTE_NAME: string = (process.env['CS571_BASE_PATH'] ?? "") + '/get-all-bids';

    private readonly config: CS571Config<any, BadgerAuthSecretConfig>;
    private readonly connector: CS571DbConnector;

    public constructor(config: CS571Config<any, BadgerAuthSecretConfig>, connector: CS571DbConnector) {
        this.config = config;
        this.connector = connector;
    }

    public addRoute(app: Express): void {
        app.get(CS571GetAllBidsRoute.ROUTE_NAME, (req, res) => {
            const secret: string = String(req.header('X-CS571-SECRET')) ?? String(req.header('X-CS571-SECRET-FA'));

            if (secret === this.config.SECRET_CONFIG.X_CS571_SECRET) {
                this.connector.getAllBadgerIds().then(bids => res.status(200).send(bids));
            } else {
                res.status(400).send({
                    msg: 'Invalid request'
                })
            }
        })
    }

    public getRouteName(): string {
        return CS571GetAllBidsRoute.ROUTE_NAME;
    }
}