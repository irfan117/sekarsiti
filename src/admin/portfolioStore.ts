import { PortfolioItemData } from '../types/portfolio';
import { ClientInvitationData } from '../types/clientInvitation';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { TEMPLATES } from '../data/catalog';
import { readPersistedJson, writePersistedJson } from '../utils/persistedStore';

const PORTFOLIO_STORAGE_KEY = 'sekarsiti_portfolio_items_v2';

type PortfolioListener = () => void;

// Initial fallback portfolio items generated from catalog defaults
export const INITIAL_PORTFOLIO_ITEMS: PortfolioItemData[] = TEMPLATES.map((tpl, idx) => ({
  id: `PF-DEFAULT-${String(idx + 1).padStart(3, '0')}`,
  title: tpl.title,
  slug: tpl.id,
  templateId: (tpl.id as any) || 'ruang-rasa',
  coverImage: tpl.image,
  heroImage: tpl.image,
  galleryImages: [tpl.image],
  songTitle: tpl.demoData?.songTitle || 'Lagu Pernikahan Modern',
  audioUrl: tpl.demoData?.audioUrl || '',
  quoteText: tpl.demoData?.loveQuote || 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya.',
  quoteSource: 'Ar-Rum: 21',
  brideName: tpl.demoData?.brideName || tpl.title.split('&')[0]?.trim() || 'Kirana',
  groomName: tpl.demoData?.groomName || tpl.title.split('&')[1]?.trim() || 'Adhitya',
  eventDate: tpl.demoData?.eventDate || 'Sabtu, 14 Februari 2026',
  city: tpl.demoData?.city || 'Jakarta',
  isPublished: true,
  isClientApproved: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}));

// Function to merge persisted portfolio items with any new templates from catalog
function getMergedInitialPortfolio(): PortfolioItemData[] {
  const persisted = readPersistedJson<PortfolioItemData[]>(PORTFOLIO_STORAGE_KEY, []);
  if (!persisted || persisted.length === 0) {
    return [...INITIAL_PORTFOLIO_ITEMS];
  }

  // Ensure any newly added templates in TEMPLATES catalog are present
  const existingSlugs = new Set(persisted.map(item => item.slug.toLowerCase()));
  const missingDefaults = INITIAL_PORTFOLIO_ITEMS.filter(item => !existingSlugs.has(item.slug.toLowerCase()));
  
  if (missingDefaults.length > 0) {
    const merged = [...persisted, ...missingDefaults];
    writePersistedJson(PORTFOLIO_STORAGE_KEY, merged);
    return merged;
  }

  return persisted;
}

let memoryPortfolio: PortfolioItemData[] = getMergedInitialPortfolio();
let isLoadedFromSupabase = false;

export class PortfolioStore {
  private static listeners: Set<PortfolioListener> = new Set();

