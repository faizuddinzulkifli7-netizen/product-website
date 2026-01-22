import { IsString, IsEmail, IsObject, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class ShippingAddressDto {
  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zipCode: string;

  @IsString()
  country: string;
}

export class CheckoutDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @IsString()
  @IsOptional()
  guestId?: string;
}

export class UpdateOrderStatusDto {
  @IsString()
  status: string;
}

export class UpdatePaymentStatusDto {
  @IsString()
  paymentStatus: string;
}

