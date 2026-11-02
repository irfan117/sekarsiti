import {
  ReferralDatabase,
  ResellerPartner,
  ReferralRecord,
  INITIAL_RESELLERS_DATA
} from '../data/referrals';
import { readPersistedJson, writePersistedJson } from '../utils/persistedStore';

const REFERRALS_STORAGE_KEY = 'sekarsiti_referrals_data_v1';

let memoryReferrals: ReferralDatabase = readPersistedJson<ReferralDatabase>(
  REFERRALS_STORAGE_KEY,
  INITIAL_RESELLERS_DATA
);

export class ReferralStore {
  private static listeners: Set<() => void> = new Set();

  static subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notify(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Error in ReferralStore listener', err);
      }
    });
  }

  private static persist(): void {
    writePersistedJson(REFERRALS_STORAGE_KEY, memoryReferrals);
    this.notify();
  }

  static getData(): ReferralDatabase {
    return memoryReferrals;
  }

  static getResellers(): ResellerPartner[] {
    return memoryReferrals.resellers;
  }

  static getRecords(): ReferralRecord[] {
    return memoryReferrals.records;
  }

  static getResellerByCode(code: string): ResellerPartner | undefined {
    return memoryReferrals.resellers.find(
      (r) => r.code.toUpperCase() === code.trim().toUpperCase()
    );
  }

  static addReseller(partner: ResellerPartner): void {
    const existingIdx = memoryReferrals.resellers.findIndex(
      (r) => r.code.toUpperCase() === partner.code.trim().toUpperCase()
    );
    if (existingIdx >= 0) {
      memoryReferrals.resellers[existingIdx] = partner;
    } else {
      memoryReferrals.resellers.push(partner);
    }
    this.persist();
  }

  /**
   * Catat atau sinkronkan status referral ketika undangan diperbarui / diterbitkan (published)
   * Referral hanya menjadi 'confirmed' jika status undangan adalah 'published'
   */
  static syncInvitationReferral(params: {
    invitationId: string;
    clientName: string;
    templateId: string;
    isPublished: boolean;
    referralCode?: string;
  }): ReferralRecord | null {
    const rawCode = params.referralCode?.trim().toUpperCase();
    if (!rawCode) return null;

    const partner = this.getResellerByCode(rawCode);
    const commission = partner?.defaultCommission ?? 25000;

    const existingIdx = memoryReferrals.records.findIndex(
      (rec) => rec.invitationId === params.invitationId
    );

    const now = new Date().toISOString();
    const isNowPublished = params.isPublished;

    if (existingIdx >= 0) {
      const current = memoryReferrals.records[existingIdx];
      const updated: ReferralRecord = {
        ...current,
        clientName: params.clientName,
        templateId: params.templateId,
        resellerCode: rawCode,
        status: isNowPublished ? 'confirmed' : 'pending',
        activatedAt: isNowPublished ? (current.activatedAt || now) : current.activatedAt,
      };
      memoryReferrals.records[existingIdx] = updated;
      this.persist();
      return updated;
    }

    const newRecord: ReferralRecord = {
      invitationId: params.invitationId,
      clientName: params.clientName,
      templateId: params.templateId,
      resellerCode: rawCode,
      commission,
      status: isNowPublished ? 'confirmed' : 'pending',
      payoutStatus: 'unpaid',
      activatedAt: isNowPublished ? now : undefined,
    };

    memoryReferrals.records.push(newRecord);
    this.persist();
    return newRecord;
  }

  /**
   * Tandai komisi sudah dibayarkan / transfer ke reseller
   */
  static markPayout(invitationId: string): void {
    const rec = memoryReferrals.records.find((r) => r.invitationId === invitationId);
    if (rec) {
      rec.payoutStatus = 'paid';
      rec.paidAt = new Date().toISOString();
      this.persist();
    }
  }

  /**
   * Dapatkan ringkasan total komisi belum dibayar untuk setiap reseller
   */
  static getUnpaidSummary(): Record<string, { total: number; count: number; partner?: ResellerPartner }> {
    const summary: Record<string, { total: number; count: number; partner?: ResellerPartner }> = {};

    memoryReferrals.records
      .filter((r) => r.status === 'confirmed' && r.payoutStatus === 'unpaid')
      .forEach((r) => {
        if (!summary[r.resellerCode]) {
          summary[r.resellerCode] = {
            total: 0,
            count: 0,
            partner: this.getResellerByCode(r.resellerCode)
          };
        }
        summary[r.resellerCode].total += r.commission;
        summary[r.resellerCode].count += 1;
      });

    return summary;
  }
}

