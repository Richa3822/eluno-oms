import { IsString, IsIn, IsNotEmpty, IsOptional } from 'class-validator';

const STATUSES = [
  'ORDER_PLACED',
  'LENS_CUTTING',
  'QC_CHECK',
  'QC_PASSED',
  'QC_FAILED',
  'DISPATCH',
  'DELIVERED',
];

export class UpdateStatusDto {
  @IsIn(STATUSES)
  status: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}
