import { FINANCE_MODULES } from './finance';
import { INFRASTRUCTURE_MODULES } from './infrastructure';
import { USER_MODULES } from './user';

export const MODULES = [...USER_MODULES, ...FINANCE_MODULES, ...INFRASTRUCTURE_MODULES];
