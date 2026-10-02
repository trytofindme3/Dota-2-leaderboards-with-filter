// Прокси: браузер просит /api/leaderboard?division=europe,
// функция сама ходит на dota2.com и возвращает ответ (так обходится CORS).

const DIVISIONS = ['europe', 'americas', 'se_asia', 'china'];

export default async (req) => {
  // Берём регион из адреса запроса, по умолчанию europe
  const division = new URL(req.url).searchParams.get('division') || 'europe';

  // Пропускаем только известные регионы, чтобы прокси нельзя было использовать не по назначению
  if (!DIVISIONS.includes(division)) {
    return new Response(JSON.stringify({ error: 'unknown division' }), { status: 400 });
  }

  const url = `https://www.dota2.com/webapi/ILeaderboard/GetDivisionLeaderboard/v0001?division=${division}&leaderboard=0`;

  try {
    const res = await fetch(url);
    return new Response(await res.text(), {
      status: res.status,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        // Кэш на 10 минут: не дёргаем Valve на каждый визит
        'cache-control': 'public, max-age=600',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 502 });
  }
};

// Адрес, по которому функция доступна на сайте
export const config = { path: '/api/leaderboard' };
