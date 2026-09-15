import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

export const NOME_DO_COOKIE = 'core_cx_sessao';
const DURACAO = 60 * 60 * 10; // 10 horas: cobre um turno de trabalho.

export function segredo() {
  const chave = process.env.AUTH_SECRET;
  if (!chave) {
    throw new Error('Defina AUTH_SECRET nas variáveis de ambiente.');
  }
  return new TextEncoder().encode(chave);
}

export function listarUsuarios() {
  const bruto = process.env.AUTH_USUARIOS;
  if (!bruto) return [];

  try {
    const lista = JSON.parse(bruto);
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

export function encontrarUsuario(email, senha) {
  const procurado = String(email || '').trim().toLowerCase();
  return listarUsuarios().find(
    (usuario) =>
      String(usuario.email || '').trim().toLowerCase() === procurado &&
      String(usuario.senha || '') === String(senha || '')
  );
}

export async function abrirSessao(usuario) {
  const token = await new SignJWT({
    nome: usuario.nome || usuario.email,
    email: usuario.email,
    cliente: String(usuario.cliente || '').trim(),
    empresa: usuario.empresa || usuario.cliente,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${DURACAO}s`)
    .sign(segredo());

  const pote = await cookies();
  pote.set(NOME_DO_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: DURACAO,
  });
}

export async function fecharSessao() {
  const pote = await cookies();
  pote.delete(NOME_DO_COOKIE);
}

export async function usuarioDaSessao() {
  const pote = await cookies();
  const token = pote.get(NOME_DO_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, segredo());
    if (!payload.cliente) return null;

    return {
      nome: payload.nome,
      email: payload.email,
      cliente: payload.cliente,
      empresa: payload.empresa || payload.cliente,
    };
  } catch {
    return null;
  }
}
