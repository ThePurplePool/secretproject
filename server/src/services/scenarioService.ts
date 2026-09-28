import { db } from '../db/database';
import { Scenario, ScenarioAction, ConsequenceOutcome } from '../models/types';
import { SEED_SCENARIOS } from '../data/seedScenarios';
import { v4 as uuidv4 } from 'uuid';

export class ScenarioService {
  public static initSeedData() {
    const insert = db.prepare(`
      INSERT OR REPLACE INTO scenarios (
        id, title, category, difficulty, level, interface, time_limit,
        starting_balance, sender_json, content_json, pressure_phrases_json,
        available_actions_json, consequences_json, feedback_json, retry_scenario_id,
        timeout_action_id, is_active
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    const insertMany = db.transaction((scenarios: Scenario[]) => {
      for (const s of scenarios) {
        insert.run(
          s.id,
          s.title,
          s.category,
          s.difficulty,
          s.level,
          s.interface,
          s.timeLimit,
          s.startingBalance,
          JSON.stringify(s.sender),
          JSON.stringify(s.content),
          JSON.stringify(s.pressurePhrases),
          JSON.stringify(s.availableActions),
          JSON.stringify(s.consequences),
          JSON.stringify(s.feedback),
          s.retryScenarioId || null,
          s.timeoutActionId || null,
          s.isActive ? 1 : 0
        );
      }
    });

    insertMany(SEED_SCENARIOS);
  }

  public static getAllScenarios(onlyActive = true): Scenario[] {
    const query = onlyActive
      ? 'SELECT * FROM scenarios WHERE is_active = 1 ORDER BY level ASC, difficulty ASC'
      : 'SELECT * FROM scenarios ORDER BY level ASC, difficulty ASC';
    const rows = db.prepare(query).all() as any[];

    return rows.map((r) => this.mapRowToScenario(r));
  }

  public static getScenarioById(id: string): Scenario | null {
    const row = db.prepare('SELECT * FROM scenarios WHERE id = ?').get(id) as any;
    if (!row) return null;
    return this.mapRowToScenario(row);
  }

  public static submitDecision(
    userId: string,
    scenarioId: string,
    actionId: string,
    timeTakenSeconds: number,
    sessionId?: string
  ): {
    action: ScenarioAction;
    consequence: ConsequenceOutcome;
    isSuccess: boolean;
    simulatedLoss: number;
    consequenceLoss: number;
    consequenceChain: string[];
    feedback: any;
    retryScenarioId?: string;
  } {
    const scenario = this.getScenarioById(scenarioId);
    if (!scenario) {
      throw new Error(`Scenario with id ${scenarioId} not found`);
    }

    const isTimeout = actionId === '__TIMEOUT__' || actionId === 'timeout';
    let action: ScenarioAction | undefined;

    if (isTimeout) {
      // If scenario specifies a timeout action (e.g. delete/ignore), use that
      if (scenario.timeoutActionId) {
        action = scenario.availableActions.find((a) => a.id === scenario.timeoutActionId);
      }
      // If not, find the safest action
      if (!action) {
        action = scenario.availableActions.find((a) => a.isCorrect) || scenario.availableActions[0];
      }
    } else {
      action = scenario.availableActions.find((a) => a.id === actionId);
    }

    if (!action) {
      throw new Error(`Action ${actionId} not found in scenario`);
    }

    let consequence: ConsequenceOutcome;
    if (isTimeout) {
      consequence = {
        title: '⏱️ ВРЕМЯ ИСТЕКЛО — УГРОЗА НЕ СРАБОТАЛА',
        chain: [
          'Злоумышленник установил жесткий таймер и угрожал блокировкой счёта',
          'Вы не поддались панике и не выполнили опасное действие (не открыли файл / не передали код)',
          'Время вышло, но манипуляция оказалась пустым блефом',
          'Устройство и баланс в полной безопасности',
        ],
        types: [],
        simulatedLoss: 0,
        summary:
          'Вы выдержали дефицит времени и не поддались на шантаж. В реальной жизни мошенники рассчитывают на импульсивный клик под страхом блокировки. То, что вы не открыли файл, сохранило ваши деньги.',
      };
    } else {
      consequence = scenario.consequences[action.consequenceId] || {
        title: 'Действие выполнено',
        chain: ['Действие зафиксировано системой'],
        types: [],
        simulatedLoss: 0,
        summary: action.explanationNote,
      };
    }

    const isSuccess = isTimeout ? true : action.isCorrect;
    const simulatedLoss = consequence.simulatedLoss || 0;

    // Record or update session
    const chosenAction = isTimeout ? 'timeout_safely_ignored' : actionId;
    if (sessionId) {
      const existing = db.prepare('SELECT id FROM scenario_sessions WHERE id = ?').get(sessionId);
      if (existing) {
        db.prepare(`
          UPDATE scenario_sessions
          SET
            chosen_action_id = ?,
            time_taken_seconds = ?,
            is_success = ?,
            simulated_loss = ?,
            status = 'completed',
            completed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(chosenAction, timeTakenSeconds, isSuccess ? 1 : 0, simulatedLoss, sessionId);
      } else {
        db.prepare(`
          INSERT INTO scenario_sessions (id, user_id, scenario_id, chosen_action_id, time_taken_seconds, is_success, simulated_loss, status, completed_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', CURRENT_TIMESTAMP)
        `).run(sessionId, userId, scenarioId, chosenAction, timeTakenSeconds, isSuccess ? 1 : 0, simulatedLoss);
      }
    } else {
      const newSessionId = uuidv4();
      db.prepare(`
        INSERT INTO scenario_sessions (id, user_id, scenario_id, chosen_action_id, time_taken_seconds, is_success, simulated_loss, status, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', CURRENT_TIMESTAMP)
      `).run(newSessionId, userId, scenarioId, chosenAction, timeTakenSeconds, isSuccess ? 1 : 0, simulatedLoss);
    }

