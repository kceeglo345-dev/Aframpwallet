import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppLayout from './components/AppLayout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Features from './pages/Features';
import Developers from './pages/Developers';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Compliance from './pages/Compliance';
import Settings from './pages/Settings';
import Reports from './pages/Reports';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public site routes */}
          <Route
            path="/"
            element={
              <div className="min-h-screen bg-black">
                <Landing />
              </div>
            }
          />
          <Route
            path="/home"
            element={
              <div className="min-h-screen bg-white">
                <Navbar />
                <main>
                  <Home />
                </main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/features"
            element={
              <div className="min-h-screen bg-white">
                <Navbar />
                <main>
                  <Features />
                </main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/developers"
            element={
              <div className="min-h-screen bg-white">
                <Navbar />
                <main>
                  <Developers />
                </main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/about"
            element={
              <div className="min-h-screen bg-white">
                <Navbar />
                <main>
                  <About />
                </main>
                <Footer />
              </div>
            }
          />

          {/* App routes (dashboard, transactions, etc.) */}
          <Route path="/dashboard" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
          </Route>
          <Route path="/transactions" element={<AppLayout />}>
            <Route index element={<Transactions />} />
          </Route>
          <Route path="/reports" element={<AppLayout />}>
            <Route index element={<Reports />} />
          </Route>
          <Route path="/compliance" element={<AppLayout />}>
            <Route index element={<Compliance />} />
          </Route>
          <Route path="/settings" element={<AppLayout />}>
            <Route index element={<Settings />} />
          </Route>
        </Routes>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
