import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ValueProposition } from './components/ValueProposition';
import { TemplateCollection } from './components/TemplateCollection';
import { HowItWorks } from './components/HowItWorks';
import { BrandStory } from './components/BrandStory';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { MobilePreviewModal } from './components/MobilePreviewModal';
import { WhatsAppOrderModal } from './components/WhatsAppOrderModal';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';
import { PrintPlateHerbariumTemplate } from './templates/PrintPlateHerbariumTemplate';
import { MalamZamrudTemplate } from './templates/MalamZamrudTemplate';
import { DamarAlyaTemplate } from './templates/DamarAlyaTemplate';
import { JurnalDuaHatiTemplate } from './templates/JurnalDuaHatiTemplate';
import { ReelSinematikTemplate } from './templates/ReelSinematikTemplate';
import { CetakBiruTemplate } from './templates/CetakBiruTemplate';
import { AtlasCintaTemplate } from './templates/AtlasCintaTemplate';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginView } from './components/admin/AdminLoginView';
import { ClientPortal } from './components/portal/ClientPortal';
import { AdminStore } from './admin/adminStore';
import { useAuth } from './context/AuthContext';
import { getSubdomain } from './utils/subdomainUtils';
import { ClientInvitationData } from './types/clientInvitation';
import { InvitationItem } from './types';
import { TEMPLATES } from './data/catalog';

type DemoView =
  | 'demo-editorial'
  | 'demo-malam-zamrud'
  | 'demo-damar-alya'
  | 'demo-jurnal-dua-hati'
  | 'demo-reel-sinematik'
  | 'demo-cetak-biru'
  | 'demo-atlas-cinta';

type AppView = 'landing' | 'admin' | 'portal' | DemoView;

function resolveDemoViewFromId(key?: string | null): DemoView {
  if (!key) return 'demo-editorial';
  const normalized = key.toLowerCase();
  if (normalized === 'malam-zamrud') return 'demo-malam-zamrud';
  if (normalized === 'setangkai' || normalized === 'damar-alya' || normalized === 'sage') {
    return 'demo-damar-alya';
  }
  if (normalized === 'suasana' || normalized === 'jurnal-dua-hati' || normalized === 'jurnal') {
    return 'demo-jurnal-dua-hati';
  }
  if (
    normalized === 'lembayung' ||
    normalized === 'reel-sinematik' ||
    normalized === 'reel' ||
    normalized === 'larasati-fajar'
  ) {
    return 'demo-reel-sinematik';
  }
  if (
    normalized === 'cetak-biru' ||
    normalized === 'blueprint' ||
    normalized === 'arsitektur' ||
    normalized === 'raka-ayunda'
  ) {
    return 'demo-cetak-biru';
  }
  if (
    normalized === 'atlas-cinta' ||
    normalized === 'atlas' ||
    normalized === 'wulan-dimas' ||
    normalized === 'perjalanan'
  ) {
    return 'demo-atlas-cinta';
  }
  return 'demo-editorial';
}

const DEMO_VIEW_CONFIG: Record<
  DemoView,
  {
    catalogId: string;
    fallbackIdx: number;
    querySlug: string;
    Component: React.ComponentType<{
      onBackToLanding: () => void;
      customData?: ClientInvitationData;
      onOrderViaWhatsApp: () => void;
    }>;
  }
> = {
  'demo-editorial': {
    catalogId: 'ruang-rasa',
    fallbackIdx: 0,
    querySlug: 'editorial',
    Component: PrintPlateHerbariumTemplate,
  },
  'demo-malam-zamrud': {
    catalogId: 'malam-zamrud',
    fallbackIdx: 1,
    querySlug: 'malam-zamrud',
    Component: MalamZamrudTemplate,
  },
  'demo-damar-alya': {
    catalogId: 'setangkai',
    fallbackIdx: 2,
    querySlug: 'damar-alya',
    Component: DamarAlyaTemplate,
  },
  'demo-jurnal-dua-hati': {
    catalogId: 'suasana',
    fallbackIdx: 3,
    querySlug: 'jurnal-dua-hati',
    Component: JurnalDuaHatiTemplate,
  },
  'demo-reel-sinematik': {
    catalogId: 'lembayung',
    fallbackIdx: 4,
    querySlug: 'reel-sinematik',
    Component: ReelSinematikTemplate,
  },
  'demo-cetak-biru': {
    catalogId: 'cetak-biru',
    fallbackIdx: 5,
    querySlug: 'cetak-biru',
    Component: CetakBiruTemplate,
  },
  'demo-atlas-cinta': {
    catalogId: 'atlas-cinta',
    fallbackIdx: 6,
    querySlug: 'atlas-cinta',
    Component: AtlasCintaTemplate,
  },
};

