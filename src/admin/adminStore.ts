import { ClientInvitationData } from '../types/clientInvitation';
import { TEMPLATE_REGISTRY } from './templateRegistry';
import { INITIAL_SEED_ORDERS } from './seedOrders';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  downloadOrdersJsonBackup,
  downloadRsvpCsv,
  downloadGuestbookCsv
} from './exportUtils';
import { buildInvitationUrl } from '../utils/subdomainUtils';

export interface AdminStoreStats {
  total: number;
  published: number;
  inProgress: number;
  review: number;
  pending: number;
  totalGuests: number;
}

type StoreListener = () => void;

// In-memory cache for fast UI updates
let memoryOrders: ClientInvitationData[] = [...INITIAL_SEED_ORDERS];
let isLoadedFromSupabase = false;

export class AdminStore {
  private static listeners: Set<StoreListener> = new Set();

  static subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notify(): void {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (err) {
        console.error('Error in AdminStore listener', err);
      }
    });
  }

  // Load awal dari Supabase
  static async initFromSupabase(): Promise<ClientInvitationData[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('invitations')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          if (data.length > 0) {
            const mapped = data.map((item: any) => ({
              id: item.id,
              clientName: item.client_name,
              clientPhone: item.client_phone || '',
              clientEmail: item.client_email || '',
              templateId: item.template_id || 'ruang-rasa',
              status: item.status || 'pending',
              createdAt: item.created_at,
              updatedAt: item.updated_at,
              slug: item.slug,
              brideName: item.bride_name || '',
              brideFullName: item.bride_full_name || '',
              brideParents: item.bride_parents || '',
              brideInstagram: item.bride_instagram || '',
              groomName: item.groom_name || '',
              groomFullName: item.groom_full_name || '',
              groomParents: item.groom_parents || '',
              groomInstagram: item.groom_instagram || '',
              eventDateFormatted: item.event_date_formatted || '',
              countdownIsoDate: item.countdown_iso_date || '',
              akadTime: item.akad_time || '',
              akadVenue: item.akad_venue || '',
              resepsiTime: item.resepsi_time || '',
              resepsiVenue: item.resepsi_venue || '',
              city: item.city || '',
              mapsUrl: item.maps_url || '',
              quoteText: item.quote_text || '',
              quoteSource: item.quote_source || '',
              bankName: item.bank_name || '',
              accountNumber: item.account_number || '',
              accountHolder: item.account_holder || '',
              secondaryBankName: item.secondary_bank_name || '',
              secondaryAccountNumber: item.secondary_account_number || '',
              secondaryAccountHolder: item.secondary_account_holder || '',
              songTitle: item.song_title || '',
              audioUrl: item.audio_url || '',
              mediaSlots: item.media_slots || {},
              accessCode: item.access_code || item.slug || item.id,
              pinCode: item.pin_code || '1234',
              guestLinks: item.guest_links || [],
              guestbookEntries: item.guestbook_entries || [],
              rsvpList: item.rsvp_list || []
            }));
            memoryOrders = mapped;
            isLoadedFromSupabase = true;
            this.notify();
            return mapped;
          } else {
            // Jika tabel di database masih kosong, lakukan inisialisasi awal (seed)
            for (const seed of INITIAL_SEED_ORDERS) {
              await this.syncToSupabase(seed);
            }
            isLoadedFromSupabase = true;
            return memoryOrders;
          }
        }
      } catch (err) {
        console.warn('Supabase fetch error, fallback to memory dummy:', err);
      }
    }
    return memoryOrders;
  }

  private static getStore(): ClientInvitationData[] {
    return memoryOrders;
  }

  private static saveStore(data: ClientInvitationData[]): void {
    memoryOrders = data;
    this.notify();
  }

  private static async syncToSupabase(order: ClientInvitationData): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      const payload = {
        id: order.id,
        slug: order.slug,
        client_name: order.clientName,
        client_phone: order.clientPhone,
        client_email: order.clientEmail,
        template_id: order.templateId,
        status: order.status,
        bride_name: order.brideName,
        bride_full_name: order.brideFullName,
        bride_parents: order.brideParents,
        bride_instagram: order.brideInstagram,
        groom_name: order.groomName,
        groom_full_name: order.groomFullName,
        groom_parents: order.groomParents,
        groom_instagram: order.groomInstagram,
        event_date_formatted: order.eventDateFormatted,
        countdown_iso_date: order.countdownIsoDate,
        akad_time: order.akadTime,
        akad_venue: order.akadVenue,
        resepsi_time: order.resepsiTime,
        resepsi_venue: order.resepsiVenue,
        city: order.city,
        maps_url: order.mapsUrl,
        quote_text: order.quoteText,
        quote_source: order.quoteSource,
        bank_name: order.bankName,
        account_number: order.accountNumber,
        account_holder: order.accountHolder,
        secondary_bank_name: order.secondaryBankName,
        secondary_account_number: order.secondaryAccountNumber,
        secondary_account_holder: order.secondaryAccountHolder,
        song_title: order.songTitle,
        audio_url: order.audioUrl,
        media_slots: order.mediaSlots,
        access_code: order.accessCode,
        pin_code: order.pinCode,
        guest_links: order.guestLinks,
        guestbook_entries: order.guestbookEntries,
        rsvp_list: order.rsvpList,
        updated_at: new Date().toISOString()
      };

      const { error: upsertErr } = await supabase.from('invitations').upsert(payload, { onConflict: 'id' });
      if (upsertErr) {
        // Jika terjadi error 409 (misal konflik unique constraint slug karena ada duplikat slug),
        // otomatis buat slug unik dan coba simpan sekali lagi
        if (upsertErr.code === '23505' || upsertErr.message?.includes('duplicate key')) {
          const uniqueSlug = `${payload.slug}-${Date.now().toString().slice(-4)}`;
          payload.slug = uniqueSlug;
          payload.access_code = uniqueSlug;
          order.slug = uniqueSlug;
          order.accessCode = uniqueSlug;
          await supabase.from('invitations').upsert(payload, { onConflict: 'id' });
        } else {
          console.warn('Upsert invitation notice:', upsertErr.message || upsertErr);
        }
      }
    } catch (err) {
      console.error('Failed to sync invitation to Supabase:', err);
    }
  }

  // Mengambil order secara asynchronous dari Supabase dengan fallback sinkron
  static async loadAllAsync(): Promise<ClientInvitationData[]> {
    return this.initFromSupabase();
  }

  static getAll(): ClientInvitationData[] {
    return this.getStore();
  }

  static getById(id: string): ClientInvitationData | undefined {
    return this.getStore().find(item => item.id === id || item.slug === id);
  }

  static getStats(): AdminStoreStats {
    const list = this.getStore();
    return {
      total: list.length,
      published: list.filter(i => i.status === 'published').length,
      inProgress: list.filter(i => i.status === 'in_progress').length,
      review: list.filter(i => i.status === 'review').length,
      pending: list.filter(i => i.status === 'pending').length,
      totalGuests: list.reduce((acc, curr) => acc + (curr.rsvpList?.length || 0), 0)
    };
  }

  static create(payload: Partial<ClientInvitationData>): ClientInvitationData {
    const orders = this.getStore();
    // Gunakan timestamp acak/unik untuk ID agar tidak terjadi bentrok kunci primer
    const id = payload.id || `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const templateId = payload.templateId || 'ruang-rasa';
    const templateDefaults = TEMPLATE_REGISTRY[templateId].defaultData;

    let baseSlug = (payload.slug || payload.clientName || 'undangan-klien')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `undangan-${Date.now()}`;

    // Pastikan slug unik dan tidak bertabrakan dengan data yang sudah ada
    let slug = baseSlug;
    let counter = 1;
    while (orders.some(o => o.id !== id && o.slug === slug)) {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    const newOrder: ClientInvitationData = {
      id,
      clientName: payload.clientName || 'Klien Baru',
      clientPhone: payload.clientPhone || '',
      clientEmail: payload.clientEmail || '',
      templateId,
      status: payload.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slug,
      brideName: payload.brideName || templateDefaults.brideName || '',
      brideFullName: payload.brideFullName || templateDefaults.brideFullName || '',
      brideParents: payload.brideParents || templateDefaults.brideParents || '',
      brideInstagram: payload.brideInstagram || templateDefaults.brideInstagram || '',
      groomName: payload.groomName || templateDefaults.groomName || '',
      groomFullName: payload.groomFullName || templateDefaults.groomFullName || '',
      groomParents: payload.groomParents || templateDefaults.groomParents || '',
      groomInstagram: payload.groomInstagram || templateDefaults.groomInstagram || '',
      eventDateFormatted: payload.eventDateFormatted || templateDefaults.eventDateFormatted || 'Minggu, 14 Februari 2027',
      countdownIsoDate: payload.countdownIsoDate || templateDefaults.countdownIsoDate || '2027-02-14T08:00:00',
      akadTime: payload.akadTime || templateDefaults.akadTime || '08.00 – 10.00 WIB',
      akadVenue: payload.akadVenue || templateDefaults.akadVenue || 'Masjid / Gedung Akad',
      resepsiTime: payload.resepsiTime || templateDefaults.resepsiTime || '11.00 – 14.00 WIB',
      resepsiVenue: payload.resepsiVenue || templateDefaults.resepsiVenue || 'Grand Ballroom',
      city: payload.city || templateDefaults.city || 'Jakarta',
      mapsUrl: payload.mapsUrl || templateDefaults.mapsUrl || 'https://maps.google.com',
      quoteText: payload.quoteText || templateDefaults.quoteText || '',
      quoteSource: payload.quoteSource || templateDefaults.quoteSource || '',
      bankName: payload.bankName || templateDefaults.bankName || 'BCA',
      accountNumber: payload.accountNumber || templateDefaults.accountNumber || '1234567890',
      accountHolder: payload.accountHolder || templateDefaults.accountHolder || '',
      secondaryBankName: payload.secondaryBankName || '',
      secondaryAccountNumber: payload.secondaryAccountNumber || '',
      secondaryAccountHolder: payload.secondaryAccountHolder || '',
      qrisImageUrl: payload.qrisImageUrl || '',
      songTitle: payload.songTitle || templateDefaults.songTitle || 'Until I Found You',
      audioUrl: payload.audioUrl || '',
      mediaSlots: payload.mediaSlots || {
        heroImage: '/images/editorial_couple_portrait_1790838636662.jpg',
        bridePortrait: '/images/wedding_bride_veil_1790901501919.jpg',
        groomPortrait: '/images/editorial_groom_portrait_1790915490996.jpg',
        galleryImages: [
          '/images/editorial_couple_portrait_1790838636662.jpg',
          '/images/wedding_vows_bouquet_1790901516667.jpg'
        ]
      },
      accessCode: payload.accessCode || slug || id,
      pinCode: payload.pinCode || String(Math.floor(1000 + Math.random() * 9000)),
      guestLinks: payload.guestLinks || [],
      guestbookEntries: payload.guestbookEntries || [],
      rsvpList: payload.rsvpList || []
    };

    orders.unshift(newOrder);
    this.saveStore(orders);
    this.syncToSupabase(newOrder);
    return newOrder;
  }

  static async getByAccessAsync(code: string, pin: string): Promise<ClientInvitationData | null> {
    if (!code || !pin) return null;
    const cleanCode = code.trim().toLowerCase();
    const cleanPin = pin.trim();

    if (isSupabaseConfigured) {
      try {
        // Gunakan Secure Stored Procedure (RPC)
        const { data, error } = await supabase.rpc('verify_client_portal', {
          p_code: cleanCode,
          p_pin: cleanPin
        });

        if (!error && data && data.success && data.data) {
          const item = data.data;
          return {
            id: item.id,
            clientName: item.client_name,
            clientPhone: item.client_phone || '',
            clientEmail: item.client_email || '',
            templateId: item.template_id || 'ruang-rasa',
            status: item.status || 'pending',
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            slug: item.slug,
            brideName: item.bride_name || '',
            brideFullName: item.bride_full_name || '',
            brideParents: item.bride_parents || '',
            brideInstagram: item.bride_instagram || '',
            groomName: item.groom_name || '',
            groomFullName: item.groom_full_name || '',
            groomParents: item.groom_parents || '',
            groomInstagram: item.groom_instagram || '',
            eventDateFormatted: item.event_date_formatted || '',
            countdownIsoDate: item.countdown_iso_date || '',
            akadTime: item.akad_time || '',
            akadVenue: item.akad_venue || '',
            resepsiTime: item.resepsi_time || '',
            resepsiVenue: item.resepsi_venue || '',
            city: item.city || '',
            mapsUrl: item.maps_url || '',
            quoteText: item.quote_text || '',
            quoteSource: item.quote_source || '',
            bankName: item.bank_name || '',
            accountNumber: item.account_number || '',
            accountHolder: item.account_holder || '',
            secondaryBankName: item.secondary_bank_name || '',
            secondaryAccountNumber: item.secondary_account_number || '',
            secondaryAccountHolder: item.secondary_account_holder || '',
            songTitle: item.song_title || '',
            audioUrl: item.audio_url || '',
            mediaSlots: item.media_slots || {},
            accessCode: item.access_code || item.slug || item.id,
            pinCode: item.pin_code || cleanPin,
            guestLinks: item.guest_links || [],
            guestbookEntries: item.guestbook_entries || [],
            rsvpList: item.rsvp_list || []
          };
        }
      } catch (err) {
        console.warn('Supabase auth getByAccessAsync fallback:', err);
      }
    }

    return this.getByAccess(code, pin);
  }

  static getByAccess(code: string, pin: string): ClientInvitationData | null {
    if (!code || !pin) return null;
    const cleanCode = code.trim().toLowerCase();
    const cleanPin = pin.trim();
    const orders = this.getStore();

    return orders.find(item => {
      const matchCode =
        (item.accessCode && item.accessCode.toLowerCase() === cleanCode) ||
        (item.slug && item.slug.toLowerCase() === cleanCode) ||
        (item.id && item.id.toLowerCase() === cleanCode);

      const expectedPin = (item.pinCode || '1234').trim();
      const matchPin = expectedPin === cleanPin;
      return matchCode && matchPin;
    }) || null;
  }

  static addGuestLink(
    invitationId: string,
    guestData: { guestName: string; category?: string; phone?: string }
  ): { success: boolean; link: any } {
    const orders = this.getStore();
    const index = orders.findIndex(o => o.id === invitationId || o.slug === invitationId);
    if (index === -1) return { success: false, link: null };

    const newLink = {
      id: `gl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      guestName: guestData.guestName.trim(),
      category: guestData.category || 'Tamu Undangan',
      phone: guestData.phone?.trim() || '',
      createdAt: new Date().toISOString(),
      isSent: false
    };

    const currentLinks = orders[index].guestLinks || [];
    orders[index] = {
      ...orders[index],
      guestLinks: [newLink, ...currentLinks],
      updatedAt: new Date().toISOString()
    };

    this.saveStore(orders);
    this.syncToSupabase(orders[index]);
    return { success: true, link: newLink };
  }

  static addGuestLinksBatch(
    invitationId: string,
    guests: Array<{ guestName: string; category?: string; phone?: string }>
  ): { success: boolean; addedCount: number } {
    const orders = this.getStore();
    const index = orders.findIndex(o => o.id === invitationId || o.slug === invitationId);
    if (index === -1 || !guests.length) return { success: false, addedCount: 0 };

    const now = new Date().toISOString();
    const newLinks = guests
      .filter(g => g.guestName && g.guestName.trim())
      .map((guestData, idx) => ({
        id: `gl-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        guestName: guestData.guestName.trim(),
        category: guestData.category?.trim() || 'Tamu Undangan',
        phone: guestData.phone?.trim() || '',
        createdAt: now,
        isSent: false
      }));

    if (newLinks.length === 0) return { success: false, addedCount: 0 };

    const currentLinks = orders[index].guestLinks || [];
    orders[index] = {
      ...orders[index],
      guestLinks: [...newLinks, ...currentLinks],
      updatedAt: now
    };

    this.saveStore(orders);
    this.syncToSupabase(orders[index]);
    return { success: true, addedCount: newLinks.length };
  }

  static toggleGuestLinkSent(invitationId: string, linkId: string): void {
    const orders = this.getStore();
    const index = orders.findIndex(o => o.id === invitationId || o.slug === invitationId);
    if (index === -1) return;

    const currentLinks = orders[index].guestLinks || [];
    orders[index] = {
      ...orders[index],
      guestLinks: currentLinks.map(l => l.id === linkId ? { ...l, isSent: !l.isSent } : l),
      updatedAt: new Date().toISOString()
    };
    this.saveStore(orders);
    this.syncToSupabase(orders[index]);
  }

  static deleteGuestLink(invitationId: string, linkId: string): void {
    const orders = this.getStore();
    const index = orders.findIndex(o => o.id === invitationId || o.slug === invitationId);
    if (index === -1) return;

    const currentLinks = orders[index].guestLinks || [];
    orders[index] = {
      ...orders[index],
      guestLinks: currentLinks.filter(l => l.id !== linkId),
      updatedAt: new Date().toISOString()
    };
    this.saveStore(orders);
    this.syncToSupabase(orders[index]);
  }

  static addRsvp(
    invitationId: string,
    rsvp: { name: string; attendance: string; count: number }
  ): void {
    const orders = this.getStore();
    const index = orders.findIndex(o => o.id === invitationId || o.slug === invitationId);
    if (index === -1) return;

    const currentRsvp = orders[index].rsvpList || [];
    orders[index] = {
      ...orders[index],
      rsvpList: [
        {
          name: rsvp.name,
          attendance: rsvp.attendance,
          count: rsvp.count,
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        },
        ...currentRsvp
      ],
      updatedAt: new Date().toISOString()
    };
    this.saveStore(orders);
    this.syncToSupabase(orders[index]);
  }

  static addGuestbook(
    invitationId: string,
    entry: { name: string; message: string }
  ): void {
    const orders = this.getStore();
    const index = orders.findIndex(o => o.id === invitationId || o.slug === invitationId);
    if (index === -1) return;

    const currentEntries = orders[index].guestbookEntries || [];
    orders[index] = {
      ...orders[index],
      guestbookEntries: [
        {
          name: entry.name,
          message: entry.message,
          time: 'Baru saja'
        },
        ...currentEntries
      ],
      updatedAt: new Date().toISOString()
    };
    this.saveStore(orders);
    this.syncToSupabase(orders[index]);
  }

  static update(id: string, updates: Partial<ClientInvitationData>): ClientInvitationData {
    const orders = this.getStore();
    const index = orders.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`Order with id ${id} not found`);
    }

    const updated: ClientInvitationData = {
      ...orders[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    orders[index] = updated;
    this.saveStore(orders);
    this.syncToSupabase(updated);
    return updated;
  }

  static delete(id: string): void {
    const orders = this.getStore().filter(item => item.id !== id);
    this.saveStore(orders);
    if (isSupabaseConfigured) {
      supabase.from('invitations').delete().eq('id', id).then();
    }
  }

  static duplicate(id: string): ClientInvitationData {
    const original = this.getById(id);
    if (!original) throw new Error('Original not found');

    const newSlug = `${original.slug || original.id}-copy-${Date.now().toString().slice(-4)}`;

    return this.create({
      ...original,
      id: undefined,
      slug: newSlug,
      clientName: `${original.clientName} (Salinan)`,
      status: 'pending'
    });
  }

  static generateShareLink(invitation: ClientInvitationData, guestName?: string): string {
    const slug = invitation.slug || invitation.id;
    const baseUrl = buildInvitationUrl(slug, invitation.id);
    if (!guestName || !guestName.trim()) return baseUrl;
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}to=${encodeURIComponent(guestName.trim())}`;
  }

  static generateUniversalShareLink(
    invitation: ClientInvitationData,
    options?: { hideGuestName?: boolean; customGreeting?: string }
  ): string {
    const slug = invitation.slug || invitation.id;
    const baseUrl = buildInvitationUrl(slug, invitation.id);
    const separator = baseUrl.includes('?') ? '&' : '?';
    if (options?.hideGuestName) {
      return `${baseUrl}${separator}notamu=1`;
    }
    if (options?.customGreeting && options.customGreeting.trim()) {
      return `${baseUrl}${separator}to=${encodeURIComponent(options.customGreeting.trim())}`;
    }
    return baseUrl;
  }

  static generateUniversalWhatsAppMessage(
    invitation: ClientInvitationData,
    options?: { hideGuestName?: boolean; customGreeting?: string }
  ): string {
    const link = this.generateUniversalShareLink(invitation, options);
    const greetingHeader = options?.hideGuestName
      ? 'Assalamu’alaikum Warahmatullahi Wabarakatuh / Salam Sejahtera,'
      : `Kepada Yth.\n*${options?.customGreeting?.trim() || 'Bapak/Ibu/Saudara/i & Sahabat Sekalian'}*`;

    return `${greetingHeader}

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i serta rekan-rekan sekalian untuk hadir dan memberikan doa restu pada acara pernikahan kami:

*${invitation.brideName} & ${invitation.groomName}*
🗓 ${invitation.eventDateFormatted}
📍 ${invitation.resepsiVenue}, ${invitation.city}

Informasi lengkap acara & tautan undangan digital dapat diakses melalui:
${link}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk berbagi kebahagiaan bersama kami.

Terima kasih,
*${invitation.brideName} & ${invitation.groomName}*`;
  }

  static generateWhatsAppMessage(invitation: ClientInvitationData, guestName: string): string {
    const cleanGuest = guestName.trim() || 'Bapak/Ibu/Saudara/i';
    const link = this.generateShareLink(invitation, guestName);

    return `Kepada Yth.
${cleanGuest},

Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud mengundang Anda untuk hadir pada perayaan pernikahan kami:

${invitation.brideName} & ${invitation.groomName}
Hari/Tanggal: ${invitation.eventDateFormatted}
Tempat: ${invitation.resepsiVenue}, ${invitation.city}

Tautan Undangan Resmi Digital Anda:
${link}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.

Hormat kami yang berbahagia,
${invitation.brideName} & ${invitation.groomName}`;
  }

  static generateBatchLinks(invitation: ClientInvitationData, guestNames: string[]) {
    return guestNames
      .map(name => name.trim())
      .filter(Boolean)
      .map(name => ({
        guestName: name,
        link: this.generateShareLink(invitation, name),
        message: this.generateWhatsAppMessage(invitation, name)
      }));
  }

  static exportAllAsJson(): void {
    downloadOrdersJsonBackup(this.getStore());
  }

  static importJsonBackup(jsonString: string): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        return { success: false, count: 0, error: 'Format data JSON tidak valid: bukan daftar undangan.' };
      }
      const validOrders = parsed.filter(item => item && item.id && item.clientName);
      if (validOrders.length === 0) {
        return { success: false, count: 0, error: 'Tidak ditemukan data undangan yang valid dalam file.' };
      }
      this.saveStore(validOrders);
      return { success: true, count: validOrders.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err?.message || 'Gagal memproses file JSON.' };
    }
  }

  static resetToDefaultSeed(): void {
    this.saveStore(INITIAL_SEED_ORDERS);
  }

  static exportRsvpToCsv(invitation: ClientInvitationData): void {
    downloadRsvpCsv(invitation);
  }

  static exportGuestbookToCsv(invitation: ClientInvitationData): void {
    downloadGuestbookCsv(invitation);
  }
}
