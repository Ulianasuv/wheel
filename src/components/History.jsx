import React from 'react';

const History = ({ history = [], stats = {}, onClearHistory }) => {
  // Защита от undefined/null
  const safeHistory = Array.isArray(history) ? history : [];
  const safeStats = stats || {};
  
  // Безопасный рендеринг
  const renderHistoryItems = () => {
    try {
      return safeHistory.map((item, index) => (
        <div key={index} className={`history-item ${item.isWin ? 'win' : 'lose'}`}>
          <span className="prize-text">{item.prize || 'Неизвестный приз'}</span>
          <span className="timestamp">
            {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Нет даты'}
          </span>
        </div>
      ));
    } catch (error) {
      console.error('Ошибка при рендеринге истории:', error);
      return (
        <div className="history-error">
          Не удалось загрузить историю. Данные могут быть повреждены.
        </div>
      );
    }
  };

  const renderStats = () => {
    try {
      return (
        <div className="stats">
          <div className="stat">
            <span className="stat-label">Всего попыток:</span>
            <span className="stat-value">{safeStats.totalAttempts || 0}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Побед:</span>
            <span className="stat-value">{safeStats.wins || 0}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Поражений:</span>
            <span className="stat-value">{safeStats.loses || 0}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Попыток сегодня:</span>
            <span className="stat-value">{safeStats.todayAttempts || 0}/5</span>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Ошибка при рендеринге статистики:', error);
      return null;
    }
  };

  return (
    <div className="history-component">
      <div className="history-header">
        <h2>История вращений</h2>
        {onClearHistory && (
          <button 
            onClick={() => onClearHistory?.()} 
            className="clear-btn"
            disabled={safeHistory.length === 0}
          >
            Очистить историю
          </button>
        )}
      </div>
      
      {renderStats()}
      
      <div className="history-list">
        {safeHistory.length > 0 ? (
          renderHistoryItems()
        ) : (
          <div className="empty-history">
            История вращений пуста. Сделайте первый спин!
          </div>
        )}
      </div>
    </div>
  );
};

export default History;