  static subscribe(listener: PortfolioListener): () => void {
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
        console.error('Error in PortfolioStore listener', err);
      }
    });
  }

  static async initFromSupabase(force = false): Promise<PortfolioItemData[]> {
    if (isLoadedFromSupabase && !force) {
      return memoryPortfolio;
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('portfolio_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          if (data.length > 0) {
            const supabaseItems: PortfolioItemData[] = data.map((item: any) => ({
              id: item.id,
              title: item.title,
              slug: item.slug,
              sourceInvitationId: item.source_invitation_id || undefined,
              templateId: item.template_id || 'ruang-rasa',
              coverImage: item.cover_image || '',
              heroImage: item.hero_image || '',
              galleryImages: Array.isArray(item.gallery_images) ? item.gallery_images : [],
              songTitle: item.song_title || '',
              audioUrl:
                item.audio_url && !String(item.audio_url).includes('actions.google.com/sounds')
                  ? item.audio_url
                  : '',
              quoteText: item.quote_text || '',
              quoteSource: item.quote_source || '',
              brideName: item.bride_name || '',
              groomName: item.groom_name || '',
              eventDate: item.event_date || '',
              city: item.city || '',
              isPublished: item.is_published ?? false,
              isClientApproved: item.is_client_approved ?? true,
              createdAt: item.created_at || new Date().toISOString(),
              updatedAt: item.updated_at || new Date().toISOString()
            }));

            // Merge Supabase items with any missing templates from catalog defaults
            const supabaseSlugs = new Set(supabaseItems.map(item => item.slug.toLowerCase()));
            const missingFromCatalog = INITIAL_PORTFOLIO_ITEMS.filter(
              item => !supabaseSlugs.has(item.slug.toLowerCase())
            );

            memoryPortfolio = [...supabaseItems, ...missingFromCatalog];
          } else {
            memoryPortfolio = [...INITIAL_PORTFOLIO_ITEMS];
          }
          isLoadedFromSupabase = true;
          this.persistToStorage(memoryPortfolio);
          return memoryPortfolio;
        }
      } catch (err) {
        console.error('Failed to init PortfolioStore from Supabase', err);
      }
    }
    return memoryPortfolio;
  }

  private static persistToStorage(data: PortfolioItemData[]): void {
    memoryPortfolio = data;
    writePersistedJson(PORTFOLIO_STORAGE_KEY, data);
    this.notify();
  }

  static getAll(): PortfolioItemData[] {
    return memoryPortfolio;
  }

  static getPublicItems(): PortfolioItemData[] {
    return memoryPortfolio.filter(item => item.isPublished && item.isClientApproved);
  }

  static getById(idOrSlug: string): PortfolioItemData | undefined {
    return memoryPortfolio.find(
      p => p.id.toLowerCase() === idOrSlug.toLowerCase() || p.slug.toLowerCase() === idOrSlug.toLowerCase()
    );
  }

  static async createFromInvitation(invitation: ClientInvitationData): Promise<PortfolioItemData> {
    const newId = `PF-${Date.now().toString().slice(-6)}`;
    const baseSlug = `portfolio-${invitation.slug || invitation.id.toLowerCase()}`;
    
    // Ensure slug is unique
    let slug = baseSlug;
    let counter = 1;
    while (memoryPortfolio.some(p => p.slug === slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newItem: PortfolioItemData = {
      id: newId,
      title: `${invitation.brideName} & ${invitation.groomName}`,
      slug: slug,
      sourceInvitationId: invitation.id,
      templateId: invitation.templateId,
      coverImage: invitation.mediaSlots?.heroImage || invitation.mediaSlots?.bridePortrait || '',
      heroImage: invitation.mediaSlots?.heroImage || '',
      galleryImages: invitation.mediaSlots?.galleryImages || [],
      songTitle: invitation.songTitle || 'Lagu Pernikahan',
      audioUrl: invitation.audioUrl || '',
      quoteText: invitation.quoteText || 'Momen Bahagia Kami',
      quoteSource: invitation.quoteSource || 'Pernikahan Kita',
      brideName: invitation.brideName,
      groomName: invitation.groomName,
      eventDate: invitation.eventDateFormatted,
      city: invitation.city,
      isPublished: true, // Auto publish to showcase
      isClientApproved: true, // Default true, admin handles client communication manually
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    memoryPortfolio = [newItem, ...memoryPortfolio];
    writePersistedJson(PORTFOLIO_STORAGE_KEY, memoryPortfolio);
    this.notify();

    if (isSupabaseConfigured) {
      try {
        await supabase.from('portfolio_items').insert({
          id: newItem.id,
          title: newItem.title,
          slug: newItem.slug,
          source_invitation_id: newItem.sourceInvitationId,
          template_id: newItem.templateId,
          cover_image: newItem.coverImage,
          hero_image: newItem.heroImage,
          gallery_images: newItem.galleryImages,
          song_title: newItem.songTitle,
          audio_url: newItem.audioUrl,
          quote_text: newItem.quoteText,
          quote_source: newItem.quoteSource,
          bride_name: newItem.brideName,
          groom_name: newItem.groomName,
          event_date: newItem.eventDate,
          city: newItem.city,
          is_published: newItem.isPublished,
          is_client_approved: newItem.isClientApproved
        });
      } catch (err) {
        console.error('Error persisting new portfolio item to Supabase', err);
      }
    }

    return newItem;
  }

  static async update(id: string, updates: Partial<PortfolioItemData>): Promise<PortfolioItemData | null> {
    const idx = memoryPortfolio.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const updatedItem = {
      ...memoryPortfolio[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    memoryPortfolio[idx] = updatedItem;
    writePersistedJson(PORTFOLIO_STORAGE_KEY, memoryPortfolio);
    this.notify();

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('portfolio_items')
          .update({
            title: updatedItem.title,
            slug: updatedItem.slug,
            template_id: updatedItem.templateId,
            cover_image: updatedItem.coverImage,
            hero_image: updatedItem.heroImage,
            gallery_images: updatedItem.galleryImages,
            song_title: updatedItem.songTitle,
            audio_url: updatedItem.audioUrl,
            quote_text: updatedItem.quoteText,
            quote_source: updatedItem.quoteSource,
            bride_name: updatedItem.brideName,
            groom_name: updatedItem.groomName,
            event_date: updatedItem.eventDate,
            city: updatedItem.city,
            is_published: updatedItem.isPublished,
            is_client_approved: updatedItem.isClientApproved,
            updated_at: updatedItem.updatedAt
          })
          .eq('id', id);
      } catch (err) {
        console.error('Error updating portfolio item in Supabase', err);
      }
    }

    return updatedItem;
  }

  static async togglePublished(id: string): Promise<boolean> {
    const item = memoryPortfolio.find(p => p.id === id);
    if (!item) return false;

    const newStatus = !item.isPublished;
    await this.update(id, { isPublished: newStatus });
    return newStatus;
  }

  static async toggleClientApproved(id: string): Promise<boolean> {
    const item = memoryPortfolio.find(p => p.id === id);
    if (!item) return false;

    const newStatus = !item.isClientApproved;
    await this.update(id, { isClientApproved: newStatus });
    return newStatus;
  }

  static async resetToDefaultSeed(): Promise<void> {
    memoryPortfolio = [...INITIAL_PORTFOLIO_ITEMS];
    this.persistToStorage(memoryPortfolio);
    this.notify();
  }

  static async delete(id: string): Promise<boolean> {
    memoryPortfolio = memoryPortfolio.filter(p => p.id !== id);
    writePersistedJson(PORTFOLIO_STORAGE_KEY, memoryPortfolio);
    this.notify();

    if (isSupabaseConfigured) {
      try {
        await supabase.from('portfolio_items').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting portfolio item in Supabase', err);
      }
    }

    return true;
  }
}
