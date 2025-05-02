import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user-dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { HasRoles } from 'src/auth/jwt/has-roles';
import { JwtRole } from 'src/auth/jwt/jwt-role';
import { JwtRolesGuard } from 'src/auth/jwt/jwt-roles.guard';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) { }

  @HasRoles(JwtRole.ADMIN)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @Get('clients') // http://localhost:3000/users/clients
  findClientsOnly() {
    return this.userService.findClientsOnly();
  }

  @HasRoles(JwtRole.CLIENT)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @Get() // http://localhost:3000/users -> GET
  findAll() {
    return this.userService.findAll();
  }
 
  // CREATE USER WITHOUT IMAGE
  @Post() // http://localhost:3000/users
  create(@Body() user: CreateUserDto) {
    return this.userService.create(user);
  }
  
  // CREATE USER WITH IMAGE
  @Post('upload') // http://localhost:3000/users/upload
  @UseInterceptors(FileInterceptor('file'))
  createWithImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() user: CreateUserDto,
  ) {
    return this.userService.createWithImage(file, user);
  }


  @HasRoles(JwtRole.CLIENT)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @Put(':id') // http://192.168.1.15:3000/users/:id -> PUT
  update(@Param('id', ParseIntPipe) id: number, @Body() user: UpdateUserDto) {
    return this.userService.update(id, user);
  }

  @HasRoles(JwtRole.CLIENT)
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @Put('upload/:id')
  @UseInterceptors(FileInterceptor('file'))
  updateWithImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Param('id', ParseIntPipe) id: number,
    @Body() user: UpdateUserDto,
  ) {
    return this.userService.updateWithImage(file, id, user);
  }
}
