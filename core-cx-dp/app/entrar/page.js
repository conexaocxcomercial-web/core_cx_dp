import { FormularioDeEntrada } from './formulario';

export const metadata = { title: 'Entrar' };

export default async function Entrar({ searchParams }) {
  const parametros = await searchParams;
  const destino = typeof parametros?.de === 'string' ? parametros.de : '/painel';

  return (
    <main className="sobre-escuro pautado flex min-h-dvh items-center justify-center bg-tinta px-5 py-12">
      <div className="w-full max-w-[424px]">
        <FormularioDeEntrada destino={destino} />
        <p className="mt-6 text-center text-[12.5px] text-folha/45">
          Uma solução core.cx de RH estratégico
        </p>
      </div>
    </main>
  );
}
