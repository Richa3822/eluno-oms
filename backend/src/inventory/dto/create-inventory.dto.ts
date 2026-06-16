import {
  IsString,
  IsIn,
  IsNumber,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';

const LENS_TYPES = ['SINGLE_VISION', 'PROGRESSIVE', 'BIFOCAL'];
const LENS_INDICES = ['1.50', '1.56', '1.61', '1.67', '1.74'];
const COATINGS = ['AR', 'BLUE_CUT', 'PHOTOCHROMIC', 'NONE'];

export class CreateInventoryDto {
  @IsNumber()
  powerSph: number;

  @IsOptional()
  @IsNumber()
  powerCyl?: number;

  @IsOptional()
  @IsInt()
  powerAxis?: number;

  @IsIn(LENS_TYPES)
  lensType: string;

  @IsIn(LENS_INDICES)
  lensIndex: string;

  @IsIn(COATINGS)
  coating: string;

  @IsInt()
  @Min(0)
  quantity: number;
}
