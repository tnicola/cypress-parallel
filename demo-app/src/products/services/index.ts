import { PizzasService } from './pizzas.service';
import { ToppingsService } from './toppings.service';

export const services: any[] = [PizzasService, ToppingsService];

export * from './pizzas.service';
export * from './toppings.service';
