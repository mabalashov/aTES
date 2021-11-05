import {
  Body,
  Controller, Get,
  HttpCode, Param,
  Post,
  Render, Req, Res, UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import {Request, Response} from "express";
// import {AuthGuard} from "@nestjs/passport";
import {JwtOptionalAuthGuard} from "./guards/jwt-optional.guard";
import {UsersService} from "../users/users.service";
import {Role} from "../users/entities/user";
import {UserDto} from "../users/dto/user.dto";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  @Render('users')
  async users(@Req() req) {
    const users = await this.userService.findAll();
    const roles = Object.keys(Role)
      .map(key => ({ key, value: Role[key]}));

    return {
      user: req.user,
      users,
      roles,
    }
  }

  @Post('user/:id')
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtOptionalAuthGuard)
  async changeUser(@Res() res: Response, @Req() req: Request, @Param('id') id: number, @Body() user: UserDto) {
    try {
      await this.userService.update(id, user);
    } catch (e) {
      req.flash('error', e.response || 'Server Error');
    }

    return res.redirect('..' );
  }

  @UsePipes(new ValidationPipe())
  @Post('register')
  async postRegister(@Body() auth: AuthDto, @Res() res, @Req() req: Request) {
    try {
      res.cookie('x-auth-token',
        await this.authService.register(auth.login, auth.password),
      );

      return res.redirect('.');
    } catch (e) {
      req.flash('error', e.response || 'Server Error');

      return res.redirect('./register');
    }
  }

  @Get('register')
  @Render('register')
  async getRegister(@Req() req) {
    return {
      message: req.flash('error') || '',
    };
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('login')
  async login(@Body() auth: AuthDto, @Res() res, @Req() req: Request) {
    try {
      const username = await this.authService.validateUser(
        auth.login,
        auth.password,
      );

      res.cookie('x-auth-token',
        await this.authService.login(username),
      );

      return res.redirect('.');
    } catch (e) {
      req.flash('error', e.response || 'Server Error');

      return res.redirect('./login');
    }
  }

  @Get('login')
  @Render('login')
  async getLogin(@Req() req) {
    return {
      message: req.flash('error') || ''
    };
  }

  @HttpCode(200)
  @Get('logout')
  async logout(@Res() res, @Req() req: Request) {
    try {
      res.cookie('x-auth-token', null);

    } catch (e) {
      req.flash('error', e.response || 'Server Error');
    }

    return res.redirect('.');
  }
}
