import { HttpStatus, Injectable,Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';




@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit{
 

  private readonly logger = new Logger('ProductsServices')

  onModuleInit() {
    this.$connect()
    this.logger.log('database Connect')
  }


  create(createProductDto: CreateProductDto) {
    
    return this.product.create({
      data: createProductDto
    });
    
  }

  async findAll(paginationDto: PaginationDto) {
   const { page , limit} = paginationDto
   const totalPage = await this.product.count({where: {available: true}} );
    const lastpage =  Math.ceil(totalPage / limit!)

    return {
        data: await this.product.findMany({
      skip: (page! -1 ) * limit! as number,
      take: limit,
      where: {available: true}
     }),
    meta:{
      Total :totalPage,
      page:page,
      lastpage:lastpage,
      pagina: `${page} de ${lastpage }` 

    }


    }
  
  }

  async findOne(id: number) {
  const product = await this.product.findFirst({
      where :{id:id,available: true}
    })
  if (!product){
    throw new RpcException({
      message: `Product by ID #${id} no found...`, 
      status: HttpStatus.BAD_REQUEST
    })
  }
  return product;
  
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    
    const {id: __, ...data} = updateProductDto;

    await this.findOne(id);
    
    return this.product.update({
      where :{id},
      data: data,
    })
    
    
    
    //`This action updates a #${id} product`;
  }

  async remove(id: number) {
    await this.findOne(id)
    //return this.product.delete({where:{id}});


    const product = await this.product.update({
      where :{id},
      data: {
      available: false
      }
    })
    return product
  }


   async validateProducts(ids: number[]) {
    
    ids = Array.from(new Set(ids));
     const product = await this.product.findMany({
      where:{id :{in: ids}}
     });

     if (product.length !== ids.length){
      throw new RpcException({
        message: 'Some products were not found',
        status: HttpStatus.BAD_REQUEST,
      })
     }

     return  product;

  }
}



