import { Express } from 'express';

import crypto from 'crypto'

import { CS571Route } from "@cs571/api-framework";
import { CS571Verifier } from '../services/verifier';
import { CS571DbConnector } from '../services/db-connector';
import { BadgerId } from '../model/badger-id';
import { Util } from '../services/util';
import { CS571Emailer } from '../services/emailer';

export class CS571AddBidToEmailRoute implements CS571Route {

    private readonly verifier: CS571Verifier;
    private readonly connector: CS571DbConnector;

    public static readonly ROUTE_NAME: string = (process.env['CS571_BASE_PATH'] ?? "") + '/add-bid-to-email';

    public constructor(verifier: CS571Verifier, connector: CS571DbConnector) {
        this.verifier = verifier;
        this.connector = connector;
    }

    public addRoute(app: Express): void {
        app.post(CS571AddBidToEmailRoute.ROUTE_NAME, (req, res) => {
            this.verifier.getEmailFromJWT(req.cookies['cs571_badgerauth']).then(email => {
                if (email) {
                    const iat = new Date();
                    const eat = req.body.eat ? new Date(req.body.eat) : undefined;
                    const nickname = req.body.nickname
                    const bid = new BadgerId(nickname, email, Util.generateBadgerId(), iat, eat);
                    this.connector.createBadgerId(bid).then(() => {
                        res.status(200).send({
                            nickname: nickname,
                            email: email,
                            iat: iat,
                            eat: eat,
                            bid: bid.bid
                        })
                    })
                } else {
                    res.status(401).send({ msg: "Not a valid session." })
                }
            })
        })
    }

    public getRouteName(): string {
        return CS571AddBidToEmailRoute.ROUTE_NAME;
    }
}