# BeautyBook

Система онлайн-запису для невеликих салонів краси.

## Стек

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase
- Cloudflare (OpenNext)

## Локальний запуск

1. Скопіюйте `.env.example` → `.env.local` і заповніть змінні Supabase.
2. Встановіть залежності: `npm install`
3. Запустіть: `npm run dev`

## Деплой на Cloudflare

```bash
npm run deploy
```

Або підключіть репозиторій у Cloudflare Dashboard (Workers) з командою збірки `npx opennextjs-cloudflare build`.
