# Self Review – Sami Triage App

## O que foi entregue
- **Arquitetura em camadas** no backend (`api/`, `services/`, `providers/`, `middleware/`).
- **Frontend React/Vite** com formulário de triagem e chat interativo.
- **Providers de IA pluggables**: `mock` (default, sem dependências externas) e `flask` (integra com Gemini).
- **Fallback automático** caso o provider real falhe ou não tenha credenciais.
- **Observabilidade** com logs estruturados e endpoint `GET /metrics` expondo contagem e duração média das triagens.
- **Segurança básica**: whitelist de CORS via `.env` e rate limiting configurável.
- **Testes mínimos**: 3 unitários (`validateInitialInput`, `runTriage`, `mockProvider`) e 1 integração (`POST /triage`).
- **Documentação**: README detalhado, SYSTEM_DESIGN, diagrama (Mermaid) e esta autoavaliação.

## Pontos fortes
- Flexibilidade dos providers de IA e fallback garantem experiência funcional mesmo sem chave.
- Middleware de logs/métricas facilita observabilidade e preparação para produção.
- Estrutura clara do frontend, com estados bem definidos para triagem e chat.
- Cobertura de testes mínima atende ao requisito (foco em serviços críticos e rota principal).

## Limitações & Próximos Passos
- **Persistência**: triagens não são salvas; implementar SQLite/Prisma seria evolução natural.
- **Chat**: não há streaming nem histórico persistido; o estado é mantido apenas em memória no cliente.
- **Observabilidade**: métricas em memória apenas; integrar com Prometheus/Grafana e tracing seria upgrade.
- **Deploy**: ausência de URL pública ou pipeline CI/CD configurado.
- **Internacionalização**: mensagens fixas em inglês/português; suportar múltiplos idiomas seria ganho.

## Lições aprendidas
- Preparar Jest para ESM requer atenção às flags (`NODE_OPTIONS=--experimental-vm-modules`) e import dinâmico com `jest.unstable_mockModule`.
- O fallback configurável aumenta a resiliência e simplifica a avaliação do desafio, garantindo execução sem chaves reais.
- Documentar detalhadamente (`README`, `SYSTEM_DESIGN`) facilita a compreensão rápida por avaliadores e colaboradores.
