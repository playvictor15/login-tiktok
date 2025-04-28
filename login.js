let usuario = null;

export function iniciarLoginTikTok() {
  // Redireciona para a autenticação (simulado aqui, pois o TikTok OAuth real exige backend)
  alert('Simulação de login TikTok: você foi logado!');
  localStorage.setItem('usuario', JSON.stringify({
    nome: 'Usuário Teste',
    id: '123',
    foquinhos: [
      { nome: 'Foquinho Azul', tipo: 'ativo' },
      { nome: 'Foquinho Gelo', tipo: 'congelado' },
      { nome: 'Foquinho Fantasma', tipo: 'apagado' }
    ],
    amigos: [
      {
        nome: 'Amigo 1',
        foquinhos: [{ nome: 'Foquinho do Amigo', tipo: 'ativo' }]
      }
    ]
  }));
  window.location.reload();
}

export function usuarioLogado() {
  const data = localStorage.getItem('usuario');
  if (!data) return false;
  usuario = JSON.parse(data);
  return true;
}

export async function obterFoquinhosDoUsuario() {
  if (!usuario) return [];
  const meusFoquinhos = usuario.foquinhos || [];
  const amigosFoquinhos = usuario.amigos.flatMap(amigo => amigo.foquinhos);
  return [...meusFoquinhos, ...amigosFoquinhos];
}
