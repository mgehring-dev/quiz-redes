// Explicações detalhadas de cada pergunta (abertas pelo botão "Entenda a resposta").
// `motivos` segue a MESMA ordem de `options` da pergunta.

export interface IExplanationSeed {
  porQue: string;
  conceito: string[];
  motivos: string[];
  dica: string;
}

// ---------- conceitos reaproveitados entre perguntas do mesmo assunto ----------

const ISP = [
  "A Internet é uma “rede de redes”. O ISP (Internet Service Provider) liga a sua casa ou empresa a essa malha: dá o acesso físico (fibra, cabo, rádio, 4G/5G), entrega um endereço IP e roteia os pacotes.",
  "Os ISPs se organizam em níveis: de acesso (Vivo, Claro, provedores regionais), regionais e de backbone (Tier 1). Eles trocam tráfego por peering (troca direta) ou trânsito (um paga o outro), muitas vezes em pontos de troca como o IX.br.",
];

const APLICACAO = [
  "Cada aplicação conversa usando um protocolo da camada de aplicação, que define o formato das mensagens. Ele roda sobre o transporte (TCP ou UDP), que roda sobre o IP.",
  "Navegador: envia uma requisição HTTP (ex.: GET /index.html) e recebe uma resposta com código de status, cabeçalhos e conteúdo. E-mail: o cliente entrega a mensagem com SMTP; o destinatário a busca com IMAP (mantém no servidor) ou POP3 (baixa).",
  "Outros protocolos de aplicação: FTP (arquivos), DNS (nomes), SSH (acesso remoto). ARP e ICMP já são de camadas de baixo (enlace e rede).",
];

const GET_POST = [
  "GET busca um recurso sem alterar nada. Os parâmetros vão na URL (ex.: /busca?q=mouse), então a requisição pode ser repetida, salva nos favoritos e guardada em cache.",
  "POST envia dados no corpo da requisição para o servidor processar ou criar algo: formulários, login, upload. Os dados não ficam na URL nem no histórico, e cada envio pode ter efeito no servidor.",
];

const STATUS = [
  "O primeiro dígito diz o tipo de resposta: 1xx informativo, 2xx sucesso, 3xx redirecionamento, 4xx erro do cliente, 5xx erro do servidor.",
  "Exemplos: 200 OK, 201 Created, 301 Moved Permanently (mudou de endereço para sempre), 304 Not Modified, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable.",
];

const DNS = [
  "O DNS traduz nomes (www.exemplo.com.br) em endereços IP. Ele é hierárquico: servidores raiz → servidores de TLD (.br, .com) → servidor autoritativo do domínio.",
  "Normalmente o seu computador faz uma consulta recursiva ao DNS local (do provedor, ou 8.8.8.8): “resolve pra mim”. O DNS local então faz consultas iterativas: pergunta à raiz, que indica o TLD, que indica o autoritativo, que responde o IP.",
  "As respostas ficam em cache pelo tempo do TTL, então as próximas consultas ao mesmo nome são instantâneas.",
];

const REGISTROS = [
  "A: nome → endereço IPv4 (ex.: 200.1.2.3). AAAA: nome → endereço IPv6 (o IPv6 tem 128 bits, quatro vezes os 32 do IPv4, daí os quatro A).",
  "CNAME: nome → outro nome, um apelido (ex.: www.loja.com → loja.hospedagem.com). MX: indica o servidor de e-mail do domínio, com prioridade. NS: indica os servidores de nomes responsáveis pelo domínio.",
];

const SMTP = [
  "1) O cliente de e-mail entrega a mensagem ao servidor SMTP do remetente (porta 587, com autenticação). 2) Esse servidor consulta no DNS o registro MX do domínio do destinatário. 3) Entrega ao servidor SMTP do destino (porta 25).",
  "4) A mensagem fica na caixa do destinatário, que lê depois com IMAP (as mensagens ficam no servidor, sincronizadas) ou POP3 (baixa para o aparelho). SMTP só “empurra”; ler é outro protocolo.",
];

