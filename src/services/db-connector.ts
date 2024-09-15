
import { DataTypes, Sequelize, ModelStatic } from "sequelize";
import BadgerAuthSecretConfig from "../model/configs/badgerauth-secret-config";
import BadgerAuthPublicConfig from "../model/configs/badgerauth-public-config";
import { CS571Config } from "@cs571/api-framework";
import { BadgerId } from "../model/badger-id";
import { CS571Emailer } from "./emailer";

export class CS571DbConnector {

    private badgerIdTable!: ModelStatic<any>;
    private allowEmailTable!: ModelStatic<any>;
    private denyEmailTable!: ModelStatic<any>;

    private cachedIds: BadgerId[]
    private readonly sequelize: Sequelize
    private readonly config: CS571Config<BadgerAuthPublicConfig, BadgerAuthSecretConfig>;

    public constructor(config: CS571Config<BadgerAuthPublicConfig, BadgerAuthSecretConfig>) {
        this.cachedIds = [];
        this.config = config;
        this.sequelize = new Sequelize(
            this.config.SECRET_CONFIG.SQL_CONN_DB,
            this.config.SECRET_CONFIG.SQL_CONN_USER,
            this.config.SECRET_CONFIG.SQL_CONN_PASS,
            {
                host: this.config.SECRET_CONFIG.SQL_CONN_ADDR,
                port: this.config.SECRET_CONFIG.SQL_CONN_PORT,
                dialect: 'mysql',
                retry: {
                    max: Infinity,
                    backoffBase: 5000
                }
            }
        );
    }

    public async init() {
        await this.sequelize.authenticate();
        this.badgerIdTable = await this.sequelize.define("BadgerId", {
            bid: {
                type: DataTypes.STRING(128),
                primaryKey: true,
                unique: true,
                allowNull: false
            },
            nickname: {
                type: DataTypes.STRING(128),
                allowNull: true
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            iat: {
                type: DataTypes.DATE,
                allowNull: false
            },
            eat: {
                type: DataTypes.DATE,
                allowNull: true
            }
        });
        await this.sequelize.sync()
        await this.syncCache();
        this.allowEmailTable = await this.sequelize.define("EmailException", {
            email: {
                type: DataTypes.STRING(255),
                primaryKey: true,
                unique: true,
                allowNull: false
            }
        });
        await this.sequelize.sync()
        this.denyEmailTable = await this.sequelize.define("EmailDenial", {
            email: {
                type: DataTypes.STRING(255),
                primaryKey: true,
                unique: true,
                allowNull: false
            }
        });
        await this.sequelize.sync()
    }

    public async isEmailTrulyAllowed(email: string) {
        const isDenied = await this.isEmailDenial(email);
        if (!isDenied) {
            const isBaseAllowed = this.config.PUBLIC_CONFIG.IS_WISC_ONLY ? CS571Emailer.isWiscEmail(email) : (CS571Emailer.isValidEmail(email) && !CS571Emailer.isWiscEmail(email));
            if (isBaseAllowed) {
                return true;
            } else {
                const isExcepted = await this.isEmailException(email);
                if (isExcepted) {
                    return true;
                } else {
                    return false;
                }
            }
        } else {
            return false;
        }
    }

    public async isEmailDenial(email: string): Promise<boolean> {
        const foundEmail = await this.denyEmailTable.findOne({ where: { email } });
        return foundEmail ? true : false;
    }

    public async createEmailDenial(email: string): Promise<void> {
        if (!(await this.isEmailDenial(email))) {
            await this.denyEmailTable.create({ email })
            await this.sequelize.sync();
        }

    }

    public async removeEmailDenial(email: string): Promise<void> {
        if (await this.isEmailDenial(email)) {
            await this.denyEmailTable.destroy({ where: { email } })
            await this.sequelize.sync();
        }
    }

    public async isEmailException(email: string): Promise<boolean> {
        const foundEmail = await this.allowEmailTable.findOne({ where: { email } });
        return foundEmail ? true : false;
    }

    public async createEmailException(email: string): Promise<void> {
        if (!(await this.isEmailException(email))) {
            await this.allowEmailTable.create({ email })
            await this.sequelize.sync();
        }

    }

    public async removeEmailException(email: string): Promise<void> {
        if (await this.isEmailException(email)) {
            await this.allowEmailTable.destroy({ where: { email } })
            await this.sequelize.sync();
        }
    }

    public async createBadgerIds(bids: BadgerId[]): Promise<void> {
        await this.badgerIdTable.bulkCreate(bids.map(bid => { return { ...bid } }));
        await this.sequelize.sync();
        await this.syncCache();
    }

    public async createBadgerId(bid: BadgerId): Promise<void> {
        await this.badgerIdTable.create({ ...bid });
        await this.sequelize.sync();
        await this.syncCache();
    }

    public async revokeAllBadgerIds(email: string): Promise<boolean> {
        const foundBid = await this.badgerIdTable.findOne({ where: { email } });
        if (foundBid) {
            await this.badgerIdTable.destroy({ where: { email } });
            await this.syncCache();
            return true;
        } else {
            return false;
        }
    }

    public async revokeBadgerId(email: string, bid: string): Promise<boolean> {
        const foundBid = await this.badgerIdTable.findOne({ where: { email, bid } });
        if (foundBid) {
            await this.badgerIdTable.destroy({ where: { email, bid } });
            await this.syncCache();
            return true;
        } else {
            return false;
        }
    }

    public isValidBID(bid: string): boolean {
        const foundBid = this.cachedIds.find(cid => cid.bid === bid);
        return (foundBid !== undefined) && (!foundBid.eat || foundBid.eat.getTime() >= new Date().getTime());
    }

    public async getBadgerId(bid: string): Promise<BadgerId> {
        return await this.badgerIdTable.findOne({ where: { bid } });
    }

    public async getBadgerIdsForEmail(email: string): Promise<BadgerId[]> {
        return await this.badgerIdTable.findAll({ where: { email } });
    }

    public async getAllBadgerIds(): Promise<BadgerId[]> {
        return await this.badgerIdTable.findAll();
    }

    private async syncCache(): Promise<void> {
        this.cachedIds = (await this.badgerIdTable.findAll())
    }
}
