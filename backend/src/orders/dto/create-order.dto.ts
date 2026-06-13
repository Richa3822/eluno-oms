export class CreateOrderDto {
    customerName: string;
    storeLocation: string;
    prescription: {
      rightEye: { sph: number; cyl: number; axis: number };
      leftEye: { sph: number; cyl: number; axis: number };
    };
    frameId?: string;
    lensType: string;  // SINGLE_VISION, PROGRESSIVE, BIFOCAL
    lensIndex: string; // 1.50, 1.56, 1.61, 1.67, 1.74
    coating: string;   // AR, BLUE_CUT, PHOTOCHROMIC, NONE
  }