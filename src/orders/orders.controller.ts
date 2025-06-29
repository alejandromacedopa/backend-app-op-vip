import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtRole } from 'src/auth/jwt/jwt-role';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { JwtRolesGuard } from 'src/auth/jwt/jwt-roles.guard';
import { HasRoles } from 'src/auth/jwt/has-roles';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {

    constructor(private ordersService: OrdersService) {}

    @HasRoles(JwtRole.ADMIN)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Get()
    findAll() {
        return this.ordersService.findAll()
    }
    
    @HasRoles(JwtRole.CLIENT, JwtRole.ADMIN)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Get(':id_client')
    findByClient(@Param('id_client', ParseIntPipe) idClient: number) {
        return this.ordersService.findByClient(idClient);
    }
    
    @HasRoles(JwtRole.ADMIN)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Put(':id')
    updateStatus(@Param('id', ParseIntPipe) id: number) {
        return this.ordersService.updateStatus(id);
    }

    @HasRoles(JwtRole.CLIENT, JwtRole.ADMIN)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Post()
    create(@Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.create(createOrderDto);
    }
}
    

