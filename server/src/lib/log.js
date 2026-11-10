const write = (level, event, data = {}) => console[level](JSON.stringify({ at: new Date().toISOString(), level, event, ...data }));
export const log = { info: (e,d) => write('log',e,d), warn: (e,d) => write('warn',e,d), error: (e,d) => write('error',e,d) };

