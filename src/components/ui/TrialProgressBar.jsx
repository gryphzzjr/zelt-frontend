import React, { useState, useEffect } from 'react';
import { HiOutlineCalendar } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';

const TRIAL_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

export default function TrialProgressBar({ className = '' }) {
  const { user } = useAuth();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(t);
  }, []);

  if (!user?.createdAt) return null;

  const start = new Date(user.createdAt).getTime();
  const end = start + TRIAL_DAYS * DAY_MS;
  const elapsed = Math.max(0, Math.min(now - start, end - start));
  const expired = now >= end;
  const day = Math.min(TRIAL_DAYS, Math.floor(elapsed / DAY_MS) + 1);
  const endDate = new Date(end).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  const doneCls = expired
    ? 'bg-red-500 text-white'
    : 'bg-[var(--zelt-primary)]/10 text-[var(--zelt-primary)]';
  const currentCls = expired
    ? 'bg-red-500 text-white'
    : 'bg-[var(--zelt-primary)] text-white';
  const futureCls = 'bg-gray-100 text-gray-400 dark:bg-white/10 dark:text-gray-500';

  return (
    <div className={className}>
      <div
        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${
          expired
            ? 'border-red-200 bg-white dark:border-red-500/20 dark:bg-[#141414]'
            : 'border-gray-200 bg-white dark:border-white/10 dark:bg-[#141414]'
        }`}
        title={expired ? 'Seu teste gratuito terminou' : `Teste gratuito termina em ${endDate}`}
      >
        <HiOutlineCalendar
          size={14}
          className={`shrink-0 ${expired ? 'text-red-500' : 'text-[var(--zelt-primary)]'}`}
        />

        <span
          className={`text-[12px] font-semibold leading-none ${
            expired ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-100'
          }`}
        >
          {expired ? 'Teste encerrado' : `Dia ${day} de ${TRIAL_DAYS}`}
        </span>

        <div className="flex items-center gap-1">
          {Array.from({ length: TRIAL_DAYS }, (_, i) => {
            const n = i + 1;
            const done = n < day || expired;
            const current = n === day && !expired;
            return (
              <span
                key={i}
                className={`flex h-[18px] w-[18px] items-center justify-center rounded-[4px] text-[10px] font-bold leading-none ${
                  done ? doneCls : current ? currentCls : futureCls
                }`}
              >
                {n}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
