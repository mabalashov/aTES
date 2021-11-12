import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Render,
  Req,
  Res, UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe
} from "@nestjs/common";
import {TasksService} from "./tasks.service";
import {Request, Response} from "express";
import {JwtOptionalAuthGuard} from "../auth/guards/jwt-optional.guard";
import {CreateTaskDto} from "./dto/create.task.dto";

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly taskService: TasksService,
  ) {
  }

  @Get('')
  @Render('index')
  @UseGuards(JwtOptionalAuthGuard)
  async index(@Req() req: Request) {
    const tasks = (await this.taskService.findAll())

    const taskRecords = [];
    for (const task of tasks) {
      const canClose = await this.taskService.isOwner(parseInt(req.user['id']), task.id)
        && !task.isFinished
        && task.isReady;

      taskRecords.push({ task, canClose });
    }

    return {
      tasks: taskRecords,
      user: req.user,
      headers: req.headers,
    };
  }

  @Post('task')
  @UsePipes(new ValidationPipe())
  async create(@Res() res: Response, @Body() dto: CreateTaskDto) {
    await this.taskService.createTask(dto);

    return res.redirect('.');
  }

  @Post('tasks-assign')
  async reassignTasks(@Res() res: Response) {
    await this.taskService.reassignTasks();

    return res.redirect('.');
  }

  @Post('finish/:id')
  @UseGuards(JwtOptionalAuthGuard)
  async finishTask(
    @Res() res: Response,
    @Req() req: Request,
    @Param('id') id: number,
  ) {
    const isOwner = await this.taskService.isOwner(req.user['id'], id);
    if (!isOwner) {
      throw new UnauthorizedException();
    }

    await this.taskService.finishTask(id);

    return res.redirect('..');
  }
}