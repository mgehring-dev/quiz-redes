function readBodyMessage(body: unknown): string | undefined {
  if (typeof body === "string" && body.length > 0) return body;
  if (Array.isArray(body) && body.length > 0) return body.map(String).join("\n");
  if (body && typeof body === "object") {
    const obj = body as Record<string, unknown>;
    for (const key of ["message", "mensagem", "Message", "Mensagem"]) {
      const value = obj[key];
      if (typeof value === "string" && value.length > 0) return value;
    }
  }
  return undefined;
}

/** Extrai uma mensagem legível de um erro do axios (mesmo contrato do CRM) */
export function errorResponse(term: unknown): string {
  if (term && typeof term === "object") {
    const obj = term as Record<string, unknown>;
    const response = obj.response as Record<string, unknown> | undefined;
    const fromAxios = response ? readBodyMessage(response.data) : undefined;
    if (fromAxios) return fromAxios;
    const fromMessage = readBodyMessage(obj);
    if (fromMessage) return fromMessage;
  }
  if (typeof term === "string" && term.length > 0) return term;
  return "Ocorreu um erro.";
}
