import { cache } from 'react';
import { usuarioDaSessao } from '@/lib/sessao';
import { ErroDePlanilha } from '@/lib/planilha';

export const COLUNA_CLIENTE = 'Cliente';

/**
 * Toda leitura e toda gravação passam por aqui. O recorte por cliente
 * não é um parâmetro que alguém possa esquecer de passar: ele vem da
 * sessão, sempre.
 */
export const clienteAtual = cache(async () => {
  const usuario = await usuarioDaSessao();

  if (!usuario?.cliente) {
    throw new ErroDePlanilha(
      'Este acesso não está ligado a nenhuma empresa. Acrescente o campo "cliente" ao usuário em AUTH_USUARIOS.'
    );
  }

  return usuario.cliente;
});

export const empresaAtual = cache(async () => {
  const usuario = await usuarioDaSessao();
  return usuario?.empresa || usuario?.cliente || '';
});

export function mesmoCliente(valor, cliente) {
  return String(valor ?? '').trim().toLowerCase() === String(cliente).toLowerCase();
}

export function exigirColunaCliente(cabecalho, aba) {
  if (!cabecalho.includes(COLUNA_CLIENTE)) {
    throw new ErroDePlanilha(
      `A aba ${aba} ainda não tem a coluna Cliente. Acrescente uma coluna com esse nome exato no cabeçalho e preencha o código da empresa em cada linha.`
    );
  }
}
