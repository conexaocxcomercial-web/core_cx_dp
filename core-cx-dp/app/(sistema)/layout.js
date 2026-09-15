import { redirect } from 'next/navigation';
import { usuarioDaSessao } from '@/lib/sessao';
import { sair } from '@/app/acoes';
import { Trilho } from '@/componentes/Trilho';

export const dynamic = 'force-dynamic';

export default async function LayoutDoSistema({ children }) {
  const usuario = await usuarioDaSessao();
  if (!usuario) redirect('/entrar');

  return (
    <div className="min-h-dvh">
      <Trilho usuario={usuario} sair={sair} />
      <main className="lg:pl-[232px]">
        <div className="mx-auto max-w-conteudo px-5 py-8 sm:px-8 sm:py-10">{children}</div>
      </main>
    </div>
  );
}
