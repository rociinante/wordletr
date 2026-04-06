import './globals.css'

export const metadata = {
  title: 'Wordletr - Türkçe Kelime Oyunu',
  description: 'Her gün yeni bir kelime tahmin et! Türkçe Wordle deneyimi. 6 modda oyna, rozetler kazan, arkadaşlarına meydan oku!',
  keywords: 'wordle, türkçe, kelime oyunu, bulmaca, günlük oyun, kelime tahmin',
  authors: [{ name: 'Wordletr' }],
  manifest: '/manifest.json',
  themeColor: '#8b5cf6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Wordletr'
  },
  openGraph: {
    title: 'Wordletr - Türkçe Kelime Oyunu',
    description: 'Her gün yeni bir kelime tahmin et!',
    type: 'website',
    locale: 'tr_TR'
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Tema rengi
                  var renk = localStorage.getItem('tema_rengi');
                  var renkler = {
                    'okyanus': 'tema-okyanus',
                    'orman': 'tema-orman', 
                    'gunbatimi': 'tema-gunbatimi',
                    'gul': 'tema-gul',
                    'altin': 'tema-altin'
                  };
                  if (renk && renkler[renk]) {
                    document.documentElement.classList.add(renkler[renk]);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen min-h-[100dvh] flex flex-col">
        {children}
      </body>
    </html>
  )
}
