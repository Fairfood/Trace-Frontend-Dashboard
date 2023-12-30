import { Validators } from '@angular/forms';
import { quantityRegex } from 'src/app/shared/configs/app.constants';

export const RECEIVE_FORM = {
  node: ['', Validators.required],
  name: ['', Validators.required],
  type: [2],
  product: [''],
  productName: [
    '',
    [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
  ],
  quantity: [
    '',
    [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(11),
      Validators.pattern(quantityRegex),
    ],
  ],
  unit: ['1'],
  currency: [''],
  price: [
    '',
    [
      Validators.required,
      Validators.minLength(1),
      Validators.pattern(quantityRegex),
    ],
  ],
  supply_chain: [''],
  date: [new Date(), Validators.required],
  receipt: [''],
};
