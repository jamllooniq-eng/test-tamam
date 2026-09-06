import type { Handler } from '@netlify/functions';

export const handler: Handler = async () => {
  const csv = `id,video[0].url
13122,https://vz-2cc2e72b-66d.b-cdn.net/1669098b-7d86-4a52-b373-e97fa22325c0/play_1080p.mp4
`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
    body: csv,
  };
};
