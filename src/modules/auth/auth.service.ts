import {Component, Inject} from "@nestjs/common";
import {JWTService} from "./jwt/jwt.service";
import {Model} from "sequelize-typescript";
import {SessionsRepository} from "./session/session.provider";
import {CONST} from "../../infra/const";
import {Session} from "./session/session.entity";
import * as uuidv1 from 'uuid/v1'
import {IAuthToken} from "./jwt/token.type";
import {User} from "../user/user.entity";
import {literal} from "sequelize";

@Component()
export class AuthService {
  constructor(
    @Inject(SessionsRepository) private readonly sessionRepository: typeof Model,
    private readonly jwtService: JWTService) {}

  async createSession(userId: number, useragent: string): Promise<string> {
    const expires = Date.now() + CONST.twoweeks
    const session = new Session({
      sid: uuidv1(),
      user_id: userId,
      expires: new Date(expires),
      useragent: useragent
    })
    const newSess = await session.save()
    const token = this.jwtService.createToken(newSess.sid, userId, 1)

    return token
  }

  updateSession(verified: IAuthToken): void {
    const {sid, user_id} = verified
    this.sessionRepository.update({
      expires: Date.now() + CONST.twoweeks,
      refreshed_times: literal('refreshed_times + 1')
    }, {
      where: {sid, user_id}
    })
  }

  async verifySession(sid, user_id): Promise<any> {
    const session = await this.sessionRepository.findOne<Session>({
      where: {sid, user_id},
      include: [User]
    })

    if (!session) {
      throw new Error("::404:: No session found")
    }

    if (new Date() > new Date(session.expires)) {
      throw new Error("Session outdated")
    }

    return session
  }
}
