import { Topping } from '../models/topping.model';

export interface Pizza {
  id?: number;
  name?: string;
  toppings?: Topping[];
}
