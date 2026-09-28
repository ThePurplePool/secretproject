import { VoiceProvider, VoiceCallState } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export class SimulationVoiceProvider implements VoiceProvider {
  public name = 'AntiScam-Simulation-Voice-Engine';

  private activeCalls = new Map<
    string,
    {
      scenarioId: string;
      stage: number;
    }
  >();

  public async initializeCall(scenarioId: string): Promise<VoiceCallState> {
    const callId = uuidv4();
    this.activeCalls.set(callId, { scenarioId, stage: 1 });

    if (scenarioId === 'fake-police-call-004') {
      return {
        callId,
        scenarioId,
        callerName: 'Следователь МВД Сабиров',
        callerNumber: '+998 71 231-12-88',
        stage: 1,
        urgencyLevel: 'high',
        currentAudioScript:
          'Алло! Это срочно! Ваш близкий человек только что сбил пешехода на перекрёстке, пострадавший в тяжёлом состоянии. Чтобы не возбуждать уголовное дело и замять вопрос до приезда прокурора, нужно срочно перевести залог 4 000 000 сум на специальный счёт адвоката. У вас есть ровно 5 минут, иначе его закрывают в изолятор!',
        availableUserReplies: [
          {
            id: 'reply_pay',
            text: '«Хорошо, на какой номер карты скинуть деньги?! Пожалуйста, не закрывайте его!»',
            consequenceId: 'bail_scam_loss',
            isSafe: false,
          },
          {
            id: 'reply_details',
            text: '«Назовите номер жетона, ваше звание и точный адрес РОВД. Я сейчас лично приеду с адвокатом.»',
            consequenceId: 'police_impersonator_panicked',
            isSafe: true,
          },
          {
            id: 'reply_hangup',
            text: '«Я сейчас вешаю трубку и перезваниваю родственнику напрямую.» (Сбросить звонок)',
            consequenceId: 'verified_relative_safe',
            isSafe: true,
          },
        ],
      };
    }

    // Default Bank impersonation call
    return {
      callId,
      scenarioId,
      callerName: 'Служба мониторинга транзакций',
      callerNumber: '+998 78 150-00-00',
      stage: 1,
      urgencyLevel: 'moderate',
      currentAudioScript:
        'Здравствуйте! Звонок из службы безопасности единого межбанковского клиринга. Прямо сейчас зафиксирована попытка несанкционированного перевода с вашего пластикового счёта. Для экстренной отмены транзакции продиктуйте код из входящего SMS-сообщения.',
      availableUserReplies: [
        {
          id: 'reply_give_code',
          text: '«Да, сейчас, секунду... Вот пришёл код: 7 8 2 1»',
          consequenceId: 'credential_theft',
          isSafe: false,
        },
        {
          id: 'reply_decline_code',
          text: '«Сотрудники банка никогда не спрашивают SMS-коды. Я сам перезвоню в банк по номеру с карты.»',
          consequenceId: 'safe_official_check',
          isSafe: true,
        },
        {
          id: 'reply_hangup_immediate',
          text: 'Молча сбросить трубку и заблокировать номер.',
          consequenceId: 'reported_sms',
          isSafe: true,
        },
      ],
    };
  }

  public async processReply(
    callId: string,
    replyId: string
  ): Promise<{
    nextScript?: string;
    isCallEnded: boolean;
    consequenceId?: string;
    urgencyLevel: 'moderate' | 'high' | 'extreme';
  }> {
    const call = this.activeCalls.get(callId);
    if (!call) {
      throw new Error('Call session expired or not found');
    }

    if (replyId === 'reply_pay') {
      return {
        nextScript:
          '«Диктую номер карты: 8600 5500 1234 9876. Переводите ровно 4 миллиона сум прямо сейчас! У вас 2 минуты!»',
        isCallEnded: false,
        consequenceId: 'bail_scam_loss',
        urgencyLevel: 'extreme',
      };
    }

    if (replyId === 'reply_give_code') {
      return {
        nextScript: '«Код принят... Транзакция проведена... До свидания.» (Гудки)',
        isCallEnded: true,
        consequenceId: 'credential_theft',
        urgencyLevel: 'high',
      };
    }

    if (replyId === 'reply_details') {
      return {
        nextScript:
          '«Что вы умничаете?! Я сказал, человек в реанимации! Вы сами пойдёте как соучастник!...» (Злоумышленник в бешенстве бросил трубку)',
        isCallEnded: true,
        consequenceId: 'police_impersonator_panicked',
        urgencyLevel: 'moderate',
      };
    }

    // Default safe hangup
    return {
      nextScript: 'Звонок завершён. Вы заблокировали потенциальную угрозу.',
      isCallEnded: true,
      consequenceId: 'verified_relative_safe',
      urgencyLevel: 'moderate',
    };
  }
}

export const defaultVoiceProvider: VoiceProvider = new SimulationVoiceProvider();
