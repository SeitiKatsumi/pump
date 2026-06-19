import type { CommandCode } from '../types';

export const COMMAND_LABELS: Record<CommandCode, string> = {
  ss: 'Subida',
  dd: 'Descida',
  cc: 'Continua',
  pp: 'Pausa',
  xx: 'Acao Extra',
  rr: 'Reset',
};

export const COMMAND_DESCRIPTIONS: Record<CommandCode, string> = {
  ss: 'Envia comando de subida',
  dd: 'Envia comando de descida',
  cc: 'Continua operacao',
  pp: 'Pausa operacao',
  xx: 'Comando reservado configuravel',
  rr: 'Reinicia o equipamento',
};

export const ALLOWED_COMMANDS = Object.keys(COMMAND_LABELS) as CommandCode[];

export const emptyCommandCounts = () => ({
  ss: 0,
  dd: 0,
  cc: 0,
  pp: 0,
  xx: 0,
  rr: 0,
});
