import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsNumber,
  ValidateNested,
} from 'class-validator';

const LENS_TYPES = ['SINGLE_VISION', 'PROGRESSIVE', 'BIFOCAL'];
const LENS_INDICES = ['1.50', '1.56', '1.61', '1.67', '1.74'];
const COATINGS = ['AR', 'BLUE_CUT', 'PHOTOCHROMIC', 'NONE'];

class EyePrescriptionDto {
  @IsNumber()
  sph: number;

  @IsNumber()
  cyl: number;

  @IsNumber()
  axis: number;
}

class PrescriptionDto {
  @ValidateNested()
  @Type(() => EyePrescriptionDto)
  rightEye: EyePrescriptionDto;

  @ValidateNested()
  @Type(() => EyePrescriptionDto)
  leftEye: EyePrescriptionDto;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  storeLocation: string;

  @ValidateNested()
  @Type(() => PrescriptionDto)
  prescription: PrescriptionDto;

  @IsOptional()
  @IsString()
  frameId?: string;

  @IsIn(LENS_TYPES)
  lensType: string;

  @IsIn(LENS_INDICES)
  lensIndex: string;

  @IsIn(COATINGS)
  coating: string;
}
