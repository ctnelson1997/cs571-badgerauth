import { Express } from 'express';

import { CS571Route } from "@cs571/api-framework";
import { CS571Verifier } from '../services/verifier';
import { CS571DbConnector } from '../services/db-connector';

export class CS571RevokeBidFromEmailRoute implements CS571Route {

    private readonly verifier: CS571Verifier;
    private readonly connector: CS571DbConnector;

    public static readonly ROUTE_NAME: string = (process.env['CS571_BASE_PATH'] ?? "") + '/revoke-bid-from-email';

    public constructor(verifier: CS571Verifier, connector: CS571DbConnector) {
        this.verifier = verifier;
        this.connector = connector;
    }

    public addRoute(app: Express): void {
        app.post(CS571RevokeBidFromEmailRoute.ROUTE_NAME, (req, res) => {
            this.verifier.getEmailFromJWT(req.cookies['cs571_badgerauth']).then(email => {
                if (email) {
                    const bid = req.body.bid;
                    if (bid) {
                        this.connector
                            .revokeBadgerId(email, bid)
                            .then(didRemove => {
                                if (didRemove) {
                                    res.status(200).send({ msg: "Revoked Badger ID." });
                                } else {
                                    res.status(404).send({ msg: "Badger ID not found." });
                                }
                            });
                    } else {
                        res.status(400).send({
                            msg: 'Invalid request body'
                        })
                    }
                    
                } else {
                    res.status(401).send({ msg: "Not a valid session." });
                }
            })
        })
    }

    public getRouteName(): string {
        return CS571RevokeBidFromEmailRoute.ROUTE_NAME;
    }
}