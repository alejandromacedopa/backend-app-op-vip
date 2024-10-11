import { IsNotEmpty, IsString } from "class-validator";

export class CreateCategoriesDto{
    @IsNotEmpty()
    @IsString()
    name:string;

    @IsNotEmpty()
    @IsString()
    description:string;
 
    image :string;
    

}