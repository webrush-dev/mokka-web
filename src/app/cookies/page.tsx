import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Политика за бисквитки - Mokka Coffee',
  description: 'Политика за бисквитки на Mokka Coffee - как използваме бисквитки и подобни технологии.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <img 
                src="/mokka-logo-l.png" 
                alt="Mokka Coffee Logo" 
                className="h-16 w-auto"
              />
            </Link>
            
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Назад към сайта
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-mokka-gy mb-8">Политика за бисквитки</h1>
          
          <div className="space-y-8 text-mokka-gy/80 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-mokka-gy mb-4">1. Какво са бисквитките</h2>
              <p>
                Бисквитките са малки текстови файлове, които се съхраняват на вашето устройство 
                когато посещавате нашия уебсайт. Те ни помагат да направим сайта по-функционален 
                и да подобрим вашето потребителско изживяване.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mokka-gy mb-4">2. Видове бисквитки, които използваме</h2>
              
              <div className="space-y-6">
                <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded">
                  <h3 className="font-medium text-green-800 mb-2">Необходими бисквитки</h3>
                  <p className="text-green-700 text-sm">
                    Тези бисквитки са от съществено значение за функционирането на сайта. 
                    Без тях някои функции няма да работят правилно.
                  </p>
                  <p className="text-green-600 text-xs mt-2">
                    Пример: бисквитки за запазване на вашите настройки, сесии за вход
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <h3 className="font-medium text-yellow-800 mb-2">Функционални бисквитки</h3>
                  <p className="text-yellow-700 text-sm">
                    Тези бисквитки ни помагат да запомним вашите предпочитания и да персонализираме 
                    вашето изживяване на сайта.
                  </p>
                  <p className="text-yellow-600 text-xs mt-2">
                    Пример: езикови настройки, теми, персонализирано съдържание
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <h3 className="font-medium text-blue-800 mb-2">Аналитични бисквитки</h3>
                  <p className="text-blue-700 text-sm">
                    Тези бисквитки ни помагат да разберем как използвате нашия сайт, 
                    за да можем да го подобрим.
                  </p>
                  <p className="text-blue-600 text-xs mt-2">
                    Пример: Google Analytics, статистики за посещения
                  </p>
                </div>

                <div className="p-4 bg-purple-50 border-l-4 border-purple-400 rounded">
                  <h3 className="font-medium text-purple-800 mb-2">Маркетингови бисквитки</h3>
                  <p className="text-purple-700 text-sm">
                    Тези бисквитки се използват за показване на релевантни реклами и 
                    проследяване на ефективността на маркетинговите кампании.
                  </p>
                  <p className="text-purple-600 text-xs mt-2">
                    Пример: Facebook Pixel, Google Ads, рекламни мрежи
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mokka-gy mb-4">3. Вашият избор</h2>
              <p>
                Можете да контролирате и управлявате бисквитките по няколко начина:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Чрез нашия банер за съгласие с бисквитки</li>
                <li>Чрез настройките на вашия браузър</li>
                <li>Чрез специализирани инструменти за управление на бисквитки</li>
              </ul>
              
              <div className="mt-6 p-4 bg-mokka-cr/20 rounded-lg">
                <h4 className="font-medium text-mokka-gy mb-2">Настройки на браузъра:</h4>
                <p className="text-sm text-mokka-gy/70">
                  Повечето браузъри ви позволяват да блокирате или изтривате бисквитки. 
                  Моля, имайте предвид, че блокирането на всички бисквитки може да повлияе 
                  на функционалността на сайта.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mokka-gy mb-4">4. Бисквитки от трети страни</h2>
              <p>
                Нашият сайт може да съдържа бисквитки от трети страни, като:
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Google Analytics - за анализ на трафика</li>
                <li>Facebook Pixel - за маркетингови цели</li>
                <li>Социални мрежи - за споделяне на съдържание</li>
              </ul>
              <p className="mt-4 text-sm text-mokka-gy/70">
                Тези услуги имат свои собствени политики за бисквитки, които препоръчваме да прочетете.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mokka-gy mb-4">5. Промяна на настройките</h2>
              <p>
                Можете да промените вашите предпочитания за бисквитки по всяко време. 
                Ще ви покажем банер за съгласие отново, ако промените настройките си.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mokka-gy mb-4">6. Контакти</h2>
              <p>
                Ако имате въпроси относно нашата политика за бисквитки, моля свържете се с нас:
              </p>
              <div className="mt-4 p-4 bg-mokka-cr/20 rounded-lg">
                <p><strong>Имейл:</strong> hello@mokka.cafe</p>
                <p><strong>Адрес:</strong> бул. Освобождение 31, Пловдив</p>
                <p><strong>Телефон:</strong> +359 876 930 059</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mokka-gy mb-4">7. Промени в политиката</h2>
              <p>
                Ние можем да обновяваме тази политика за бисквитки от време на време. 
                Всяка промяна ще бъде публикувана на тази страница с обновена дата.
              </p>
              <p className="mt-2 text-sm text-mokka-gy/60">
                Последна актуализация: {new Date().toLocaleDateString('bg-BG')}
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 bg-mokka-gy text-white mt-16">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-mokka-cr/60">© 2025 Mokka Coffee. Всички права запазени.</p>
        </div>
      </footer>
    </div>
  );
}
