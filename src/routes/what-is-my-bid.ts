import { Express } from 'express';

import jwt from 'jsonwebtoken';

import { CS571Config, CS571Route } from "@cs571/api-framework";
import BadgerAuthPublicConfig from '../model/configs/badgerauth-public-config';
import BadgerAuthSecretConfig from '../model/configs/badgerauth-secret-config';

export class CS571WhatIsMyBidRoute implements CS571Route {

    public static readonly ROUTE_NAME: string = (process.env['CS571_BASE_PATH'] ?? "") + '/what-is-my-bid';

    private config: CS571Config<BadgerAuthPublicConfig, BadgerAuthSecretConfig>;

    public constructor(config: CS571Config<BadgerAuthPublicConfig, BadgerAuthSecretConfig>) {
        this.config = config;
    }

    public addRoute(app: Express): void {
        app.get(CS571WhatIsMyBidRoute.ROUTE_NAME, (req, res) => {
            const willCache = req.query.cache === 'true';
            jwt.verify(req.cookies?.cs571_bid, this.config.SECRET_CONFIG.SESSION_SECRET, (err: any, bid: any) => {
                if (err) {
                    res.status(401).send({
                        msg: "You must be logged in to check your Badger ID!"
                    });
                } else {
                    // Acceptable risk, our server can only handle so much load!
                    if (willCache) {
                        res.status(200).set('Cache-control', 'private, max-age=1').send(bid); 
                    } else {
                        res.status(200).send(bid); 
                    }
                }
            })
        })
    }

    public getRouteName(): string {
        return CS571WhatIsMyBidRoute.ROUTE_NAME;
    }
}