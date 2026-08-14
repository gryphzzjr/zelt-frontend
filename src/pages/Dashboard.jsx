import React, { lazy, Suspense } from "react";

import DashboardLayout from "../components/dashboard/DashboardLayout";

const DashboardView = lazy(() => import("../components/views/DashboardView"));
const ConversasView = lazy(() => import("../components/views/ConversasView"));
const LiveChatView = lazy(() => import("../components/views/LiveChatView"));
const BaseConhecimentoView = lazy(() => import("../components/views/BaseConhecimentoView"));
const PromptsView = lazy(() => import("../components/views/PromptsView"));
const RespostasRapidasView = lazy(() => import("../components/views/RespostasRapidasView"));
const TarefasView = lazy(() => import("../components/views/TarefasView"));
const AgendaView = lazy(() => import("../components/views/AgendaView"));
const SheetsView = lazy(() => import("../components/views/SheetsView"));
const MediaView = lazy(() => import("../components/views/MediaView"));
const TemplatesView = lazy(() => import("../components/views/TemplatesView"));
const IntegracoesView = lazy(() => import("../components/views/IntegracoesView"));
const WhatsAppView = lazy(() => import("../components/views/WhatsAppView"));
const GoogleSheetsView = lazy(() => import("../components/views/GoogleSheetsView"));
const GoogleDriveView = lazy(() => import("../components/views/GoogleDriveView"));
const GoogleCalendarView = lazy(() => import("../components/views/GoogleCalendarView"));
const GmailView = lazy(() => import("../components/views/GmailView"));
const ApiWebhooksView = lazy(() => import("../components/views/ApiWebhooksView"));
const ConfiguracoesView = lazy(() => import("../components/views/ConfiguracoesView"));
const AjudaView = lazy(() => import("../components/views/AjudaView"));
const SearchView = lazy(() => import("../components/views/SearchView"));

function ViewLoader() {
    return (
        <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 border-[#6300ff]/30 border-t-[#6300ff] rounded-full animate-spin" />
        </div>
    );
}

const VIEWS = {
    dashboard: DashboardView,

    "atendimentos/conversas": ConversasView,
    "atendimentos/chat": LiveChatView,

    "ia/base-conhecimento": BaseConhecimentoView,
    "ia/prompts": PromptsView,
    "ia/respostas-automaticas": RespostasRapidasView,
    "ia/templates": TemplatesView,

    "operacoes/tarefas": TarefasView,
    "operacoes/agenda": AgendaView,
    "operacoes/planilhas": SheetsView,
    "operacoes/arquivos": MediaView,

    integracoes: IntegracoesView,
    "integracoes/whatsapp": WhatsAppView,
    "integracoes/google-sheets": GoogleSheetsView,
    "integracoes/google-drive": GoogleDriveView,
    "integracoes/google-calendar": GoogleCalendarView,
    "integracoes/gmail": GmailView,
    "integracoes/api-webhooks": ApiWebhooksView,

    configuracoes: ConfiguracoesView,
    ajuda: AjudaView,

    search: SearchView,
};

export default function Dashboard() {
    return (
        <DashboardLayout
            viewComponents={VIEWS}
            defaultView="dashboard"
            fullscreenViews={["atendimentos/chat"]}
            mobileFullscreenViews={["search", "configuracoes"]}
        />
    );
}
