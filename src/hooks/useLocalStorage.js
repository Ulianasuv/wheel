// 1. СОЗДАНИЕ ХУКА

import { useState, useEffect } from "react";

export function useLocalStorage(key, initialValue) {
    // 2. ИНИЦИАЛИЗАЦИЯ СОСТОЯНИЯ
    const [value, setValue] = useState(() => {
        try {
            const saved = localStorage.getItem(key);
            return saved !== null ? JSON.parse(saved) : initialValue;
        // Пытаемся прочитать из localStorage
            // Если там что-то есть - парсим JSON
        // Если нет - используем initialValue
        } catch (error) {
             console.error("Error reading ", error)
             return initialValue; 
        // Если ошибка (например, поврежденные данные)
        // console.error(error);
        }
    });
    // 3. СИНХРОНИЗАЦИЯ С LOCALSTORAGE
    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        // При каждом изменении value сохраняем в localStorage
        } catch (error) {
        console.error("Error saving to localStorage:", error);
        }
    }, [key, value]); // Срабатывает при изменении key или value
    // 4. ВОЗВРАЩАЕМ [значение, функция_обновления]

     return [value, setValue];

}

export default useLocalStorage;