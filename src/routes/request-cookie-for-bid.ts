import { Express } from 'express';

import jwt from 'jsonwebtoken';

import { CS571Route, CS571Config } from "@cs571/api-framework";
import { CS571DbConnector } from '../services/db-connector';
import BadgerAuthPublicConfig from '../model/configs/badgerauth-public-config';
import BadgerAuthSecretConfig from '../model/configs/badgerauth-secret-config';
import { BadgerId } from '../model/badger-id';

export class CS571RequestCookieForBidRoute implements CS571Route {

    public static readonly ROUTE_NAME: string = (process.env['CS571_BASE_PATH'] ?? "") + '/request-cookie-for-bid';

    private config: CS571Config<BadgerAuthPublicConfig, BadgerAuthSecretConfig>;
    private connector: CS571DbConnector;

    public constructor(config: CS571Config<BadgerAuthPublicConfig, BadgerAuthSecretConfig>, connector: CS571DbConnector) {
        this.config = config;
        this.connector = connector;
    }

    public addRoute(app: Express): void {
        app.post(CS571RequestCookieForBidRoute.ROUTE_NAME, (req, res) => {
            // check if req.header('Origin') matches an allowed origin
            const bid = req.body.bid;

            if (bid) {
                if (this.connector.isValidBID(bid)) {
                    this.connector.getBadgerId(bid).then((bidObj: BadgerId) => {
                        const EAT_SEC = bidObj.eat ? (
                            Math.floor((bidObj.eat.getTime() - new Date().getTime()) / 1000)
                        ) : 60 * 60 * 24 * 180 ;
                        const cookie = jwt.sign({ bid: bid }, this.config.SECRET_CONFIG.SESSION_SECRET, { expiresIn: `${EAT_SEC}s` });
                        res.status(200).cookie('cs571_bid', cookie, {
                            domain: this.config.PUBLIC_CONFIG.IS_REMOTELY_HOSTED ? this.config.PUBLIC_CONFIG.HOST : undefined,
                            partitioned: true,
                            secure: true,
                            sameSite: "none",
                            httpOnly: true,
                            maxAge: EAT_SEC * 1000
                        }).send({
                            msg: 'Successfully logged in!'
                        });
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
        return CS571RequestCookieForBidRoute.ROUTE_NAME;
    }
}