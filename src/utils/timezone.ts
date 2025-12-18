/**
 * Утилиты для работы с часовыми поясами
 */

/**
 * Получить текущий timezone браузера
 */
export const getCurrentTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Форматировать время в UTC в формат HH:mm в заданном timezone
 */
export const formatTimeInTimezone = (
  utcDateString: string,
  timezone: string = 'UTC'
): string => {
  try {
    const date = new Date(utcDateString)
    
    const formatter = new Intl.DateTimeFormat('ru-RU', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    
    return formatter.format(date)
  } catch (error) {
    console.error('Error formatting time:', error)
    return new Date(utcDateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

/**
 * Форматировать дату в заданном timezone
 * Возвращает отформатированную дату для группировки сообщений
 */
export const formatDateInTimezone = (
  utcDateString: string,
  timezone: string = 'UTC'
): string => {
  try {
    const date = new Date(utcDateString)
    const now = new Date()
    
    // Получить даты в заданном timezone
    const formatter = new Intl.DateTimeFormat('ru-RU', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    
    const nowFormatter = new Intl.DateTimeFormat('ru-RU', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    
    const dateStr = formatter.format(date)
    const nowStr = nowFormatter.format(now)
    
    // Проверить, сегодня ли сообщение
    if (dateStr === nowStr) {
      return 'Сегодня'
    }
    
    // Проверить, вчера ли было сообщение
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayFormatter = new Intl.DateTimeFormat('ru-RU', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    const yesterdayStr = yesterdayFormatter.format(yesterday)
    
    if (dateStr === yesterdayStr) {
      return 'Вчера'
    }
    
    // Форматировать как дату
    const dateObj = new Date(utcDateString)
    const dayFormatter = new Intl.DateTimeFormat('ru-RU', {
      timeZone: timezone,
      day: 'numeric',
      month: 'long'
    })
    
    return dayFormatter.format(dateObj)
  } catch (error) {
    console.error('Error formatting date:', error)
    const date = new Date(utcDateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера'
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
      })
    }
  }
}

/**
 * Форматировать время для списка диалогов (компактный формат)
 */
export const formatCompactTimeInTimezone = (
  utcDateString: string,
  timezone: string = 'UTC'
): string => {
  try {
    const date = new Date(utcDateString)
    const now = new Date()
    
    // Получить даты в заданном timezone
    const formatter = new Intl.DateTimeFormat('ru-RU', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    
    const nowFormatter = new Intl.DateTimeFormat('ru-RU', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    
    const dateStr = formatter.format(date)
    const nowStr = nowFormatter.format(now)
    
    // Если сегодня, показать только время
    if (dateStr === nowStr) {
      return formatTimeInTimezone(utcDateString, timezone)
    }
    
    // Если вчера, показать 'Вчера'
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayFormatter = new Intl.DateTimeFormat('ru-RU', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    const yesterdayStr = yesterdayFormatter.format(yesterday)
    
    if (dateStr === yesterdayStr) {
      return 'Вчера'
    }
    
    // Если в этом году, показать день и месяц
    const dateObj = new Date(utcDateString)
    const yearFormatter = new Intl.DateTimeFormat('ru-RU', {
      timeZone: timezone,
      year: 'numeric'
    })
    const nowYearStr = yearFormatter.format(now)
    const dateYearStr = yearFormatter.format(dateObj)
    
    if (dateYearStr === nowYearStr) {
      const dayMonthFormatter = new Intl.DateTimeFormat('ru-RU', {
        timeZone: timezone,
        day: 'numeric',
        month: '2-digit'
      })
      return dayMonthFormatter.format(dateObj)
    }
    
    // Если в другом году, показать полную дату
    const fullFormatter = new Intl.DateTimeFormat('ru-RU', {
      timeZone: timezone,
      day: 'numeric',
      month: '2-digit',
      year: '2-digit'
    })
    return fullFormatter.format(dateObj)
  } catch (error) {
    console.error('Error formatting compact time:', error)
    const date = new Date(utcDateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else if (days === 1) {
      return 'Вчера'
    } else if (days < 7) {
      return date.toLocaleDateString('ru-RU', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit' 
      })
    }
  }
}
