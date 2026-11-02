export interface ResellerPartner {
  code: string; // e.g. "DINA20"
  name: string; // e.g. "Dina Pratiwi"
  phone: string; // e.g. "081234567890"
  bankInfo?: string; // e.g. "BCA 1234567890 a.n Dina Pratiwi"
  defaultCommission: number; // e.g. 25000 (Rp 25.000 per order aktif)
  createdAt: string;
  notes?: string;
}

export interface ReferralRecord {
  invitationId: string;
  clientName: string;
  templateId: string;
  resellerCode: string;
  commission: number;
  status: 'pending' | 'confirmed'; // 'pending' = baru chat/draft, 'confirmed' = undangan sudah aktif (published)
  payoutStatus: 'unpaid' | 'paid';
  activatedAt?: string;
  paidAt?: string;
}

export interface ReferralDatabase {
  resellers: ResellerPartner[];
  records: ReferralRecord[];
}

export const INITIAL_RESELLERS_DATA: ReferralDatabase = {
  resellers: [
    {
      code: 'PARTNER01',
      name: 'Partner Studio Contoh',
      phone: '081234567890',
      bankInfo: 'BCA 1234567890 a.n Partner',
      defaultCommission: 25000,
      createdAt: '2026-11-01T00:00:00Z',
      notes: 'Partner awal'
    }
  ],
  records: []
};