    // Update user balance
    db.prepare(`
      UPDATE users
      SET
        current_balance = MAX(0, current_balance - ?),
        simulated_loss = simulated_loss + ?,
        protected_amount = MAX(0, initial_balance - (simulated_loss + ?))
      WHERE id = ?
    `).run(simulatedLoss, simulatedLoss, simulatedLoss, userId);

    return {
      action,
      consequence,
      isSuccess,
      simulatedLoss,
      consequenceLoss: simulatedLoss,
      consequenceChain: consequence.chain,
      feedback: scenario.feedback,
      retryScenarioId: scenario.retryScenarioId,
    };
  }

  public static saveScenario(s: Scenario): void {
    const existing = db.prepare('SELECT id FROM scenarios WHERE id = ?').get(s.id);
    if (existing) {
      db.prepare(`
        UPDATE scenarios SET
          title = ?, category = ?, difficulty = ?, level = ?, interface = ?,
          time_limit = ?, starting_balance = ?, sender_json = ?, content_json = ?,
          pressure_phrases_json = ?, available_actions_json = ?, consequences_json = ?,
          feedback_json = ?, retry_scenario_id = ?, timeout_action_id = ?, is_active = ?
        WHERE id = ?
      `).run(
        s.title,
        s.category,
        s.difficulty,
        s.level,
        s.interface,
        s.timeLimit,
        s.startingBalance,
        JSON.stringify(s.sender),
        JSON.stringify(s.content),
        JSON.stringify(s.pressurePhrases),
        JSON.stringify(s.availableActions),
        JSON.stringify(s.consequences),
        JSON.stringify(s.feedback),
        s.retryScenarioId || null,
        s.timeoutActionId || null,
        s.isActive ? 1 : 0,
        s.id
      );
    } else {
      db.prepare(`
        INSERT INTO scenarios (
          id, title, category, difficulty, level, interface, time_limit,
          starting_balance, sender_json, content_json, pressure_phrases_json,
          available_actions_json, consequences_json, feedback_json, retry_scenario_id,
          timeout_action_id, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        s.id,
        s.title,
        s.category,
        s.difficulty,
        s.level,
        s.interface,
        s.timeLimit,
        s.startingBalance,
        JSON.stringify(s.sender),
        JSON.stringify(s.content),
        JSON.stringify(s.pressurePhrases),
        JSON.stringify(s.availableActions),
        JSON.stringify(s.consequences),
        JSON.stringify(s.feedback),
        s.retryScenarioId || null,
        s.timeoutActionId || null,
        s.isActive ? 1 : 0
      );
    }
  }

  private static mapRowToScenario(r: any): Scenario {
    return {
      id: r.id,
      title: r.title,
      category: r.category,
      difficulty: r.difficulty,
      level: r.level,
      interface: r.interface,
      timeLimit: r.time_limit,
      startingBalance: r.starting_balance,
      sender: JSON.parse(r.sender_json),
      content: JSON.parse(r.content_json),
      pressurePhrases: JSON.parse(r.pressure_phrases_json),
      availableActions: JSON.parse(r.available_actions_json),
      consequences: JSON.parse(r.consequences_json),
      feedback: JSON.parse(r.feedback_json),
      retryScenarioId: r.retry_scenario_id,
      timeoutActionId: r.timeout_action_id || undefined,
      isActive: r.is_active === 1,
    };
  }
}
