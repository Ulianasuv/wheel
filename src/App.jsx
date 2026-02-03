import { useState, useEffect } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'  // Импорт кастомного хука
import Wheel from './components/Wheel' // Импорт компонента Wheel
import History from './components/History' // Импорт компонента History
import ErrorBoundary from './components/ErrorBoundary' 
import './styles/App.scss' // ← Правильный путь к стилям!

function App() {
  const [history, setHistory] = useLocalStorage('wheelHistory', []);

  const [stats, setStats] = useLocalStorage('wheelStats', {
    totalAttempts: 0,
    wins: 0,
    loses: 0,
    todayAttempts: 0,
    lastResetDate: new Date().toDateString()
  });

  const [isSpinning, setIsSpinning] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(10);
  const [notification, setNotification] = useState(null);
  const [showDailyLimitMessage, setShowDailyLimitMessage] = useState(false);
  const [historyError, setHistoryError] = useState(false); 

  // Проверяем, не нужно ли сбросить дневные попытки
  useEffect(() => {
    const today = new Date().toDateString();
    if (stats.lastResetDate !== today) {
      setStats(prev => ({
        ...prev,
        todayAttempts: 0,
        lastResetDate: today
      }));
      setAttemptsLeft(5);
    } else {
      const left = 5 - stats.todayAttempts;
      setAttemptsLeft(left);
      
      // Если попытки закончились, показываем сообщение
      if (left <= 0) {
        setShowDailyLimitMessage(true);
      }
    }
  }, [stats.lastResetDate]);
// Функция для показа уведомлений
const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
};

const handleSpinComplete = (prize, index) => {
  const newHistoryItem = {
    prize: prize.text,
    isWin: prize.isWin,
    timestamp: new Date().toISOString(),
    index: index,
  };

   try {
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 14)]);
    } catch (error) {
      console.error('Ошибка при обновлении истории:', error);
      showNotification('Не удалось сохранить историю', 'error');
      setHistoryError(true);
    }

  try {
      setStats(prev => ({
        ...prev,
        totalAttempts: prev.totalAttempts + 1,
        todayAttempts: prev.todayAttempts + 1,
        wins: prize.isWin ? prev.wins + 1 : prev.wins,
        loses: !prize.isWin ? prev.loses + 1 : prev.loses
      }));
    } catch (error) {
      console.error('Ошибка при обновлении статистики:', error);
    }

  setAttemptsLeft((prev) => {
    const newValue = Math.max(0, prev - 1);

    // Проверяем, исчерпаны ли попытки
    if (newValue <= 0) {
      setShowDailyLimitMessage(true);
      showNotification(
        "Дневной лимит попыток исчерпан. Ждем вас завтра!",
        "info",
      );
    }

    return newValue;
  });
};

// Обновляем Wheel, чтобы он показывал сообщение при исчерпании попыток
  const handleSpinAttempt = () => {
    if (attemptsLeft <= 0) {
      setShowDailyLimitMessage(true);
      showNotification('Дневной лимит попыток исчерпан. Ждем вас завтра!', 'info');
      return false;
    }
    return true;
  };

const handleClearHistory = () => {
    if (window.confirm('Вы уверены, что хотите очистить историю?')) {
      try {
        setHistory([]);
        setStats(prev => ({
          ...prev,
          totalAttempts: 0,
          wins: 0,
          loses: 0,
          todayAttempts: prev.todayAttempts,
          lastResetDate: prev.lastResetDate
        }));
      } catch (error) {
        console.error('Ошибка при очистке истории:', error);
        showNotification('Не удалось очистить историю', 'error');
      }
    }
  };
    const retryHistory = () => {
    setHistoryError(false);
  };

return (
    <div className="app">
      {/* Уведомления */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      {/* Сообщение о дневном лимите */}
      {showDailyLimitMessage && attemptsLeft <= 0 && (
        <div className="daily-limit-message">
          <div className="message-content">
            <h3>Дневной лимит попыток исчерпан</h3>
            <p>Вы использовали все 5 попыток на сегодня. Ждем вас завтра!</p>
            <button 
              onClick={() => setShowDailyLimitMessage(false)}
              className="close-btn"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      <div className="wheel-container">
        <Wheel
          onSpinComplete={handleSpinComplete}
          attemptsLeft={attemptsLeft}
          isSpinning={isSpinning}
          setIsSpinning={setIsSpinning}
          showNotification={showNotification}
          onSpinAttempt={handleSpinAttempt} // Передаем новую функцию
        />
      </div>
      
      <div className="history-container">
        {historyError ? (
          <div className="history-error-fallback">
            <div className="error-fallback-content">
              <h3>История временно недоступна</h3>
              <p>Но это не мешает крутить колесо!</p>
              <div className="fallback-stats">
                <div className="stat-item">
                  <span className="stat-label">Попыток сегодня:</span>
                  <span className="stat-value">{stats.todayAttempts}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Всего побед:</span>
                  <span className="stat-value">{stats.wins}</span>
                </div>
              </div>
              <button onClick={retryHistory} className="retry-btn">
                Обновить историю
              </button>
            </div>
          </div>
        ) : (
          <ErrorBoundary>
            <History
              history={history}
              stats={stats}
              onClearHistory={handleClearHistory}
            />
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
}

export default App;

