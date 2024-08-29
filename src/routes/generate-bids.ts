import { CS571Config, CS571Route } from "@cs571/api-framework";

import { Express } from 'express';
import BadgerAuthSecretConfig from "../model/configs/badgerauth-secret-config";
import { CS571DbConnector } from "../services/db-connector";
import { CS571Emailer } from "../services/emailer";
import { BadgerId } from "../model/badger-id";
import { CS571NotifyBidEmail } from "../model/emails/notify-bid-email";
import { Util } from "../services/util";


export class CS571GenerateBidsRoute implements CS571Route {

    public static readonly ROUTE_NAME: string = (process.env['CS571_BASE_PATH'] ?? "") + '/generate-bids';

    private readonly config: CS571Config<any, BadgerAuthSecretConfig>;
    private readonly connector: CS571DbConnector;
    private readonly emailer: CS571Emailer;

    public constructor(config: CS571Config<any, BadgerAuthSecretConfig>, connector: CS571DbConnector, emailer: CS571Emailer) {
        this.config = config;
        this.connector = connector;
        this.emailer = emailer;
    }

    public addRoute(app: Express): void {
        app.post(CS571GenerateBidsRoute.ROUTE_NAME, (req, res) => {
            const secret: string = String(req.header('X-CS571-SECRET'));
            const bidReqs: any[] = req.body.bids;
            const sendEmails: boolean = req.body.sendEmails;
            if (secret === this.config.SECRET_CONFIG.X_CS571_SECRET) {
                const bids = bidReqs.map((bidReq: any) => new BadgerId(
                    bidReq.nickname,
                    bidReq.email,
                    Util.generateBadgerId(),
                    new Date(),
                    bidReq.eat ? new Date(bidReq.eat) : undefined
                ));
                this.connector.createBadgerIds(bids).then(() => {
                    if (sendEmails) {
                        this.emailer.bulkEmail(bids.map((bid: BadgerId) => new CS571NotifyBidEmail(bid.email, bid.bid)))
                    }
                    res.status(200).send({
                        msg: `Successfully created ${bids.length} Badger IDs!`
                    })
                });
            } else {
                res.status(400).send({
                    msg: 'Invalid request'
                })
            }
        })
    }

    public getRouteName(): string {
        return CS571GenerateBidsRoute.ROUTE_NAME;
    }
}