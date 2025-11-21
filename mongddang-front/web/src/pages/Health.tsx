import { useEffect } from 'react';
import { logger } from '../lib/logger';

export default function Health() {
  useEffect(() => {
    logger.info('health_check_viewed');
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-semibold">Health</h1>
      <pre className="mt-4 rounded bg-gray-100 p-4 text-sm">{JSON.stringify({ status: 'ok', ts: new Date().toISOString() }, null, 2)}</pre>
    </div>
  );
}


