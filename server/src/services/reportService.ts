import { db } from '../db/database';
import { FraudReport, ScamCluster } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export class ReportService {
  public static createReport(data: {
    userId?: string;
    category: string;
    phoneNumber?: string;
    telegramHandle?: string;
    whatsappHandle?: string;
    url?: string;
    paymentRequisites?: string;
    description: string;
    screenshotUrl?: string;
  }): { report: FraudReport; cluster?: ScamCluster; message: string } {
    const reportId = `REP-UZ-${Math.floor(100000 + Math.random() * 900000)}`;
    const id = uuidv4();

    // Sanitize indicators
    const phone = data.phoneNumber ? data.phoneNumber.trim().replace(/[^\d+]/g, '') : undefined;
    const telegram = data.telegramHandle ? data.telegramHandle.trim().toLowerCase().replace('@', '') : undefined;
    const whatsapp = data.whatsappHandle ? data.whatsappHandle.trim().replace(/[^\d+]/g, '') : undefined;
    const url = data.url ? data.url.trim().toLowerCase() : undefined;
    const requisites = data.paymentRequisites ? data.paymentRequisites.trim().replace(/\s+/g, '') : undefined;

    // Find linked cluster
    const cluster = this.linkOrFormScamCluster({
      phone,
      telegram,
      url,
      requisites,
      category: data.category,
    });

    db.prepare(`
      INSERT INTO fraud_reports (
        id, report_id, user_id, category, phone_number, telegram_handle,
        whatsapp_handle, url, payment_requisites, description, screenshot_url,
        status, scam_cluster_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      reportId,
      data.userId || null,
      data.category,
      phone || null,
      telegram || null,
      whatsapp || null,
      url || null,
      requisites || null,
      data.description,
      data.screenshotUrl || null,
      cluster ? 'confirmed_cluster' : 'new',
      cluster ? cluster.id : null
    );

    const createdReport: FraudReport = {
      id,
      reportId,
      userId: data.userId,
      category: data.category,
      phoneNumber: phone,
      telegramHandle: telegram,
      whatsappHandle: whatsapp,
      url,
      paymentRequisites: requisites,
      description: data.description,
      screenshotUrl: data.screenshotUrl,
      status: cluster ? 'confirmed_cluster' : 'new',
      scamClusterId: cluster ? cluster.id : undefined,
      createdAt: new Date().toISOString(),
    };

    return {
      report: createdReport,
      cluster,
      message: 'Сообщение принято. Информация может использоваться для выявления связанных мошеннических схем.',
    };
  }

  public static getAllReports(): FraudReport[] {
    const rows = db.prepare('SELECT * FROM fraud_reports ORDER BY created_at DESC').all() as any[];
    return rows.map((r) => ({
      id: r.id,
      reportId: r.report_id,
      userId: r.user_id || undefined,
      category: r.category,
      phoneNumber: r.phone_number || undefined,
      telegramHandle: r.telegram_handle || undefined,
      whatsappHandle: r.whatsapp_handle || undefined,
      url: r.url || undefined,
      paymentRequisites: r.payment_requisites || undefined,
      description: r.description,
      screenshotUrl: r.screenshot_url || undefined,
      status: r.status,
      scamClusterId: r.scam_cluster_id || undefined,
      createdAt: r.created_at,
    }));
  }

  public static getAllClusters(): ScamCluster[] {
    const rows = db.prepare('SELECT * FROM scam_clusters ORDER BY report_count DESC').all() as any[];
    return rows.map((r) => ({
      id: r.id,
      clusterCode: r.cluster_code,
      title: r.title,
      indicatorsSummary: r.indicators_summary,
      reportCount: r.report_count,
      confidenceScore: r.confidence_score,
      status: r.status,
      matchedPhones: JSON.parse(r.matched_phones_json || '[]'),
      matchedTelegrams: JSON.parse(r.matched_telegrams_json || '[]'),
      matchedUrls: JSON.parse(r.matched_urls_json || '[]'),
      matchedRequisites: JSON.parse(r.matched_requisites_json || '[]'),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  private static linkOrFormScamCluster(indicators: {
    phone?: string;
    telegram?: string;
    url?: string;
    requisites?: string;
    category: string;
  }): ScamCluster | undefined {
    // 1. Search existing clusters for matching indicators
    const allClusters = this.getAllClusters();

    for (const c of allClusters) {
      const matchPhone = indicators.phone && c.matchedPhones.includes(indicators.phone);
      const matchTg = indicators.telegram && c.matchedTelegrams.includes(indicators.telegram);
      const matchUrl = indicators.url && c.matchedUrls.some((u) => indicators.url?.includes(u) || u.includes(indicators.url!));
      const matchReq = indicators.requisites && c.matchedRequisites.includes(indicators.requisites);

      if (matchPhone || matchTg || matchUrl || matchReq) {
        // Update cluster
        if (indicators.phone && !c.matchedPhones.includes(indicators.phone)) c.matchedPhones.push(indicators.phone);
        if (indicators.telegram && !c.matchedTelegrams.includes(indicators.telegram)) c.matchedTelegrams.push(indicators.telegram);
        if (indicators.url && !c.matchedUrls.includes(indicators.url)) c.matchedUrls.push(indicators.url);
        if (indicators.requisites && !c.matchedRequisites.includes(indicators.requisites)) c.matchedRequisites.push(indicators.requisites);

        const newCount = c.reportCount + 1;
        const newScore = Math.min(0.99, Number((c.confidenceScore + 0.05).toFixed(2)));

        db.prepare(`
          UPDATE scam_clusters
          SET report_count = ?, confidence_score = ?,
              matched_phones_json = ?, matched_telegrams_json = ?,
              matched_urls_json = ?, matched_requisites_json = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(
          newCount,
          newScore,
          JSON.stringify(c.matchedPhones),
          JSON.stringify(c.matchedTelegrams),
          JSON.stringify(c.matchedUrls),
          JSON.stringify(c.matchedRequisites),
          c.id
        );

        return { ...c, reportCount: newCount, confidenceScore: newScore };
      }
    }

    // 2. Check if there are other existing standalone reports with matching indicators
    const matchingReports = db.prepare(`
      SELECT * FROM fraud_reports
      WHERE (phone_number IS NOT NULL AND phone_number = ?)
         OR (telegram_handle IS NOT NULL AND telegram_handle = ?)
         OR (url IS NOT NULL AND url = ?)
         OR (payment_requisites IS NOT NULL AND payment_requisites = ?)
    `).all(
      indicators.phone || '__none__',
      indicators.telegram || '__none__',
      indicators.url || '__none__',
      indicators.requisites || '__none__'
    ) as any[];

    if (matchingReports.length >= 1) {
      // Create new cluster from linked reports
      const clusterId = uuidv4();
      const clusterCode = `CLUSTER-${Math.floor(1000 + Math.random() * 9000)}`;
      const phones = Array.from(new Set([indicators.phone, ...matchingReports.map((r) => r.phone_number)].filter(Boolean))) as string[];
      const telegrams = Array.from(new Set([indicators.telegram, ...matchingReports.map((r) => r.telegram_handle)].filter(Boolean))) as string[];
      const urls = Array.from(new Set([indicators.url, ...matchingReports.map((r) => r.url)].filter(Boolean))) as string[];
      const reqs = Array.from(new Set([indicators.requisites, ...matchingReports.map((r) => r.payment_requisites)].filter(Boolean))) as string[];

      const summary = `Связанный синдикат (${indicators.category}): ${phones.length} тел., ${telegrams.length} tg, ${urls.length} url, ${reqs.length} карт`;
      const reportCount = matchingReports.length + 1;

      db.prepare(`
        INSERT INTO scam_clusters (
          id, cluster_code, title, indicators_summary, report_count, confidence_score,
          status, matched_phones_json, matched_telegrams_json, matched_urls_json, matched_requisites_json
        ) VALUES (?, ?, ?, ?, ?, 0.85, 'active', ?, ?, ?, ?)
      `).run(
        clusterId,
        clusterCode,
        `Сеть фишинга: ${indicators.category.toUpperCase()}`,
        summary,
        reportCount,
        JSON.stringify(phones),
        JSON.stringify(telegrams),
        JSON.stringify(urls),
        JSON.stringify(reqs)
      );

      // Link previous reports to this new cluster
      for (const mr of matchingReports) {
        db.prepare('UPDATE fraud_reports SET scam_cluster_id = ?, status = ? WHERE id = ?').run(clusterId, 'confirmed_cluster', mr.id);
      }

      return {
        id: clusterId,
        clusterCode,
        title: `Сеть фишинга: ${indicators.category.toUpperCase()}`,
        indicatorsSummary: summary,
        reportCount,
        confidenceScore: 0.85,
        status: 'active',
        matchedPhones: phones,
        matchedTelegrams: telegrams,
        matchedUrls: urls,
        matchedRequisites: reqs,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return undefined;
  }
}
