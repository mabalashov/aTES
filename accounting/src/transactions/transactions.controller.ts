import {Controller, Get, Render, Req, UseGuards} from '@nestjs/common';
import {JwtOptionalAuthGuard} from "../auth/guards/jwt-optional.guard";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Request} from "express";
import {Transaction} from "./entities/transaction";

@Controller('accounting')
export class TransactionsController {
  constructor(
    @InjectRepository(Transaction) private transactionsRepository: Repository<Transaction>,
  ) {
  }

  @Get('')
  @Render('index')
  @UseGuards(JwtOptionalAuthGuard)
  async index(@Req() req: Request) {

    const data = {};

    const userVendorId = parseInt(req.user['id']);

    if (userVendorId) {
      data['transactions'] = await this.transactionsRepository.find({
        where: {
          userVendorId,
        },
      })
    }

    return data;
  }

}
