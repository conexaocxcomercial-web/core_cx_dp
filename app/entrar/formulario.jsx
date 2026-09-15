'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { entrar } from '@/app/acoes';
import { Carimbo, Marca } from '@/componentes/Marca';
import { Texto } from '@/componentes/Campos';
import { BotaoEnviar } from '@/componentes/Botao';

/** O carimbo é pressionado enquanto o acesso é conferido. */
function CarimboDoAcesso() {
  const { pending } = useFormStatus();
  return <Carimbo pressionado={pending} className="h-[84px] w-[84px] -rotate-[8deg] text-carimbo" />;
}

export function FormularioDeEntrada({ destino }) {
  const [estado, executar] = useActionState(entrar, {});

  return (
    <form action={executar} className="rounded-[12px] bg-folha px-7 pb-8 pt-7 sm:px-9">
      <div className="flex items-start justify-between">
        <Marca tom="escuro" />
        <CarimboDoAcesso />
      </div>

      <h1 className="expandido mt-8 text-[27px] font-semibold leading-[1.15]">
        Registro de pessoal
      </h1>
      <p className="mt-2 max-w-[40ch] text-[14px] leading-relaxed text-tinta-70">
        Entre para consultar a ficha dos colaboradores e lançar ocorrências, atestados e
        movimentações.
      </p>

      <input type="hidden" name="destino" value={destino} />

      <div className="mt-7 space-y-4">
        <Texto
          rotulo="E-mail"
          nome="email"
          type="email"
          autoComplete="username"
          placeholder="voce@suaempresa.com.br"
          required
        />
        <Texto
          rotulo="Senha"
          nome="senha"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {estado?.erro ? (
        <p className="mt-4 border-l-[3px] border-recusa pl-3 text-campo leading-relaxed text-recusa">
          {estado.erro}
        </p>
      ) : null}

      <div className="mt-6">
        <BotaoEnviar enviando="Conferindo…" className="w-full">
          Entrar
        </BotaoEnviar>
      </div>

      <p className="mt-5 border-t border-linha pt-4 text-[12.5px] leading-relaxed text-tinta-50">
        Perdeu o acesso? Quem administra a plataforma pode recriar sua senha nas configurações do
        projeto.
      </p>
    </form>
  );
}
