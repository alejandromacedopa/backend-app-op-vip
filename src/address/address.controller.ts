import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { AddressService } from './address.service';
import { HasRoles } from 'src/auth/jwt/has-roles';
import { JwtRole } from 'src/auth/jwt/jwt-role';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { JwtRolesGuard } from 'src/auth/jwt/jwt-roles.guard';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('address')
export class AddressController {
    constructor(private addressService: AddressService) {}

    @HasRoles(JwtRole.ADMIN, JwtRole.CLIENT)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Post()
    create(@Body() address: CreateAddressDto) {
        return this.addressService.create(address);
    }
    
    @HasRoles(JwtRole.ADMIN, JwtRole.CLIENT)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Get()
    findAll() {
        return this.addressService.findAll();
    }
    
    @HasRoles(JwtRole.ADMIN, JwtRole.CLIENT)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Get('user/:id_user')
    findByUser(@Param('id_user', ParseIntPipe) id_user: number) {
        return this.addressService.findByUser(id_user);
    }

    @HasRoles(JwtRole.ADMIN, JwtRole.CLIENT)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() address: UpdateAddressDto) {
        return this.addressService.update(id, address);
    }
    
    @HasRoles(JwtRole.ADMIN, JwtRole.CLIENT)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.addressService.delete(id);
    }
}
