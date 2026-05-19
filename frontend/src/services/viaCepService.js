export async function buscarCep(cep) {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) throw new Error("CEP deve ter 8 dígitos.");

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!response.ok) throw new Error("Erro ao consultar o CEP.");

  const data = await response.json();
  if (data.erro) throw new Error("CEP não encontrado.");

  const parts = [data.logradouro, data.bairro, `${data.localidade}/${data.uf}`].filter(Boolean);
  return parts.join(", ");
}
