/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Dashboard from './pages/Dashboard';
import MainGuide from './pages/MainGuide';
import ScriptBank from './pages/ScriptBank';
import SetupChecklist from './pages/SetupChecklist';
import ActionPlan from './pages/ActionPlan';
import Tracker from './pages/Tracker';
import Bonuses from './pages/Bonuses';
import Help from './pages/Help';
import Profile from './pages/Profile';
import Access from './pages/Access';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// New Modules
import SalesLeakAudit from './pages/SalesLeakAudit';
import ChatExamples from './pages/ChatExamples';
import QualificationFlow from './pages/QualificationFlow';
import PaymentProtocol from './pages/PaymentProtocol';
import TrustModule from './pages/TrustModule';
import LeadTemperature from './pages/LeadTemperature';
import QuickRepliesWorksheet from './pages/QuickRepliesWorksheet';
import RescueSprint from './pages/RescueSprint';
import StatusSelling from './pages/StatusSelling';
import VoiceNotes from './pages/VoiceNotes';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/access" element={<Access />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/guide" element={<MainGuide />} />
                  <Route path="/scripts" element={<ScriptBank />} />
                  <Route path="/checklist" element={<SetupChecklist />} />
                  <Route path="/action-plan" element={<ActionPlan />} />
                  <Route path="/tracker" element={<Tracker />} />
                  <Route path="/bonuses" element={<Bonuses />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/profile" element={<Profile />} />
                  
                  {/* New Modules */}
                  <Route path="/audit" element={<SalesLeakAudit />} />
                  <Route path="/chat-examples" element={<ChatExamples />} />
                  <Route path="/qualification" element={<QualificationFlow />} />
                  <Route path="/payment-protocol" element={<PaymentProtocol />} />
                  <Route path="/trust" element={<TrustModule />} />
                  <Route path="/lead-temperature" element={<LeadTemperature />} />
                  <Route path="/quick-replies" element={<QuickRepliesWorksheet />} />
                  <Route path="/sprint" element={<RescueSprint />} />
                  <Route path="/status-selling" element={<StatusSelling />} />
                  <Route path="/voice-notes" element={<VoiceNotes />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
