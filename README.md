🎬 CineSearchNJR

Projeto Integrador II - Unifacisa (2026.1) Competência: 222015 - PROJETO INTEGRADOR II - NOITE

Metodologia: Vibe Coding (Desenvolvimento assistido por IA)

📌 1. Definição do Problema

Atualmente, os entusiastas de cinema e séries enfrentam dois grandes obstáculos: a "Paralisia da Escolha", causada pela fragmentação de conteúdos em diversas plataformas de streaming, e o Baixo Engajamento Social, onde a experiência de assistir torna-se passiva e solitária. O CineSearchNJR surge para centralizar a busca de onde assistir e transformar a visualização em uma experiência activa e gratificante.

🎯 2. Proposta de Valor

O CineSearchNJR oferece um ecossistema completo que une a precisão de dados do TMDB, recomendações inteligentes via IA (Gemini) e um sistema de gamificação profundo (XP, Níveis e Missões). O diferencial está em recompensar o utilizador por cada interacção, criando uma rede social vibrante para cinéfilos.

👥 3. Personas (Desenvolvidas com IA)

Marcos (O Platinador): Estudante de 22 anos que adora sistemas de ranking. O seu objectivo é completar todas as missões semanais para ser o Top 1 do ranking global.

Julia (A Pragmática): Trabalha em regime remoto e tem pouco tempo. Utiliza o CineSearch para decidir rapidamente o que assistir com base nas recomendações da IA e saber em qual streaming o filme está disponível.

Ricardo (O Crítico Social): Cinéfilo que gosta de debater. Procura a plataforma para seguir outros utilizadores, ler comentários e partilhar as suas próprias listas.

🛠️ 4. Lista de Funcionalidades (MVP)

Core & Interface

Busca em Tempo Real: Filtros inteligentes para filmes, séries e equipas técnicas via TMDB.

Onde Assistir (Watch Providers): Integração com dados de disponibilidade de streaming no Brasil.

Interface Futurista: Design responsivo construído com Tailwind CSS e Shadcn UI.

Gamificação e Social

Motor de XP: Ganho de experiência ao favoritar (+10 XP) e marcar como assistido (+50 XP).

Sistema de Níveis: Progressão automática com barra de progresso visual.

Ranking Público: Leaderboard dos Top 50 utilizadores por nível e medalhas.

Rede Social: Sistema de "Seguir/Seguidores" e secção de comentários em todos os títulos.

Missões: Desafios diários, de progresso e de exploração que bonificam o utilizador com XP.

Inteligência Artificial

Recomendações Personalizadas: Algoritmo via Supabase Edge Functions que analisa os últimos 5 favoritos e sugere novos títulos usando o modelo Gemini.

🤖 5. Metodologia Vibe Coding

Este projeto foi desenvolvido utilizando o paradigma de Vibe Coding através da ferramenta Lovable.dev. O papel do desenvolvedor foi o de Arquitecto de Prompts, direcionando a IA para a construção de uma lógica complexa de persistência e gamificação.

Prompts Estratégicos Utilizados:

Fundação e Dados: "Crie um app usando a API do TMDB onde se pesquisa filmes e series... as informacoes precisam ser práticas: Sinopse, Nota, trailers, streaming onde ele esta, temporadas e status."

Evolução da Arquitetura (Supabase): "CineSearch Evolution: Implementa sistema de login/registo com Supabase Auth. Cria tabelas de profiles e user_interactions. Adiciona botões de Favoritar/Assistir no MediaCard com mutações do TanStack Query."

Refinamento de Gamificação e Social: "Precisa melhorar a gamificacao... implementar sistema de missoes, ranking publico, poder um usuario seguir o outro e sistema de comentarios. As recomendacoes devem ser baseadas no que foi assistido e favoritadas."

⚠️ 6. Status Atual e Limitações Técnicas

O CineSearchNJR encontra-se em estado de MVP funcional. É importante ressaltar que o projeto ainda possui funcionalidades em fase de refinamento.

O desenvolvimento foi impactado pelas limitações de quotas de prompts e processamento da ferramenta Lovable.dev. Devido a esses limites operacionais da plataforma de IA, algumas iterações complexas de interface e polimento de regras de negócio sociais estão agendadas para as próximas fases, à medida que a orquestração do código é otimizada manualmente. Contudo, o fluxo principal (Busca, Auth, XP e IA) está totalmente operacional.

📂 7. Organização do Repositório

/src/components: Componentes modulares e UI (Shadcn).

/src/lib: Lógica de integração com TMDB e motor de gamificação.

/src/hooks: Hooks personalizados para interacções e missões.

/src/pages: Estrutura de rotas (Index, Ranking, Profile, Missions).

/supabase: Migrações SQL e Edge Functions para recomendações de IA.

🚀 8. Stack Tecnológica

Frontend: React, TypeScript, Vite.

Estilização: Tailwind CSS, Shadcn UI, Sonner (Toasts).

Backend & DB: Supabase (Auth, PostgreSQL, RLS).

Gerenciamento de Estado: TanStack Query (React Query).

IA: Google Gemini (via Edge Functions).

Desenvolvido por: Nereu Jr.

Entrega referente à Fase 1 do Projeto Integrador II - Unifacisa.
