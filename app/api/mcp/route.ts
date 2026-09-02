import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const BASE = "https://brasilapi.com.br/api";

async function brasilApi(path: string) {
  const response = await fetch(`${BASE}${path}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const text = await response.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(`BrasilAPI HTTP ${response.status}: ${typeof data === "string" ? data : JSON.stringify(data)}`);
  }

  return data;
}

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "consultar_cep",
      {
        title: "Consultar CEP",
        description: "Consulta um CEP brasileiro na BrasilAPI. Aceita 8 dígitos, com ou sem hífen.",
        inputSchema: z.object({ cep: z.string().min(8).max(9) }),
      },
      async ({ cep }) => {
        const clean = cep.replace(/\\D/g, "");
        if (clean.length !== 8) throw new Error("CEP deve conter 8 dígitos.");
        const data = await brasilApi(`/cep/v2/${clean}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    );

    server.registerTool(
      "consultar_cnpj",
      {
        title: "Consultar CNPJ",
        description: "Consulta dados públicos de um CNPJ na BrasilAPI.",
        inputSchema: z.object({ cnpj: z.string().min(14).max(18) }),
      },
      async ({ cnpj }) => {
        const clean = cnpj.replace(/\\D/g, "");
        if (clean.length !== 14) throw new Error("CNPJ deve conter 14 dígitos.");
        const data = await brasilApi(`/cnpj/v1/${clean}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    );

    server.registerTool(
      "consultar_ddd",
      {
        title: "Consultar DDD",
        description: "Consulta informações de um DDD brasileiro.",
        inputSchema: z.object({ ddd: z.string().regex(/^\\d{2}$/) }),
      },
      async ({ ddd }) => {
        const data = await brasilApi(`/ddd/v1/${ddd}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    );

    server.registerTool(
      "listar_bancos",
      {
        title: "Listar bancos",
        description: "Lista bancos disponíveis na BrasilAPI.",
        inputSchema: z.object({}),
      },
      async () => {
        const data = await brasilApi("/banks/v1");
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    );

    server.registerTool(
      "consultar_banco",
      {
        title: "Consultar banco",
        description: "Consulta um banco pelo código bancário.",
        inputSchema: z.object({ codigo: z.coerce.number().int().positive() }),
      },
      async ({ codigo }) => {
        const data = await brasilApi(`/banks/v1/${codigo}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    );

    server.registerTool(
      "consultar_fipe",
      {
        title: "Consultar FIPE",
        description: "Consulta preços e dados da FIPE usando um código FIPE já conhecido.",
        inputSchema: z.object({ codigoFipe: z.string().min(3) }),
      },
      async ({ codigoFipe }) => {
        const data = await brasilApi(`/fipe/preco/v1/${encodeURIComponent(codigoFipe)}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    );

    server.registerTool(
      "consultar_feriados",
      {
        title: "Consultar feriados",
        description: "Consulta feriados nacionais de um ano na BrasilAPI.",
        inputSchema: z.object({ ano: z.coerce.number().int().min(1900).max(2200) }),
      },
      async ({ ano }) => {
        const data = await brasilApi(`/feriados/v1/${ano}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    );

    server.registerTool(
      "consultar_ibge_uf",
      {
        title: "Consultar UF",
        description: "Consulta dados de estados brasileiros pelo código IBGE.",
        inputSchema: z.object({ codigo: z.coerce.number().int().positive() }),
      },
      async ({ codigo }) => {
        const data = await brasilApi(`/ibge/uf/v1/${codigo}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    );
  },
  {
    serverInfo: { name: "BrasilAPI MCP", version: "1.0.0" },
    instructions: "Ferramentas para consultar dados públicos brasileiros por meio da BrasilAPI. Use as ferramentas quando a tarefa exigir dados atuais ou estruturados do Brasil.",
  },
);

export const GET = handler;
export const POST = handler;
