/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 技術ブログ向けカラーパレット（目に優しい）
        neutral: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#0a0a0a',
        },
        // アクセントカラー（技術的で落ち着いた青）
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // コードハイライト用
        code: {
          bg: '#1e1e1e',
          text: '#d4d4d4',
          comment: '#6a9955',
          keyword: '#569cd6',
          string: '#ce9178',
        }
      },
      fontFamily: {
        // 本文用フォント（可読性重視）
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        // コード用フォント
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.neutral.700'),
            '--tw-prose-headings': theme('colors.neutral.900'),
            '--tw-prose-lead': theme('colors.neutral.600'),
            '--tw-prose-links': theme('colors.primary.600'),
            '--tw-prose-bold': theme('colors.neutral.900'),
            '--tw-prose-counters': theme('colors.neutral.500'),
            '--tw-prose-bullets': theme('colors.neutral.300'),
            '--tw-prose-hr': theme('colors.neutral.200'),
            '--tw-prose-quotes': theme('colors.neutral.900'),
            '--tw-prose-quote-borders': theme('colors.neutral.200'),
            '--tw-prose-captions': theme('colors.neutral.500'),
            '--tw-prose-code': theme('colors.neutral.900'),
            '--tw-prose-pre-code': theme('colors.code.text'),
            '--tw-prose-pre-bg': theme('colors.code.bg'),
            '--tw-prose-th-borders': theme('colors.neutral.300'),
            '--tw-prose-td-borders': theme('colors.neutral.200'),
            fontSize: '16px',
            lineHeight: '1.75',
            maxWidth: 'none',
            p: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
            },
            h1: {
              fontSize: '2.25em',
              fontWeight: '700',
              lineHeight: '1.2',
              marginTop: '0',
              marginBottom: '0.8888889em',
            },
            h2: {
              fontSize: '1.875em',
              fontWeight: '600',
              lineHeight: '1.2',
              marginTop: '1.6em',
              marginBottom: '0.8em',
            },
            h3: {
              fontSize: '1.5em',
              fontWeight: '600',
              lineHeight: '1.3',
              marginTop: '1.6em',
              marginBottom: '0.6em',
            },
            code: {
              backgroundColor: theme('colors.neutral.100'),
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
              fontWeight: '400',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: theme('colors.code.bg'),
              borderRadius: '0.5rem',
              padding: '1rem',
              fontSize: '0.875em',
              lineHeight: '1.7',
              overflow: 'auto',
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
              borderRadius: '0',
              fontSize: 'inherit',
            },
          },
        },
        dark: {
          css: {
            '--tw-prose-body': theme('colors.neutral.300'),
            '--tw-prose-headings': theme('colors.neutral.100'),
            '--tw-prose-lead': theme('colors.neutral.400'),
            '--tw-prose-links': theme('colors.primary.400'),
            '--tw-prose-bold': theme('colors.neutral.100'),
            '--tw-prose-counters': theme('colors.neutral.400'),
            '--tw-prose-bullets': theme('colors.neutral.600'),
            '--tw-prose-hr': theme('colors.neutral.700'),
            '--tw-prose-quotes': theme('colors.neutral.100'),
            '--tw-prose-quote-borders': theme('colors.neutral.700'),
            '--tw-prose-captions': theme('colors.neutral.400'),
            '--tw-prose-code': theme('colors.neutral.100'),
            '--tw-prose-pre-code': theme('colors.code.text'),
            '--tw-prose-pre-bg': theme('colors.code.bg'),
            '--tw-prose-th-borders': theme('colors.neutral.600'),
            '--tw-prose-td-borders': theme('colors.neutral.700'),
            code: {
              backgroundColor: theme('colors.neutral.800'),
            },
          },
        },
        lg: {
          css: {
            fontSize: '18px',
            lineHeight: '1.8',
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}