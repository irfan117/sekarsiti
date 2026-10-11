import { TemplateId } from './clientInvitation';

export interface PortfolioItemData {
  id: string;
  title: string;
  slug: string;
  sourceInvitationId?: string;
  templateId: TemplateId;
  coverImage: string;
  heroImage: string;
  galleryImages: string[];
  songTitle: string;
  audioUrl?: string;
  quoteText: string;
  quoteSource: string;
  brideName: string;
  groomName: string;
  eventDate: string;
  city: string;
  isPublished: boolean;
  isClientApproved: boolean; // default true for admin manual contact workflow
  createdAt: string;
  updatedAt: string;
}