const HANDSHAKE = [
  "1) O cliente envia SYN com seu número de sequência inicial (ISN). 2) O servidor responde SYN/ACK: confirma o número do cliente e envia o seu. 3) O cliente responde ACK confirmando o número do servidor.",
  "Depois disso a conexão fica ESTABLISHED e os dados podem fluir nos dois sentidos. O objetivo é que os dois lados combinem os números de sequência antes de trocar dados.",
];

const ENCERRAMENTO = [
  "A conexão TCP é full-duplex: cada sentido é fechado separadamente. 1) Um lado envia FIN (“não tenho mais dados”). 2) O outro confirma com ACK. 3) Quando termina, ele envia o seu FIN. 4) O primeiro confirma com ACK.",
  "Entre os passos 2 e 3 a conexão fica meio fechada (half-close): um lado ainda pode enviar. Quem fechou primeiro espera em TIME_WAIT para garantir que o último ACK chegou. RST é diferente: aborta a conexão na hora.",
];

const TCP_UDP = [
  "TCP: orientado à conexão (handshake), entrega confiável com ACK e retransmissão, garante a ordem, tem controle de fluxo e de congestionamento. Cabeçalho de pelo menos 20 bytes. Usado em web, e-mail, transferência de arquivos.",
  "UDP: sem conexão, sem garantia de entrega nem de ordem, sem controle de fluxo/congestionamento, cabeçalho de só 8 bytes. Usado onde atraso pesa mais que uma perda: DNS, VoIP, streaming ao vivo, jogos online.",
];

const SOCKET = [
  "Servidor: s = socket(AF_INET, SOCK_STREAM) → s.bind((host, porta)) → s.listen() → conn, addr = s.accept() → conn.recv()/conn.send() → conn.close().",
  "Cliente: s = socket(AF_INET, SOCK_STREAM) → s.connect((host, porta)) → s.send()/s.recv() → s.close(). O accept() devolve um socket novo só para aquele cliente; o original continua escutando.",
];

const GBN = [
  "No Go-Back-N o emissor pode ter até N quadros enviados sem confirmação (a janela). O receptor só aceita quadros em ordem e usa ACK cumulativo: “recebi tudo até o quadro k”.",
  "Se um quadro se perde, os que chegam depois são descartados. Quando o timer do quadro mais antigo estoura, o emissor reenvia esse quadro e todos os seguintes. Com perdas frequentes ou janela grande, muita banda é gasta repetindo quadros que já tinham chegado.",
];

const SR = [
  "No Selective Repeat o receptor aceita quadros fora de ordem (dentro da janela), guarda em buffer e confirma cada um individualmente. Quando o buraco é preenchido, entrega tudo em ordem para a camada de cima.",
  "O emissor mantém um timer por quadro e reenvia só o que não foi confirmado. Por isso é mais eficiente que o Go-Back-N com alta latência ou muitas perdas, ao custo de mais memória e controle.",
];

