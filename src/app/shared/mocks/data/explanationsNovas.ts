import type { IExplanationSeed } from "./explanations";

// Explicações das perguntas 37–58. `motivos` segue a MESMA ordem de `options`.

export const explanationsNovas: Record<number, IExplanationSeed> = {
  37: {
    porQue: "O HTTP/2 mudou a forma de trocar mensagens (fluxos multiplexados, cabeçalhos binários), mas continua rodando sobre TCP.",
    conceito: [
      "HTTP/1.1 e HTTP/2 usam TCP. A grande mudança do HTTP/2 foi multiplexar várias requisições numa só conexão.",
      "O HTTP/3 é que troca o transporte: usa QUIC, que roda sobre UDP, para evitar que uma perda trave todos os fluxos.",
    ],
    motivos: ["Correto: o transporte do HTTP/2 é o TCP.", "Quem deixou o TCP foi o HTTP/3, não o HTTP/2."],
    dica: "Só o 3 sai do TCP.",
  },
  38: {
    porQue: "CNAME é um apelido: aponta um nome para outro nome. O nome final é que terá um registro A (IPv4) ou AAAA (IPv6).",
    conceito: [
      "Ex.: www.loja.com CNAME loja.hospedagem.com, e loja.hospedagem.com A 200.1.2.3. O resolvedor segue o apelido até achar o endereço.",
    ],
    motivos: ["Quem aponta para IPv4 é o registro A.", "Correto: CNAME aponta para outro nome."],
    dica: "CNAME = Canonical NAME: nome → nome.",
  },
  39: {
    porQue: "O UDP só entrega datagramas independentes, sem números de sequência nem retransmissão; eles podem chegar fora de ordem ou nem chegar.",
    conceito: [
      "Garantir ordem exige numerar os dados e reordenar no destino, o que o TCP faz e o UDP não.",
      "Aplicações sobre UDP que precisam de ordem (ex.: alguns jogos e o QUIC) implementam isso por conta própria.",
    ],
    motivos: ["Ordem garantida é característica do TCP.", "Correto: o UDP não garante ordem nem entrega."],
    dica: "UDP: manda e torce.",
  },
  40: {
    porQue: "O servidor não lembra das requisições, mas o navegador reenvia o cookie em cada uma. Com ele, o servidor reconhece a sessão.",
    conceito: [
      "No login o servidor responde com Set-Cookie: sessao=abc123. Daí em diante, o navegador manda Cookie: sessao=abc123 automaticamente.",
      "O HTTP continua stateless; quem carrega o estado é o cookie (ou um token no cabeçalho Authorization).",
    ],
    motivos: ["Correto: o cookie leva a identificação em cada requisição.", "Cookies existem justamente para contornar a falta de estado do HTTP."],
    dica: "Cookie = crachá mostrado em toda porta.",
  },
  41: {
    porQue: "O ACK do Go-Back-N significa “recebi tudo até o quadro n”, então ele confirma de uma vez todos os quadros anteriores.",
    conceito: [
      "Como o receptor só aceita quadros em ordem, basta informar o último recebido em sequência.",
      "Vantagem: se um ACK se perde, o próximo cobre o anterior. Desvantagem: o emissor não sabe quais quadros depois do perdido chegaram.",
    ],
    motivos: ["Correto: o ACK é cumulativo.", "No Go-Back-N o ACK é cumulativo; ACK individual é do Selective Repeat."],
    dica: "ACK n no GBN = “até aqui, tudo certo”.",
  },
  42: {
    porQue: "O emissor precisa respeitar dois limites ao mesmo tempo, o do receptor e o da rede, então usa o menor entre rwnd e cwnd.",
    conceito: [
      "rwnd (controle de fluxo) é o espaço livre no buffer do receptor; cwnd (controle de congestionamento) é a estimativa do que a rede aguenta.",
      "Usar o maior estouraria um dos dois: ou o buffer do receptor, ou a rede.",
    ],
    motivos: ["Usar o maior desrespeitaria o limite mais apertado.", "Correto: a janela efetiva é min(rwnd, cwnd)."],
    dica: "Vale o limite mais apertado.",
  },
  43: {
    porQue: "O servidor primeiro se registra numa porta (bind), começa a escutar (listen) e então espera um cliente (accept).",
    conceito: [
      "accept() bloqueia até um cliente fazer connect(); aí devolve um socket novo só para aquele cliente.",
      "connect() é do cliente e sendto() é do UDP, então não entram no preparo do servidor TCP.",
    ],
    motivos: [
      "1ª lacuna: associa o socket a IP e porta.",
      "2ª lacuna: passa a escutar pedidos de conexão.",
      "3ª lacuna: espera e aceita um cliente.",
      "Não entra: connect() é usado pelo cliente.",
      "Não entra: sendto() é envio do UDP.",
    ],
    dica: "Servidor: BLA — Bind, Listen, Accept.",
  },
  44: {
    porQue: "404 é a resposta para recurso inexistente (erro do cliente) e 500 é falha no próprio servidor.",
    conceito: [
      "4xx: o pedido tem problema (endereço errado, sem permissão). 5xx: o servidor falhou ao processar um pedido válido.",
    ],
    motivos: [
      "1ª lacuna: 404 Not Found.",
      "2ª lacuna: 500 Internal Server Error.",
      "Não entra: 301 é redirecionamento permanente.",
      "Não entra: 200 é sucesso.",
    ],
    dica: "4 foi você, 5 fui eu.",
  },
  45: {
    porQue: "SMTP empurra a mensagem, o MX diz para qual servidor empurrar, e IMAP puxa a mensagem da caixa para ler.",
    conceito: [
      "O servidor do remetente consulta o MX do domínio do destinatário no DNS e entrega a mensagem por SMTP.",
      "O destinatário lê com IMAP (sincroniza, mantém no servidor) ou POP3 (baixa).",
    ],
    motivos: [
      "1ª lacuna: protocolo de envio.",
      "2ª lacuna: registro que indica o servidor de e-mail.",
      "3ª lacuna: protocolo de leitura.",
      "Não entra: HTTP é da web.",
      "Não entra: CNAME é apelido de nome.",
    ],
    dica: "SMTP empurra, IMAP puxa, MX aponta o caminho.",
  },
  46: {
    porQue: "O servidor responde SYN/ACK, o cliente confirma com ACK e, a partir daí, a conexão está ESTABLISHED.",
    conceito: [
      "Estados do TCP: o cliente vai de SYN_SENT para ESTABLISHED; o servidor, de LISTEN para SYN_RECEIVED e depois ESTABLISHED.",
      "TIME_WAIT é um estado do encerramento, de quem fechou primeiro; FIN também é de encerramento.",
    ],
    motivos: [
      "1ª lacuna: resposta do servidor ao SYN.",
      "2ª lacuna: confirmação final do cliente.",
      "3ª lacuna: estado de conexão aberta.",
      "Não entra: FIN encerra a conexão.",
      "Não entra: TIME_WAIT é do encerramento.",
      "Não entra: o SYN é enviado pelo cliente, antes disso.",
    ],
    dica: "SYN → SYN/ACK → ACK → ESTABLISHED.",
  },
  47: {
    porQue: "rwnd protege o buffer do receptor (controle de fluxo); cwnd protege a rede (controle de congestionamento).",
    conceito: [
      "O receptor informa a rwnd em todo segmento que envia. A cwnd é calculada pelo emissor: cresce com slow start e cai quando há perda.",
    ],
    motivos: [
      "1ª lacuna: janela anunciada pelo receptor.",
      "2ª lacuna: janela de congestionamento do emissor.",
      "3ª lacuna: o que o congestionamento protege.",
      "Não entra: proteger a aplicação não é papel desses controles.",
      "Não entra: porta identifica o processo, não é um limite de envio.",
    ],
    dica: "r de receptor, c de congestionamento.",
  },
  48: {
    porQue: "Cada tipo de registro guarda uma informação: endereço IPv4, endereço IPv6, outro nome ou o servidor de e-mail.",
    conceito: [
      "A e AAAA levam a endereços; CNAME e MX levam a nomes. NS indica os servidores de nomes do domínio.",
    ],
    motivos: [
      "Par de A.",
      "Par de AAAA (o IPv6 tem 128 bits, 4× o IPv4).",
      "Par de CNAME.",
      "Par de MX.",
      "Sobra: essa é a função do registro NS.",
    ],
    dica: "AAAA tem 4 letras porque o IPv6 é 4× maior.",
  },
  49: {
    porQue: "O primeiro dígito diz o tipo de resposta: 2 sucesso, 3 redirecionamento, 4 erro do cliente, 5 erro do servidor.",
    conceito: STATUS_CONCEITO(),
    motivos: ["Par de 200.", "Par de 301.", "Par de 404.", "Par de 500.", "Sobra: proibido é o 403."],
    dica: "2 deu certo, 3 vai pra lá, 4 foi você, 5 fui eu.",
  },
  50: {
    porQue: "Cada tarefa tem o seu protocolo de aplicação: web, envio de e-mail, leitura de e-mail e resolução de nomes.",
    conceito: [
      "Todos rodam na camada de aplicação, sobre TCP ou UDP. O DNS usa principalmente UDP; HTTP, SMTP e IMAP usam TCP.",
    ],
    motivos: ["Par de navegar em sites.", "Par de enviar e-mail.", "Par de ler mantendo no servidor.", "Par de traduzir nomes.", "Sobra: FTP é para transferir arquivos."],
    dica: "Web = HTTP · enviar = SMTP · ler = IMAP · nome = DNS.",
  },
  51: {
    porQue: "Cada versão resolveu um gargalo da anterior: 1.1 reaproveita a conexão, 2 multiplexa e 3 tira o bloqueio do TCP.",
    conceito: [
      "No HTTP/2 vários fluxos dividem a mesma conexão TCP; se um pacote se perde, todos esperam (head-of-line blocking).",
      "O HTTP/3 usa QUIC sobre UDP, com fluxos independentes e TLS embutido.",
    ],
    motivos: [
      "Par do HTTP/1.1.",
      "Par do HTTP/2.",
      "Par do HTTP/3.",
      "Sobra: conexão nova por requisição era o HTTP/1.0.",
    ],
    dica: "1.1 persiste, 2 multiplexa, 3 corre no QUIC.",
  },
  52: {
    porQue: "As chamadas mudam conforme existe conexão (TCP) ou não (UDP) e conforme o papel: servidor aceita, cliente conecta.",
    conceito: [
      "TCP: o cliente faz connect(), o servidor faz accept(), e os dois trocam dados com send()/recv().",
      "UDP: não há conexão; cada envio diz o destino (sendto) e cada recebimento informa a origem (recvfrom).",
    ],
    motivos: ["Par de send()/recv().", "Par de sendto()/recvfrom().", "Par de accept().", "Par de connect()."],
    dica: "“to” e “from” = endereço junto (UDP).",
  },
  53: {
    porQue: "Com o HTTP stateless, cada requisição é independente e o balanceador pode mandá-la a qualquer servidor. Se a sessão está na memória de um só, os outros não a reconhecem.",
    conceito: [
      "Soluções comuns: guardar a sessão num armazenamento compartilhado (ex.: Redis, banco de dados) ou usar tokens assinados (JWT), que dispensam guardar sessão.",
      "“Sticky sessions” (prender o usuário a um servidor) também funciona, mas perde a sessão se aquele servidor cair.",
    ],
    motivos: [
      "Correta: o problema é onde a sessão fica, não o protocolo.",
      "Balanceadores HTTP não trocam o protocolo por UDP, e cookies não se perdem por isso.",
      "O handshake não apaga cookies; eles ficam no navegador.",
      "DNS não decide se o navegador guarda ou descarta cookies.",
    ],
    dica: "Vários servidores? A sessão precisa morar fora deles.",
  },
  54: {
    porQue: "Sem SYN/ACK o handshake não completa. Os SYNs repetidos são o cliente retransmitindo, com intervalos cada vez maiores, até desistir.",
    conceito: [
      "Se a porta estivesse fechada mas o servidor acessível, normalmente viria um RST na hora. Silêncio total costuma indicar firewall descartando, servidor fora do ar ou problema de rota.",
      "Na captura, as retransmissões aparecem marcadas como [TCP Retransmission].",
    ],
    motivos: [
      "Correta: o handshake nunca terminou.",
      "Controle de fluxo só atua com a conexão já aberta.",
      "O Four-Way Handshake usa FIN e ACK, não SYNs repetidos.",
      "Uma resposta a um SYN TCP seria TCP; não existe “resposta por UDP”.",
    ],
    dica: "SYN sem SYN/ACK = ninguém atendeu.",
  },
  55: {
    porQue: "Com janela grande e muitas perdas, o Go-Back-N reenvia muitos quadros que já tinham chegado. O SR reenvia só o que se perdeu.",
    conceito: [
      "Em enlaces de alto atraso a janela precisa ser grande para manter o canal ocupado; é aí que o custo do Go-Back-N cresce.",
      "O preço do SR é mais memória (buffer no receptor) e controle (timer e ACK por quadro).",
    ],
    motivos: [
      "Correta: retransmissão seletiva economiza banda.",
      "O ACK cumulativo economiza confirmações, mas não compensa reenviar dezenas de quadros.",
      "A janela é igual, mas o custo de cada perda é bem diferente.",
      "Guardar fora de ordem é do Selective Repeat, não do Go-Back-N.",
    ],
    dica: "Muita perda + atraso alto = Selective Repeat.",
  },
  56: {
    porQue: "As respostas DNS ficam em cache em vários pontos pelo tempo do TTL. Até expirarem, parte dos usuários continua recebendo o IP antigo.",
    conceito: [
      "Há cache no resolvedor do provedor, no sistema operacional e no navegador. Cada um respeita o TTL da resposta que recebeu.",
      "Boa prática: baixar o TTL (ex.: para 300 s) com antecedência, migrar e depois voltar a um TTL maior.",
    ],
    motivos: [
      "Correta: cache dos resolvedores.",
      "Correta: cache local do SO e do navegador.",
      "Correta: TTL baixo faz os caches renovarem mais cedo.",
      "O registro A é independente do MX.",
      "Servidores raiz não aprovam mudanças em registros do seu domínio.",
    ],
    dica: "Mudou o DNS? Quem manda na demora é o TTL.",
  },
  57: {
    porQue: "Em tempo real, um quadro que chega atrasado já não serve. A mídia vai por UDP/QUIC e o que não pode se perder vai por TCP.",
    conceito: [
      "Apps de vídeo (ex.: WebRTC) usam UDP para mídia e fazem a própria correção: pulam quadros, reduzem a qualidade quando a rede piora.",
      "Mesmo sobre UDP, é preciso algum controle de congestionamento, senão o app sobrecarrega a rede e piora a própria chamada.",
    ],
    motivos: [
      "Correta: menos atraso vale mais que um quadro perdido.",
      "Correta: a aplicação decide o que fazer com a perda.",
      "Correta: login e chat precisam chegar inteiros.",
      "Esperar o reenvio de quadros antigos gera atraso e travadas.",
      "Sem controle de congestionamento a rede satura e a chamada piora.",
    ],
    dica: "Tempo real: melhor perder que atrasar.",
  },
  58: {
    porQue: "Antes de pedir a página o navegador precisa do IP (DNS), de uma conexão (TCP) e, no HTTPS, de um canal seguro (TLS). Só então faz o GET e recebe a resposta.",
    conceito: [
      "Nas próximas visitas várias etapas podem ser puladas: o DNS fica em cache e a conexão pode ser reaproveitada.",
      "No HTTP/3 o TCP e o TLS são substituídos pelo QUIC, que faz os dois de uma vez.",
    ],
    motivos: [
      "1º: descobre o IP do servidor.",
      "2º: abre a conexão TCP.",
      "3º: negocia a criptografia do HTTPS.",
      "4º: pede a página.",
      "5º: recebe o HTML.",
      "Não entra: MX é para e-mail.",
    ],
    dica: "Nome → conexão → segurança → pedido → resposta.",
  },
};

function STATUS_CONCEITO() {
  return [
    "1xx informativo, 2xx sucesso, 3xx redirecionamento, 4xx erro do cliente, 5xx erro do servidor.",
    "Outros comuns: 201 Created, 304 Not Modified, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 503 Service Unavailable.",
  ];
}
