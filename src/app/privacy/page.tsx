import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Политика за поверителност - Mokka Coffee',
  description: 'Политика за поверителност на Mokka Coffee - как събираме, използваме и защитаваме вашите лични данни.',
};

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-mokka-gy mb-8">Политика за поверителност</h1>
          
          <div className="space-y-8 text-mokka-gy/80 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-mokka-gy mb-4">1. Въведение</h2>
              <p>
                Mokka Coffee се ангажира да защитава поверителността на вашите лични данни. 
                Тази политика обяснява как събираме, използваме и защитаваме информацията, 
                която ни предоставяте при използването на нашия уебсайт и услуги.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mokka-gy mb-4">2. Каква информация събираме</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-mokka-gy mb-2">Лична информация:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Име и фамилия</li>
                    <li>Имейл адрес</li>
                    <li>Телефонен номер</li>
                    <li>Адрес за доставка (ако е приложимо)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-mokka-gy mb-2">Техническа информация:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>IP адрес</li>
                    <li>Тип браузър и устройство</li>
                    <li>Информация за посещенията на сайта</li>
                    <li>Бисквитки и подобни технологии</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mokka-gy mb-4">3. Как използваме вашата информация</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>За обработка на поръчки и резервации</li>
                <li>За комуникация относно услугите ни</li>
                <li>За подобряване на нашия уебсайт и услуги</li>
                <li>За маркетингови цели (само с вашето съгласие)</li>
                <li>За съответствие с правни изисквания</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mokka-gy mb-4">4. Споделяне на информация</h2>
              <p>
                Ние не продаваме, не отдаваме под наем и не споделяме вашата лична информация 
                с трети страни, освен в случаите, когато това е необходимо за предоставянето 
                на услугите ни или когато се изисква от закона.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mokka-gy mb-4">5. Вашите права</h2>
              <p>Съгласно GDPR имате право на:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Достъп до вашите лични данни</li>
                <li>Корекция на неточни данни</li>
                <li>Изтриване на данните ви</li>
                <li>Ограничаване на обработката</li>
                <li>Преносимост на данните</li>
                <li>Възражение срещу обработката</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mokka-gy mb-4">6. Сигурност</h2>
              <p>
                Ние използваме подходящи технически и организационни мерки за защита на вашите 
                лични данни срещу неоторизиран достъп, промяна, разкриване или унищожаване.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mokka-gy mb-4">7. Контакти</h2>
              <p>
                Ако имате въпроси относно тази политика за поверителност или искате да упражните 
                някое от вашите права, моля свържете се с нас:
              </p>
              <div className="mt-4 p-4 bg-mokka-cr/20 rounded-lg">
                <p><strong>Имейл:</strong> hello@mokka.cafe</p>
                <p><strong>Адрес:</strong> бул. Освобождение 31, Пловдив</p>
                <p><strong>Телефон:</strong> +359 876 930 059</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mokka-gy mb-4">8. Промени в политиката</h2>
              <p>
                Ние можем да обновяваме тази политика за поверителност от време на време. 
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
