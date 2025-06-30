import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class BooleanValidationPipe implements PipeTransform {
  transform(value: string | undefined, metadata: ArgumentMetadata) {
    if (value === undefined) return undefined;
    if (value === 'true') return true;
    if (value === 'false') return false;

    throw new BadRequestException('Active field is not a boolean type');
  }
}
