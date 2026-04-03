import './globals.css'

export const metadata = {
  title: 'Wordletr - Günlük Kelime Oyunu',
  description: 'Her gün yeni bir kelime tahmin et! Türkçe Wordle deneyimi.',
  keywords: 'wordle, türkçe, kelime oyunu, bulmaca, günlük oyun',
  authors: [{ name: 'Wordletr' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#0a0a0a',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var tema = localStorage.getItem('tema');
                  if (tema === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  )
}