export default function App() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [clientPreviewData, setClientPreviewData] = useState<ClientInvitationData | null>(null);
  const [isAdminPreviewMode, setIsAdminPreviewMode] = useState(false);

  const [portalInitialCode, setPortalInitialCode] = useState('');
  const [portalInitialPin, setPortalInitialPin] = useState('');

  const [previewTemplate, setPreviewTemplate] = useState<InvitationItem | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedTemplateForOrder, setSelectedTemplateForOrder] = useState<InvitationItem | null>(null);

  useEffect(() => {
    // Ambil order nyata dari database Supabase
    AdminStore.initFromSupabase().then(() => {
      const detectedSubdomain = getSubdomain();
      const params = new URLSearchParams(window.location.search);
      const clientLookup = detectedSubdomain || params.get('client');

      if (clientLookup) {
        const found = AdminStore.getById(clientLookup);
        if (found) {
          setClientPreviewData(found);
          setCurrentView(resolveDemoViewFromId(found.templateId));
        }
      }
    });

    const detectedSubdomain = getSubdomain();
    if (detectedSubdomain) {
      const foundClient = AdminStore.getById(detectedSubdomain);
      if (foundClient) {
        setClientPreviewData(foundClient);
        setCurrentView(resolveDemoViewFromId(foundClient.templateId));
        return;
      }
    }

    const params = new URLSearchParams(window.location.search);
    const adminParam = params.get('admin');
    const viewParam = params.get('view');
    const clientParam = params.get('client');
    const portalParam = params.get('portal');
    const pinParam = params.get('pin');
    const demoParam = params.get('demo');

    if (portalParam || viewParam === 'portal') {
      setPortalInitialCode(portalParam || '');
      setPortalInitialPin(pinParam || '');
      setCurrentView('portal');
      return;
    }

    if (adminParam === 'true' || viewParam === 'admin') {
      setCurrentView('admin');
      return;
    }

    if (clientParam) {
      const foundClient = AdminStore.getById(clientParam);
      if (foundClient) {
        setClientPreviewData(foundClient);
        setCurrentView(resolveDemoViewFromId(foundClient.templateId));
        return;
      }
    }

    if (demoParam) {
      setCurrentView(resolveDemoViewFromId(demoParam));
    }
  }, []);

  const handleOpenOrderModal = (item?: InvitationItem) => {
    setSelectedTemplateForOrder(item || null);
    setIsOrderModalOpen(true);
  };

  const handleOrderFromCatalog = (item: InvitationItem) => {
    setSelectedTemplateForOrder(item);
    setIsOrderModalOpen(true);
    setPreviewTemplate(null);
  };

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenDedicatedDemo = (templateId: string) => {
    const targetView = resolveDemoViewFromId(templateId);
    const { querySlug } = DEMO_VIEW_CONFIG[targetView];
    setCurrentView(targetView);
    window.scrollTo({ top: 0, behavior: 'instant' });
    window.history.pushState({}, '', `?demo=${querySlug}`);
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setClientPreviewData(null);
    setIsAdminPreviewMode(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    window.history.pushState({}, '', window.location.pathname);
  };

  const handleOpenAdmin = () => {
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'instant' });
    window.history.pushState({}, '', '?admin=true');
  };

  const handleOpenClientPortal = (invitation?: ClientInvitationData) => {
    if (invitation) {
      const code = invitation.accessCode || invitation.slug || invitation.id;
      const pin = invitation.pinCode || '7429';
      setPortalInitialCode(code);
      setPortalInitialPin(pin);
      window.history.pushState({}, '', `?portal=${encodeURIComponent(code)}&pin=${encodeURIComponent(pin)}`);
    } else {
      setPortalInitialCode('');
      setPortalInitialPin('');
      window.history.pushState({}, '', '?view=portal');
    }
    setCurrentView('portal');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const [previewSource, setPreviewSource] = useState<'admin' | 'portal' | null>(null);

  const handlePreviewClientInvitation = (invitation: ClientInvitationData, source: 'admin' | 'portal' = 'admin') => {
    setClientPreviewData(invitation);
    setPreviewSource(source);
    setIsAdminPreviewMode(true);
    setCurrentView(resolveDemoViewFromId(invitation.templateId));
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleBackFromDemo = () => {
    if (isAdminPreviewMode) {
      setIsAdminPreviewMode(false);
      setClientPreviewData(null);
      if (previewSource === 'portal') {
        setPreviewSource(null);
        setCurrentView('portal');
        window.scrollTo({ top: 0, behavior: 'instant' });
        window.history.pushState({}, '', '?view=portal');
        return;
      }
      setPreviewSource(null);
      setCurrentView('admin');
      window.scrollTo({ top: 0, behavior: 'instant' });
      window.history.pushState({}, '', '?admin=true');
      return;
    }
    handleBackToLanding();
  };

  if (currentView === 'portal') {
    return (
      <ClientPortal
        initialCode={portalInitialCode}
        initialPin={portalInitialPin}
        onBackToHome={handleBackToLanding}
        onOpenInvitation={(inv) => handlePreviewClientInvitation(inv, 'portal')}
      />
    );
  }

  if (currentView === 'admin') {
    // Cek otentikasi admin: Harus login via Supabase Auth (atau mock admin dev)
    const isMockAdmin = typeof window !== 'undefined' && localStorage.getItem('sekarsiti_mock_admin_session') === 'true';
    const isAuthenticatedAdmin = Boolean(user || isMockAdmin);

    if (!isAuthenticatedAdmin) {
      return (
        <AdminLoginView
          onBackToLanding={handleBackToLanding}
        />
      );
    }

    return (
      <AdminDashboard
        onBackToLanding={handleBackToLanding}
        onPreviewClientInvitation={handlePreviewClientInvitation}
        onOpenClientPortal={handleOpenClientPortal}
      />
    );
  }

  if (currentView !== 'landing') {
    const config = DEMO_VIEW_CONFIG[currentView];
    const activeCatalogItem =
      TEMPLATES.find((t) => t.id === config.catalogId) || TEMPLATES[config.fallbackIdx];
    const ActiveDemoComponent = config.Component;

    return (
      <>
        {isAdminPreviewMode && (
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-[#C5A880] text-[#141413] px-4 py-1.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-2">
            <span>
              {previewSource === 'portal'
                ? `Pratinjau Undangan Anda: ${clientPreviewData?.brideName} & ${clientPreviewData?.groomName}`
                : `Pratinjau Klien: ${clientPreviewData?.clientName}`}
            </span>
            <button
              onClick={handleBackFromDemo}
              className="bg-black/20 hover:bg-black/40 text-black px-2 py-0.5 rounded text-[10px] cursor-pointer"
            >
              {previewSource === 'portal' ? 'Kembali ke Portal' : 'Kembali ke Admin'}
            </button>
          </div>
        )}

        <ActiveDemoComponent
          onBackToLanding={handleBackFromDemo}
          customData={clientPreviewData || undefined}
          onOrderViaWhatsApp={() => handleOpenOrderModal(activeCatalogItem)}
        />

        <WhatsAppOrderModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          preselectedItem={selectedTemplateForOrder || activeCatalogItem}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5EF] text-[#2C2E28] font-sans selection:bg-[#E2DDD3] selection:text-[#414A35]">
      <Navbar
        onSelectTemplateCTA={() => handleOpenOrderModal()}
      />

      <main className="flex-1">
        <Hero
          onExploreCollection={() => handleScrollToSection('koleksi')}
          onExploreHowItWorks={() => handleScrollToSection('cara-kerja')}
        />
        <ValueProposition />
        <TemplateCollection
          onPreviewTemplate={setPreviewTemplate}
          onOrderViaWhatsApp={handleOrderFromCatalog}
          onOpenDedicatedDemo={handleOpenDedicatedDemo}
        />
        <HowItWorks />
        <BrandStory />
        <FinalCTA onExploreCollection={() => handleScrollToSection('koleksi')} />
      </main>

      <Footer
        onContactWhatsApp={() => handleOpenOrderModal()}
      />

      <FloatingWhatsAppButton onOpenOrderModal={() => handleOpenOrderModal()} />

      {previewTemplate && (
        <MobilePreviewModal
          item={previewTemplate}
          allItems={TEMPLATES}
          onClose={() => setPreviewTemplate(null)}
          onOrderViaWhatsApp={handleOrderFromCatalog}
          onSelectAnotherItem={setPreviewTemplate}
        />
      )}

      <WhatsAppOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        preselectedItem={selectedTemplateForOrder}
      />
    </div>
  );
}