export const explanations: Record<number, IExplanationSeed> = {
  1: {
    porQue: "O papel central do ISP é dar acesso e conectar a rede do cliente ao resto da Internet, levando os pacotes até outras redes.",
    conceito: ISP,
    motivos: [
      "Correta: é exatamente o serviço do ISP — acesso e interligação com o resto da Internet.",
      "Traduzir nomes é função do DNS. O ISP até oferece um servidor DNS, mas essa não é a função que o define.",
      "Hospedagem de sites é outro serviço, oferecido por empresas de hospedagem e nuvem.",
      "Criptografia fim a fim é feita por protocolos como TLS/HTTPS, não pelo provedor.",
    ],
    dica: "ISP é o “cano” que traz a Internet até você.",
  },
  2: {
    porQue: "No P2P cada par que entra também serve dados, então a capacidade cresce junto com o número de usuários — não há um servidor central virando gargalo.",
    conceito: [
      "Cliente-Servidor: um servidor sempre ligado, com endereço fixo, atende muitos clientes (web, e-mail). É simples de controlar e proteger, mas o servidor pode sobrecarregar e é um ponto único de falha.",
      "P2P: os pares se comunicam diretamente e são clientes e servidores ao mesmo tempo (ex.: BitTorrent). Escala bem e é barato, mas é difícil de gerenciar, de proteger e de garantir que o conteúdo esteja disponível, porque os pares entram e saem.",
    ],
    motivos: [
      "Controle centralizado é vantagem do Cliente-Servidor, não do P2P.",
      "Correta: quem baixa também envia, então o sistema escala sozinho.",
      "Servidor sempre ligado com IP fixo é exigência do Cliente-Servidor.",
      "No P2P é mais difícil garantir segurança e disponibilidade, já que os pares são instáveis.",
    ],
    dica: "P2P escala sozinho; Cliente-Servidor se controla fácil.",
  },
  3: {
    porQue: "O navegador usa HTTP/HTTPS para pedir e receber páginas; o e-mail usa SMTP para enviar e IMAP/POP3 para ler.",
    conceito: APLICACAO,
    motivos: [
      "TCP é de transporte e IP é de rede; não são protocolos de aplicação.",
      "FTP é para arquivos e DNS para nomes; não são os protocolos principais do navegador e do e-mail.",
      "Correta: cada aplicação com o seu protocolo de aplicação.",
      "Está trocado: SMTP é de e-mail e HTTP é da web.",
    ],
    dica: "Web = HTTP. Enviar e-mail = SMTP. Ler e-mail = IMAP/POP3.",
  },
  4: {
    porQue: "Stateless significa que cada requisição é independente: o servidor não guarda memória das anteriores. Cookies e tokens fazem o cliente mandar essa identificação toda vez.",
    conceito: [
      "Por ser stateless, o servidor HTTP não sabe que duas requisições vieram da mesma pessoa. Isso simplifica e escala, mas exige um jeito de manter sessão.",
      "Cookie: o servidor envia Set-Cookie com um id de sessão; o navegador devolve esse cookie em toda requisição e o servidor busca os dados da sessão.",
      "Token (ex.: JWT): depois do login o cliente guarda um token assinado e o envia no cabeçalho Authorization; o servidor valida a assinatura sem precisar guardar sessão.",
    ],
    motivos: [
      "O HTTP usa TCP como transporte (ou QUIC, no HTTP/3).",
      "Conexões persistentes existem desde o HTTP/1.1; stateless fala de memória, não de conexão.",
      "É o oposto: stateless é justamente não guardar histórico.",
      "Correta: sem memória no servidor, o estado viaja em cookies ou tokens.",
    ],
    dica: "Stateless = memória de peixe. Cookie/token = crachá mostrado em cada porta.",
  },
  5: {
    porQue: "O HTTP/3 roda sobre QUIC, que usa UDP e trata cada fluxo separadamente: a perda de um pacote não trava os outros, como acontecia no TCP.",
    conceito: [
      "HTTP/1.1: conexões persistentes (keep-alive), mas uma requisição por vez em cada conexão; navegadores abriam várias conexões em paralelo.",
      "HTTP/2: multiplexa várias requisições numa única conexão TCP, com cabeçalhos binários e comprimidos. Mas, no TCP, um pacote perdido segura todos os fluxos (head-of-line blocking).",
      "HTTP/3: troca o TCP pelo QUIC (sobre UDP), com TLS embutido, conexão mais rápida e fluxos independentes.",
    ],
    motivos: [
      "Correta: QUIC sobre UDP, sem o bloqueio head-of-line do TCP.",
      "Multiplexação no mesmo fluxo só chegou no HTTP/2.",
      "O HTTP/2 continua sobre TCP; quem usa UDP (via QUIC) é o HTTP/3.",
      "O HTTP/1.1 foi justamente quem trouxe as conexões persistentes por padrão.",
    ],
    dica: "1.1 persiste, 2 multiplexa, 3 corre no QUIC.",
  },
  6: {
    porQue: "Um cadastro envia dados para o servidor criar algo. Isso vai no corpo da requisição, que é o papel do POST.",
    conceito: GET_POST,
    motivos: [
      "Só lê dados: GET, com a categoria na URL.",
      "Correta: envia dados no corpo para criar um registro.",
      "Abrir um link é um GET — por isso dá para salvar nos favoritos.",
      "Consulta sem alterar nada: GET com a cidade na URL.",
    ],
    dica: "GET pega, POST posta.",
  },
  7: {
    porQue: "200 é sucesso, 301 é redirecionamento permanente, 404 é recurso não encontrado e 500 é erro interno do servidor.",
    conceito: STATUS,
    motivos: [
      "Esses são 201, 401, 403 e 503.",
      "Não modificado é 304, requisição inválida é 400 e tempo esgotado é 408.",
      "Correta: 200 OK · 301 Moved Permanently · 404 Not Found · 500 Internal Server Error.",
      "Aceito é 202, temporário é 302/307 e gateway inválido é 502.",
    ],
    dica: "2 deu certo, 3 vai pra lá, 4 foi você, 5 fui eu.",
  },
  8: {
    porQue: "A diferença está em quem percorre a hierarquia: na recursiva o servidor consultado faz todo o trabalho; na iterativa cada servidor só indica o próximo a perguntar.",
    conceito: DNS,
    motivos: [
      "Está invertido: na iterativa é que se consulta servidor por servidor.",
      "As duas formas resolvem qualquer tipo de registro, IPv4 ou IPv6.",
      "Há diferença: muda quem vai atrás da resposta.",
      "Correta: recursiva = “resolve pra mim”; iterativa = “pergunta pra aquele ali”.",
    ],
    dica: "Recursiva: resolve pra mim. Iterativa: pergunta pra aquele ali.",
  },
  9: {
    porQue: "Cada tipo de registro guarda uma informação diferente: A e AAAA guardam IPs, CNAME guarda outro nome e MX indica o servidor de e-mail.",
    conceito: REGISTROS,
    motivos: [
      "Correta: é a função de cada registro.",
      "Trocou A com AAAA e CNAME com MX.",
      "Tudo trocado: A não é e-mail e CNAME não aponta IPv6.",
      "Tudo trocado: A não é apelido e MX não aponta IPv6.",
    ],
    dica: "AAAA tem 4 letras porque o IPv6 é 4× maior que o IPv4.",
  },
  10: {
    porQue: "O servidor do remetente precisa saber para onde entregar mensagens de @dominio.com. Ele descobre consultando o registro MX desse domínio no DNS.",
    conceito: SMTP,
    motivos: [
      "Criptografia é feita por TLS (STARTTLS), não pelo registro MX.",
      "Correta: o MX diz qual servidor aceita e-mails daquele domínio.",
      "A caixa fica no servidor de destino e é lida por IMAP/POP3.",
      "O MX não mexe no conteúdo da mensagem.",
    ],
    dica: "MX = Mail eXchanger, o “endereço do correio” do domínio.",
  },
  11: {
    porQue: "Os dois lados precisam combinar seus números de sequência iniciais: cada SYN é confirmado por um ACK, e o servidor junta o seu SYN com o ACK num só segmento.",
    conceito: HANDSHAKE,
    motivos: [
      "FIN é de encerramento, não de abertura.",
      "Ordem errada: o ACK final só vem depois do SYN/ACK.",
      "Correta: proposta (SYN), aceite (SYN/ACK) e confirmação (ACK).",
      "Quem inicia é o cliente, e FIN não participa da abertura.",
    ],
    dica: "Oi? (SYN) — Oi, tudo bem? (SYN/ACK) — Tudo! (ACK)",
  },
  12: {
    porQue: "A conexão TCP vai nos dois sentidos, e cada sentido é fechado separadamente com FIN e confirmado com ACK — por isso são quatro segmentos.",
    conceito: ENCERRAMENTO,
    motivos: [
      "RST aborta a conexão de forma abrupta; não é o encerramento normal.",
      "SYN abre conexão, não fecha.",
      "Expirar por inatividade não é o processo normal; o TCP encerra explicitamente.",
      "Correta: FIN e ACK de cada lado.",
    ],
    dica: "Tchau (FIN) — ok (ACK) — tchau também (FIN) — ok (ACK).",
  },
  13: {
    porQue: "São dois limites diferentes: o quanto o receptor aguenta (fluxo) e o quanto a rede aguenta (congestionamento). O TCP respeita o menor dos dois.",
    conceito: [
      "Controle de fluxo: o receptor anuncia na janela (rwnd) quanto espaço tem livre no buffer, e o emissor não manda além disso. Atua entre os dois hosts.",
      "Controle de congestionamento: o emissor mantém a janela de congestionamento (cwnd), que cresce com slow start e diminui quando detecta perda (timeout ou ACKs duplicados). Protege a rede. A janela efetiva é o mínimo entre rwnd e cwnd.",
    ],
    motivos: [
      "Correta: fluxo cuida do receptor; congestionamento cuida da rede.",
      "Está invertido.",
      "Os dois são mecanismos do TCP nos hosts, não dos roteadores.",
      "O UDP não tem nenhum dos dois.",
    ],
    dica: "Fluxo = não afogar o amigo. Congestionamento = não engarrafar a estrada.",
  },
  14: {
    porQue: "O TCP troca velocidade por garantias (entrega, ordem, fluxo e congestionamento); o UDP troca garantias por velocidade e simplicidade.",
    conceito: TCP_UDP,
    motivos: [
      "É o contrário: TCP garante ordem, UDP não.",
      "Correta: resume confiabilidade, ordem, fluxo, congestionamento e aplicações.",
      "Só o TCP é orientado à conexão.",
      "Inverteu: jogos preferem UDP e arquivos usam TCP.",
    ],
    dica: "TCP = carta registrada. UDP = panfleto.",
  },
  15: {
    porQue: "O servidor precisa se registrar numa porta e esperar clientes (bind, listen, accept); o cliente só precisa saber onde se conectar (connect).",
    conceito: SOCKET,
    motivos: [
      "Inverteu os papéis de cliente e servidor.",
      "sendto/recvfrom são do UDP, que não tem conexão.",
      "Correta: o servidor prepara e espera; o cliente conecta.",
      "connect é do cliente e accept é do servidor.",
    ],
    dica: "Servidor: BLA — Bind, Listen, Accept. Cliente: Connect.",
  },
  16: {
    porQue: "O handshake é sempre o começo de uma conversa TCP, então aparece nos três primeiros segmentos da conexão: SYN, SYN/ACK e ACK.",
    conceito: [
      "No Wireshark, filtre por tcp.flags.syn == 1 para achar os SYN e SYN/ACK, ou use “Follow TCP Stream” para ver a conversa inteira de uma conexão.",
      "Na coluna Info aparecem [SYN], [SYN, ACK] e [ACK], com os números Seq e Ack. Repare que o Ack de cada lado é o Seq do outro + 1.",
    ],
    motivos: [
      "FIN e RST aparecem no encerramento ou em abortos.",
      "O DNS pode aparecer antes (para descobrir o IP), mas não é o handshake.",
      "UDP não tem flags SYN/ACK nem handshake.",
      "Correta: são os três primeiros segmentos da conexão.",
    ],
    dica: "Filtro rápido: tcp.flags.syn == 1",
  },
  17: {
    porQue: "O IP acha o host e a porta acha o processo. Juntando origem e destino, cada conexão fica identificada de forma única.",
    conceito: [
      "Um servidor web na porta 443 atende milhares de clientes ao mesmo tempo. O que separa cada conexão é a combinação IP:porta de cada cliente.",
      "Entregar cada segmento ao socket certo usando essa 4-tupla chama-se demultiplexação. No UDP, basta IP e porta de destino.",
    ],
    motivos: [
      "Correta: a 4-tupla identifica a conexão entre dois processos.",
      "Só o destino não distingue conexões diferentes ao mesmo servidor.",
      "MAC é da camada de enlace e não faz parte dessa tupla.",
      "DNS traduz nomes; não tem relação com a tupla.",
    ],
    dica: "A 4-tupla é o “CPF” da conexão.",
  },
  18: {
    porQue: "No TCP o destino já ficou definido na conexão; no UDP não há conexão, então cada envio diz para onde vai e cada recebimento informa de onde veio.",
    conceito: [
      "TCP: depois do connect() (cliente) ou accept() (servidor), use sock.send(dados) e sock.recv(1024).",
      "UDP: sock.sendto(dados, (ip, porta)) e dados, endereco = sock.recvfrom(1024). O endereço vem junto para que seja possível responder.",
    ],
    motivos: [
      "Está invertido.",
      "Correta: conexão no TCP, endereço a cada datagrama no UDP.",
      "Não são iguais: muda a necessidade de informar o endereço.",
      "Nenhuma delas criptografa; isso é papel do TLS.",
    ],
    dica: "“to” e “from” = endereço junto. Sem eles, a conexão já sabe.",
  },
  19: {
    porQue: "No Go-Back-N o receptor descarta tudo que chega fora de ordem. No timeout o emissor volta ao quadro perdido e reenvia ele e todos os seguintes.",
    conceito: GBN,
    motivos: [
      "Guardar fora de ordem e reenviar só o perdido é o Selective Repeat.",
      "O protocolo se recupera sozinho; a transmissão não é cancelada.",
      "Correta: volta N e reenvia a partir do perdido, desperdiçando banda.",
      "Não há reconstrução; o quadro precisa ser reenviado.",
    ],
    dica: "Go-Back-N: errou um, volta N.",
  },
  20: {
    porQue: "Guardando em buffer o que chegou certo e confirmando cada quadro, só o que realmente se perdeu precisa voltar.",
    conceito: SR,
    motivos: [
      "Reenviar a janela inteira é o comportamento do Go-Back-N.",
      "Descartar fora de ordem é o Go-Back-N.",
      "O SR é confiável; a aplicação não precisa corrigir nada.",
      "Correta: buffer no receptor, ACK individual e retransmissão seletiva.",
    ],
    dica: "Selective Repeat: reenvia só o que faltou.",
  },

  // ---------- marque todas / monte a sequência ----------

  21: {
    porQue: "ISP é quem vende o acesso ou o trânsito de Internet. Programas e aplicativos só usam essa conexão.",
    conceito: ISP,
    motivos: [
      "Correta: provedor de acesso residencial e móvel.",
      "Correta: provedor de acesso por cabo e fibra.",
      "Correta: operadora de backbone que vende trânsito.",
      "É um navegador: usa a Internet, não fornece.",
      "É um aplicativo de mensagens que roda sobre a Internet.",
      "É um sistema operacional.",
    ],
    dica: "Pergunte: “ele me dá o cabo ou o sinal?” Se sim, é ISP.",
  },
  22: {
    porQue: "Tudo o que o ISP faz gira em torno de conectar, endereçar e encaminhar pacotes — não de criar conteúdo.",
    conceito: ISP,
    motivos: [
      "Correta: é o serviço principal.",
      "Correta: os roteadores do ISP levam os pacotes adiante.",
      "Correta: o cliente recebe um IP (DHCP/PPPoE).",
      "Correta: peering e trânsito ligam as redes entre si.",
      "Isso é trabalho de desenvolvedores ou agências.",
      "O HTML é padronizado pelo W3C/WHATWG.",
    ],
    dica: "Conecta, endereça, roteia, interliga.",
  },
  23: {
    porQue: "HTTP, SMTP, IMAP e FTP são protocolos da camada de aplicação. ARP e ICMP ficam em camadas de baixo.",
    conceito: APLICACAO,
    motivos: [
      "Correta: o navegador fala HTTP/HTTPS.",
      "Correta: o envio usa SMTP.",
      "Correta: a leitura usa IMAP (ou POP3).",
      "Correta: FTP transfere arquivos.",
      "ARP traduz IP em MAC na rede local (camada de enlace).",
      "ICMP é da camada de rede (ex.: ping); não envia e-mails.",
    ],
    dica: "Se o usuário “vê” o serviço, provavelmente é camada de aplicação.",
  },
  24: {
    porQue: "GET serve para ler sem alterar nada. Quando há dado sensível, criação de algo ou arquivo para enviar, o certo é POST.",
    conceito: GET_POST,
    motivos: [
      "Correta: ex.: /busca?q=mouse&preco=100.",
      "Correta: só lê a página.",
      "Correta: só busca o arquivo.",
      "Senha na URL ficaria exposta no histórico e nos logs: use POST.",
      "Cria um recurso no servidor: POST.",
      "O arquivo vai no corpo da requisição: POST.",
    ],
    dica: "Se pode virar favorito, é GET.",
  },
  25: {
    porQue: "Os erros ficam nas faixas 4xx (problema no pedido do cliente) e 5xx (falha no servidor).",
    conceito: STATUS,
    motivos: [
      "200 OK: sucesso.",
      "201 Created: sucesso ao criar um recurso.",
      "301 é redirecionamento permanente, não erro.",
      "Correta: 403 Forbidden, sem permissão.",
      "Correta: 404 Not Found, recurso inexistente.",
      "Correta: 500 Internal Server Error, falha no servidor.",
    ],
    dica: "4 foi você, 5 fui eu.",
  },
  26: {
    porQue: "A hierarquia do DNS vai do geral para o específico: o servidor local pergunta à raiz, depois ao TLD .br e por fim ao autoritativo do domínio.",
    conceito: DNS,
    motivos: [
      "Recebe a pergunta do seu computador e começa a busca.",
      "A raiz não sabe o IP, mas indica os servidores do .br.",
      "O TLD .br indica o servidor autoritativo de exemplo.com.br.",
      "O autoritativo responde o IP de www.exemplo.com.br.",
      "SMTP é de e-mail; não participa da resolução de nomes.",
    ],
    dica: "Leia o nome de trás pra frente: raiz → br → exemplo.com.br.",
  },
  27: {
    porQue: "Só os registros A e AAAA guardam um endereço IP. Os outros guardam nomes (de apelido, de servidor de e-mail ou de servidor de nomes).",
    conceito: REGISTROS,
    motivos: [
      "Correta: nome → IPv4.",
      "Correta: nome → IPv6.",
      "Aponta para outro nome, não para um IP.",
      "Indica o nome do servidor de e-mail do domínio.",
      "Indica os servidores de nomes do domínio.",
    ],
    dica: "A e AAAA = Address.",
  },
  28: {
    porQue: "SMTP leva a mensagem do remetente até a caixa do destinatário, usando o MX para descobrir o destino. A leitura é feita por outro protocolo (IMAP/POP3).",
    conceito: SMTP,
    motivos: [
      "O usuário escreve e envia ao seu servidor (SMTP, porta 587).",
      "O servidor do remetente recebe e enfileira a mensagem.",
      "Ele consulta no DNS o MX do domínio de destino.",
      "Entrega ao servidor do destinatário (SMTP, porta 25).",
      "O destinatário lê com IMAP ou POP3.",
      "O servidor raiz pode participar da consulta DNS, mas não é uma etapa do caminho do e-mail.",
    ],
    dica: "SMTP empurra, IMAP/POP3 puxa.",
  },
  29: {
    porQue: "Abrir uma conexão TCP é combinar os números de sequência: o cliente propõe (SYN), o servidor aceita e propõe o seu (SYN/ACK) e o cliente confirma (ACK).",
    conceito: HANDSHAKE,
    motivos: [
      "O cliente pede a conexão com seu número inicial.",
      "O servidor aceita e envia o seu número.",
      "O cliente confirma; a conexão está aberta.",
      "FIN serve para encerrar a conexão.",
      "RST aborta a conexão; não faz parte da abertura.",
    ],
    dica: "Oi? (SYN) — Oi, tudo bem? (SYN/ACK) — Tudo! (ACK)",
  },
  30: {
    porQue: "Cada lado fecha o seu sentido da conexão com FIN, e o outro confirma com ACK: FIN → ACK → FIN → ACK.",
    conceito: ENCERRAMENTO,
    motivos: [
      "O cliente avisa que terminou de enviar.",
      "O servidor confirma; ainda pode mandar o que falta.",
      "O servidor também termina.",
      "O cliente confirma e espera em TIME_WAIT.",
      "SYN é de abertura, não de encerramento.",
    ],
    dica: "Tchau (FIN) — ok (ACK) — tchau também (FIN) — ok (ACK).",
  },
  31: {
    porQue: "O TCP é confiável e ordenado, com controle de fluxo e de congestionamento. Não ter conexão e ter cabeçalho de 8 bytes são características do UDP.",
    conceito: TCP_UDP,
    motivos: [
      "Correta: usa ACK e retransmite o que se perde.",
      "Correta: números de sequência reordenam os dados.",
      "Correta: respeita a janela do receptor (rwnd).",
      "Correta: ajusta a janela de congestionamento (cwnd).",
      "Isso é do UDP; o TCP faz handshake antes.",
      "Isso é do UDP; o cabeçalho TCP tem no mínimo 20 bytes.",
    ],
    dica: "TCP = carta registrada.",
  },
  32: {
    porQue: "UDP serve quando chegar rápido importa mais do que chegar tudo: voz, jogos, DNS e transmissões ao vivo.",
    conceito: TCP_UDP,
    motivos: [
      "Correta: atraso atrapalha mais que perder um pedacinho de áudio.",
      "Correta: a posição mais recente importa mais que a antiga.",
      "Correta: pergunta e resposta curtas, sem handshake.",
      "Correta: ao vivo, reenviar chegaria tarde demais.",
      "Precisa de todos os bytes certos: usa TCP.",
      "SMTP roda sobre TCP.",
    ],
    dica: "UDP = panfleto: rápido, sem confirmação.",
  },
  33: {
    porQue: "O servidor cria o socket, associa a uma porta, passa a escutar e aceita clientes. connect() é do cliente e sendto() é do UDP.",
    conceito: SOCKET,
    motivos: [
      "Correta: cria o socket.",
      "Correta: associa IP e porta.",
      "Correta: começa a escutar conexões.",
      "Correta: aceita um cliente e cria o socket da conexão.",
      "Usado pelo cliente para se conectar.",
      "Envio do UDP, sem conexão.",
    ],
    dica: "Servidor: BLA — Bind, Listen, Accept.",
  },
  34: {
    porQue: "O servidor primeiro se prepara (socket, bind, listen), depois atende o cliente (accept), troca dados e por fim fecha.",
    conceito: SOCKET,
    motivos: [
      "Cria o socket TCP (SOCK_STREAM).",
      "Associa o socket a um IP e porta.",
      "Passa a escutar pedidos de conexão.",
      "Aceita um cliente e recebe o socket da conexão.",
      "Troca dados com o cliente.",
      "Fecha a conexão.",
      "connect() é usado pelo cliente, não pelo servidor.",
    ],
    dica: "Prepara → espera → atende → conversa → desliga.",
  },
  35: {
    porQue: "No Go-Back-N o receptor descarta os quadros fora de ordem, então no timeout o emissor reenvia o perdido e todos os seguintes, gastando banda.",
    conceito: GBN,
    motivos: [
      "Correta: o timer do quadro mais antigo dispara a retransmissão.",
      "Correta: volta N quadros.",
      "Correta: o receptor os descartou, então vão de novo.",
      "Correta: banda gasta com repetições derruba o desempenho.",
      "Guardar fora de ordem é do Selective Repeat.",
      "Reenviar só o perdido é do Selective Repeat.",
    ],
    dica: "Go-Back-N: errou um, volta N.",
  },
  36: {
    porQue: "O Selective Repeat guarda o que chega fora de ordem e confirma cada quadro, então só o que se perdeu é reenviado.",
    conceito: SR,
    motivos: [
      "Correta: o buffer guarda quadros fora de ordem.",
      "Correta: ACK por quadro, não cumulativo.",
      "Correta: retransmissão seletiva.",
      "Correta: com muitas perdas ou alta latência, reenviar menos faz diferença.",
      "Descartar fora de ordem é do Go-Back-N.",
      "Reenviar a janela inteira é do Go-Back-N.",
    ],
    dica: "Selective Repeat: reenvia só o que faltou.",
  },
};
