# Руководство по созданию сценариев (SCENARIO_AUTHORING.md)

Сценарии в платформе **Anti-Scam Uzbekistan** являются полностью **data-driven**. Чтобы добавить новую мошенническую ситуацию, **не требуется изменять или перекомпилировать код фронтенда**.

---

## 1. Структура сценария

Новый сценарий описывается объектом формата `Scenario`:

```json
{
  "id": "unique-scenario-id",
  "title": "Название ситуации на русском/узбекском",
  "category": "phishing | malware | financial | social_engineering | impersonation",
  "difficulty": 1,
  "level": 1,
  "interface": "telegram | sms | email | browser | banking | social | delivery | call",
  "timeLimit": 20,
  "startingBalance": 10000000,
  "sender": {
    "name": "Имя отправителя",
    "handleOrPhone": "@username_ili_nomer",
    "verified": false,
    "status": "был(а) недавно"
  },
  "content": {
    "text": "Текст входящего сообщения или уловки...",
    "url": "https://suspicious-link.xyz",
    "attachment": {
      "name": "Zayavleniye.pdf.apk",
      "size": "3.5 МБ",
      "type": "dangerous_apk"
    }
  },
  "pressurePhrases": [
    { "atSecondsRemaining": 15, "text": "Через 15 секунд счёт будет заморожен!" },
    { "atSecondsRemaining": 5, "text": "Последнее предупреждение!" }
  ],
  "availableActions": [
    {
      "id": "danger_action",
      "label": "Открыть подозрительный файл",
      "type": "critical_danger",
      "isCorrect": false,
      "consequenceId": "malware_consequence",
      "explanationNote": "Файл был вредоносным."
    },
    {
      "id": "safe_action",
      "label": "Проверить первоисточник",
      "type": "safe",
      "isCorrect": true,
      "consequenceId": "safe_outcome",
      "explanationNote": "Вы предотвратили компрометацию."
    }
  ],
  "consequences": {
    "malware_consequence": {
      "title": "⚠️ ЗАРАЖЕНИЕ УСТРОЙСТВА",
      "chain": [
        "Открытие файла",
        "Установка шпиона",
        "Списание средств"
      ],
      "types": ["DEVICE_COMPROMISE", "FINANCIAL_LOSS"],
      "simulatedLoss": 1500000,
      "summary": "Устройство заражено, симулирован ущерб 1 500 000 сум."
    },
    "safe_outcome": {
      "title": "🛡️ УГРОЗА НЕЙТРАЛИЗОВАНА",
      "chain": ["Отказ от открытия", "Проверка подлинности"],
      "types": [],
      "simulatedLoss": 0,
      "summary": "Вы сохранили деньги и устройство в безопасности."
    }
  },
  "feedback": {
    "userActionSummary": "Мошенники пытались внедрить вредоносную программу.",
    "whyDangerous": "Исполняемые файлы в мессенджерах перехватывают SMS-коды.",
    "psychologicalTricks": ["Срочность", "Страх потери денег"],
    "suspiciousIndicators": ["Двойное расширение .pdf.apk", "Неофициальный аккаунт"],
    "correctActionAdvice": "Проверяйте информацию через официальное приложение банка.",
    "realLifeRule": "Банки Узбекистана никогда не отправляют установочные файлы в Telegram."
  },
  "retryScenarioId": "another-scenario-id",
  "isActive": true
}
```

---

## 2. Способы добавления

### Способ A: Добавление в сид-коллекцию (`seedScenarios.ts`)
1. Откройте `server/src/data/seedScenarios.ts`.
2. Добавьте объект нового сценария в массив `SEED_SCENARIOS`.
3. Перезапустите сервер. При пустой базе или вызове `ScenarioService.saveScenario()` он появится в системе.

### Способ B: Через REST API / Админ-панель
Отправьте POST-запрос с JSON описанием сценария:
```http
POST /api/admin/scenarios
Content-Type: application/json

{ ... scenario json ... }
```

Сценарий мгновенно появится в общем каталоге и будет отображаться в соответствующем интерфейсе (`interface`) без единого изменения во фронтенд-коде.
