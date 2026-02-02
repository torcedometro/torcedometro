require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// CONFIG
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;
const API_BASE_URL = 'https://v3.football.api-sports.io';

if (!API_FOOTBALL_KEY) {
  console.error('❌ ERRO: Adicione "API_FOOTBALL_KEY" no seu arquivo .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-rapidapi-key': API_FOOTBALL_KEY,
    'x-rapidapi-host': 'v3.football.api-sports.io'
  }
});

// Adicionando Ligas Relevantes para Remo e Paysandu (2024)
// 71: Serie A (Bragantino, etc)
// 72: Serie B (Paysandu em 2024)
// 75: Serie C (Remo em 2024)
// 475: Copa do Brasil
// 479: Campeonato Paraense
const LEAGUES = [71, 72, 75, 475, 479];
const SEASON = 2024;

// CLUBES ALVO (Filtro)
const TATGET_CLUBS = ['Remo', 'Paysandu'];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log(`🚀 Iniciando Sincronização Focada: REMO e PAYSANDU (${SEASON})...`);

  // 0. Limpeza Prévia (Opcional, mas ativa agora para testes limpos)
  await cleanOldData(SEASON);

  for (const leagueId of LEAGUES) {
    console.log(`\n🏆 Sincronizando Liga ID: ${leagueId}...`);
    await syncTeams(leagueId, SEASON);
    await syncFixtures(leagueId, SEASON);
    await delay(2000);
  }
  console.log('\n✅ Sincronização Concluída!');
}

async function cleanOldData(yearToRemove) {
  console.log(`🧹 Limpando dados antigos de ${yearToRemove}...`);
  const { error } = await supabase
    .from('games')
    .delete()
    .eq('season', yearToRemove);

  if (error) console.error('Erro ao limpar dados antigos:', error.message);
  else console.log('   Dados antigos removidos.');
}

async function syncTeams(league, season) {
  console.log(`   👉 Buscando times...`);
  try {
    const response = await apiClient.get('/teams', {
      params: { league, season }
    });

    const teamsData = response.data.response;
    // FILTRO DE TIMES
    const filteredTeams = teamsData.filter(t =>
      TATGET_CLUBS.some(target => t.team.name.includes(target))
    );

    console.log(`      Encontrados ${filteredTeams.length} times (Filtro: Remo/Paysandu).`);

    for (const item of filteredTeams) {
      const team = item.team;
      const venue = item.venue;

      // LÓGICA DE MATCH INTELIGENTE:
      // 1. Tenta achar por API_ID (já sincronizado antes)
      let { data: existingClub, error: findError } = await supabase
        .from('clubs')
        .select('id, api_id')
        .eq('api_id', team.id)
        .single();

      // 2. Se não achou por ID, tenta achar por NOME (match case insensitive)
      if (!existingClub && (findError || !findError)) {
        const { data: nameMatch } = await supabase
          .from('clubs')
          .select('id, api_id')
          .ilike('name', `%${team.name}%`) // ILIKE com wildcard para garantir
          .is('api_id', null)
          .maybeSingle();

        if (nameMatch) {
          existingClub = nameMatch;
          console.log(`      🔄 Vinculando time existente: ${team.name} -> ID ${team.id}`);
        }
      }

      const clubData = {
        api_id: team.id,
        name: team.name,
        short_name: team.code || team.name.substring(0, 3).toUpperCase(),
        logo_url: team.logo,
        country: team.country,
      };

      let clubError;

      if (existingClub) {
        // UPDATE
        const { error } = await supabase
          .from('clubs')
          .update(clubData)
          .eq('id', existingClub.id);
        clubError = error;
      } else {
        // INSERT
        const { error } = await supabase
          .from('clubs')
          .upsert(clubData, { onConflict: 'api_id' });
        clubError = error;
      }

      if (clubError) {
        const msg = clubError.message || JSON.stringify(clubError);
        if (!msg.includes('duplicate key value violates unique constraint')) {
          console.error(`❌ Erro ao salvar time ${team.name}:`, msg);
        }
      }

      // Upsert Stadium
      if (venue && venue.id) {
        const { error: stadiumError } = await supabase
          .from('stadiums')
          .upsert({
            api_id: venue.id,
            name: venue.name,
            city: venue.city,
            capacity: venue.capacity,
          }, { onConflict: 'api_id' });
      }
    }
  } catch (error) {
    console.error('❌ Erro na API (Teams):', error.message || error);
  }
}

