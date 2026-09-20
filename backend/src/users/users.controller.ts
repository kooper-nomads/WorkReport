import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service.js';
import type { WorksectionUser } from '../worksection/worksection.types.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<WorksectionUser[]> {
    return this.usersService.findAll();
  }
}
