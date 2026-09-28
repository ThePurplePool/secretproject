// Automated Acceptance Test Suite (AC-GEN through AC-W, TEST-001)
// Anti-Scam Uzbekistan MVP End-to-End Verification

const API_BASE = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

function assert(condition, message, extra = null) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    if (extra) console.error('Extra details:', JSON.stringify(extra, null, 2));
    process.exitCode = 1;
    throw new Error(message);
  }
  console.log(`  ✓ ${message}`);
}

async function runAcceptanceTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🛡️  ANTI-SCAM UZBEKISTAN: AUTOMATED ACCEPTANCE TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const testUser = `defender_${Date.now()}`;
  const testPassword = 'StrongPassword123!';
  let sessionToken = '';
  let initialBalance = 10000000;

  // 1. AC-AUTH-01 & AC-AUTH-02: User Registration & Session Token
  console.log('▶ [Step 1] Registration & Authentication (AC-AUTH-01, AC-AUTH-02)');
  const regRes = await request('/users/register', {
    method: 'POST',
    body: JSON.stringify({ username: testUser, password: testPassword }),
  });
  assert(regRes.ok, `Registration succeeded for ${testUser}`);
  assert(regRes.data.user && regRes.data.user.username === testUser, 'User profile returned with correct username');
  assert(regRes.data.sessionToken, 'Authoritative session token issued');
  sessionToken = regRes.data.sessionToken;
  assert(regRes.data.user.currentBalance === initialBalance, 'Initial virtual balance is 10,000,000 UZS');
  assert(regRes.data.user.level === 1, 'Initial level is 1 (Базовый)');

  const authHeaders = { Authorization: `Bearer ${sessionToken}` };

  // 2. AC-SCEN-01: Catalog of Scenarios
  console.log('\n▶ [Step 2] Scenarios Catalog (AC-SCEN-01)');
  const catalogRes = await request('/scenarios', { headers: authHeaders });
  assert(catalogRes.ok, 'Scenario catalog loaded');
  assert(Array.isArray(catalogRes.data) && catalogRes.data.length >= 10, `Loaded ${catalogRes.data.length} scenarios (>= 10 expected)`);
  
  const firstScenario = catalogRes.data.find(s => s.id === 'fake-bank-telegram-001');
  assert(firstScenario, 'Found baseline scenario "fake-bank-telegram-001"');
  assert(firstScenario.interface === 'telegram', 'Interface type is telegram');
  assert(firstScenario.timeLimit > 0, 'Scenario has strict time limit');

  // 3. TEST-001 / Step 1: Start Scenario 1 Session (Authoritative Server-side Timer)
  console.log('\n▶ [Step 3] Start Scenario Session & Authoritative Timer (TEST-001.1, AC-TIMER-01)');
  const startRes = await request(`/scenarios/${firstScenario.id}/start`, {
    method: 'POST',
    headers: authHeaders,
  });
  assert(startRes.ok, 'Scenario session successfully started', startRes);
  assert(startRes.data.sessionId, `Session ID created: ${startRes.data.sessionId}`);
  assert(startRes.data.serverTime, 'Server timestamp provided');
  assert(startRes.data.startedAt, 'Session start timestamp recorded on server');
  assert(startRes.data.timeLimit === firstScenario.timeLimit, 'Timer limit synced with scenario specification');

  // 4. TEST-001 / Step 2 & 3: Dangerous Action -> Consequence Screen & Loss Deduction
  console.log('\n▶ [Step 4] Dangerous Action & Simulated Financial Loss (TEST-001.2, TEST-001.3, AC-LOSS-01)');
  const failRes = await request(`/scenarios/${firstScenario.id}/decision`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      sessionId: startRes.data.sessionId,
      actionId: 'open_file', // Scammer APK launch
    }),
  });
  assert(failRes.ok, 'Decision evaluated');
  assert(failRes.data.isSuccess === false, 'Action identified as dangerous (failure)');
  assert(failRes.data.consequenceLoss === 1500000, 'Loss of 1,500,000 UZS simulated');
  assert(failRes.data.user.currentBalance === initialBalance - 1500000, 'User virtual balance deducted correctly');
  assert(failRes.data.consequenceChain && failRes.data.consequenceChain.length >= 3, 'Consequence chain provides realistic malware progression');
  assert(failRes.data.feedback && (failRes.data.feedback.realLifeRule || failRes.data.feedback.rule), 'Educational golden rule provided');

  // 5. TEST-001 / Step 4 & 5 & 6: Retry Scenario -> Safe Action -> Success & XP
  console.log('\n▶ [Step 5] Retry Scenario with Safe Action (TEST-001.4, TEST-001.5, TEST-001.6)');
  // Start new attempt session
  const retryStart = await request(`/scenarios/${firstScenario.id}/start`, {
    method: 'POST',
    headers: authHeaders,
  });
  assert(retryStart.ok, 'Retry session started');

  // Choose safe action: delete message (or ignore)
  const safeRes = await request(`/scenarios/${firstScenario.id}/decision`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      sessionId: retryStart.data.sessionId,
      actionId: 'delete_message',
    }),
  });
  assert(safeRes.ok, 'Safe decision evaluated');
  assert(safeRes.data.isSuccess === true, 'Inaction / message deletion recognized as safe/correct choice');
  assert(safeRes.data.consequenceLoss === 0, 'Zero loss incurred for safe refusal');
  assert(safeRes.data.user.scenariosCompleted > 0, `User completed scenario count: ${safeRes.data.user.scenariosCompleted}`);

  // 6. Complete required scenarios for Level Progression (Level 1 -> Level 2)
  console.log('\n▶ [Step 6] Complete Level 1 & Level 2 Scenarios Progression (AC-PROG-01, AC-CERT-01)');
  const progressionScenarios = [
    { id: 'fake-bank-sms-002', safeAction: 'open_official_bank_app' },
    { id: 'fake-gov-email-003', safeAction: 'check_domain' },
    { id: 'fake-relative-005', safeAction: 'ask_personal_secret_question' },
    { id: 'fake-delivery-sms-006', safeAction: 'check_official_tracking' },
  ];

  for (const s of progressionScenarios) {
    const sStart = await request(`/scenarios/${s.id}/start`, { method: 'POST', headers: authHeaders });
    assert(sStart.ok, `Session started for scenario ${s.id}`);
    const sDec = await request(`/scenarios/${s.id}/decision`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ sessionId: sStart.data.sessionId, actionId: s.safeAction }),
    });
    assert(sDec.ok && sDec.data.isSuccess, `Safe action completed for ${s.id}`);
  }

  // Check Profile for Level and Certificates
  console.log('\n▶ [Step 7] Verify Profile & Issued Certificates (AC-CERT-01, AC-CERT-02)');
  const profRes = await request('/users/profile', { headers: authHeaders });
  assert(profRes.ok, 'Profile loaded');
  assert(profRes.data.user.level >= 2, `User level progressed to ${profRes.data.user.level}`);
  assert(profRes.data.certificates && profRes.data.certificates.length >= 2, `Issued certificates count: ${profRes.data.certificates.length}`);
  
  const defenderCert = profRes.data.certificates.find(c => c.levelNumber === 2 || c.levelName.includes('Defender'));
  assert(defenderCert, 'Defender Level Certificate found in profile');
  assert(defenderCert.verificationHash && defenderCert.verificationHash.length === 64, 'Certificate has valid 64-character SHA-256 hash');

  // 7. AC-CERT-03: Public Certificate Lookup / Verification
  console.log('\n▶ [Step 8] Public Certificate Verification Registry (AC-CERT-03)');
  const verifyRes = await request(`/users/certificates/verify/${defenderCert.certificateId}`);
  assert(verifyRes.ok, 'Public verification API responded with 200 OK');
  assert(verifyRes.data.verified === true, 'Certificate marked as verified');
  assert(verifyRes.data.certificate.certificateId === defenderCert.certificateId, 'Verified certificate ID matches');
  assert(verifyRes.data.certificate.verificationHash === defenderCert.verificationHash, 'Verified SHA-256 hash matches');

  // 8. AC-CONSULT-03: Structured Written Response (Consultant Case Analysis)
  console.log('\n▶ [Step 9] Consultant Structured Written Response (AC-CONSULT-03)');
  const consultReviewRes = await request('/users/consultant/review', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      caseId: 'consultant-case-001',
      analysisText: 'Мошенники используют поддельный домен click-security.uz, эмоциональное давление о блокировке счета, и просят ввести SMS-код подтверждения, который на самом деле авторизует списание средств в стороннем терминале.',
      actionPlan: 'Немедленно заблокировать карту через официальное банковское приложение или колл-центр, не сообщать коды, подать заявление в киберподразделение МВД.',
      preventionRule: 'Служба безопасности никогда не звонит в Telegram и не просит коды из SMS для разблокировки.',
    }),
  });
  assert(consultReviewRes.ok, 'Consultant analysis submitted');
  assert(consultReviewRes.data.score >= 70, `Consultant score: ${consultReviewRes.data.score}/100`);
  assert(consultReviewRes.data.approved === true, 'Consultant structured case approved');
  assert(consultReviewRes.data.consultantCertificate, 'Consultant Certificate issued upon review approval');

  // 9. AC-FRAUD-01 & AC-FRAUD-02: Scam Intelligence & Cluster Linking
  console.log('\n▶ [Step 10] Scam Intelligence & Cluster Linking (AC-FRAUD-01, AC-FRAUD-02)');
  const sharedPhone = '+998901234567';
  const report1 = await request('/reports', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      scammerPhone: sharedPhone,
      telegramHandle: '@fake_agent_bot',
      scamType: 'fake_bank_call',
      description: 'Звонили с номера и требовали код',
    }),
  });
  assert(report1.ok, 'Fraud report 1 submitted');

  const report2 = await request('/reports', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      scammerPhone: sharedPhone,
      fakeUrl: 'https://payme-bonus-check.click',
      scamType: 'phishing_link',
      description: 'Прислали ссылку на фишинг в SMS',
    }),
  });
  assert(report2.ok, 'Fraud report 2 submitted with same phone number');

  // Verify Scam Clusters
  const clustersRes = await request('/reports/clusters', { headers: authHeaders });
  assert(clustersRes.ok, 'Clusters retrieved');
  assert(Array.isArray(clustersRes.data) && clustersRes.data.length > 0, 'Scam clusters discovered');
  const matchingCluster = clustersRes.data.find(c => 
    (c.matchedPhones && c.matchedPhones.includes(sharedPhone)) ||
    (c.indicatorsSummary && c.indicatorsSummary.includes(sharedPhone)) ||
    (c.title && c.title.includes(sharedPhone))
  );
  assert(matchingCluster, `Cluster successfully aggregated around identifier ${sharedPhone}`, clustersRes.data);
  assert(matchingCluster.reportCount >= 2, `Cluster aggregates ${matchingCluster.reportCount} reports`);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🎉 ALL ACCEPTANCE CRITERIA AND TEST-001 SUCCESSFULLY VERIFIED!');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

runAcceptanceTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