async function syncFixtures(league, season) {
  console.log(`   👉 Buscando jogos...`);
  try {
    const response = await apiClient.get('/fixtures', {
      params: { league, season }
    });

    const fixtures = response.data.response;

    // FILTRO DE JOGOS (Home OU Away deve ser Remo ou Paysandu)
    const filteredFixtures = fixtures.filter(f =>
      TATGET_CLUBS.some(target =>
        f.teams.home.name.includes(target) || f.teams.away.name.includes(target)
      )
    );

    console.log(`      Processando ${filteredFixtures.length} jogos (Filtro: Remo/Paysandu)...`);

    let count = 0;
    for (const item of filteredFixtures) {
      const f = item.fixture;
      const l = item.league;
      const home = item.teams.home;
      const away = item.teams.away;

      let status = 'scheduled';
      if (['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(f.status.short)) status = 'active';
      if (['FT', 'AET', 'PEN'].includes(f.status.short)) status = 'finished';

      // Helper function to ensure club exists (saves opponent on the fly)
      const ensureClub = async (teamInfo) => {
        let { data: club } = await supabase.from('clubs').select('id').eq('api_id', teamInfo.id).maybeSingle();
        if (!club) {
          // Tenta achar por nome antes
          const { data: nameMatch } = await supabase.from('clubs').select('id').ilike('name', teamInfo.name).maybeSingle();
          if (nameMatch) {
            // Atualiza com api_id e retorna
            await supabase.from('clubs').update({ api_id: teamInfo.id }).eq('id', nameMatch.id);
            return nameMatch;
          }

          // Cria novo (Oponente genérico)
          const { data: newClub, error } = await supabase.from('clubs').insert({
            api_id: teamInfo.id,
            name: teamInfo.name,
            short_name: teamInfo.code || teamInfo.name.substring(0, 3).toUpperCase(),
            logo_url: teamInfo.logo,
            country: 'Brazil'
          }).select().single();
          return newClub;
        }
        return club;
      };

      const homeClub = await ensureClub(home);
      const awayClub = await ensureClub(away);

      // Buscar Estádio
      let stadiumId = null;
      if (f.venue && f.venue.id) {
        await supabase.from('stadiums').upsert({
          api_id: f.venue.id,
          name: f.venue.name,
          city: f.venue.city
        }, { onConflict: 'api_id' });

        const { data: stadium } = await supabase.from('stadiums').select('id').eq('api_id', f.venue.id).single();
        if (stadium) stadiumId = stadium.id;
      }

      if (!homeClub || !awayClub) {
        console.log(`Skipping game ${home.name} vs ${away.name} (Club creation failed)`);
        continue;
      }

      const { error: gameError } = await supabase
        .from('games')
        .upsert({
          api_id: f.id,
          league_id: l.id,
          season: l.season,
          round: l.round,
          start_time: f.date,
          end_time: new Date(new Date(f.date).getTime() + 2 * 60 * 60 * 1000).toISOString(),
          home_club_id: homeClub.id,
          away_club_id: awayClub.id,
          stadium_id: stadiumId,
          home_team: home.name,
          away_team: away.name,
          status: status,
          score_home: item.goals.home,
          score_away: item.goals.away
        }, { onConflict: 'api_id' });

      if (gameError) console.error(`❌ Erro ao salvar jogo ${f.id}:`, gameError.message);
      else count++;
    }
    console.log(`      ✅ ${count} jogos sincronizados.`);

  } catch (error) {
    console.error('❌ Erro na API (Fixtures):', error.message || error);
  }
}

main().catch(console.error);
