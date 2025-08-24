import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Mail, 
  Calendar, 
  Coffee, 
  TrendingUp, 
  Download,
  Eye,
  Clock,
  Settings
} from 'lucide-react';
import { prisma } from '@/lib/db';

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';

// Real data from database
async function getDashboardData() {
  try {
    const [leads, events, rsvps] = await Promise.all([
      prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.event.findMany({
        include: {
          sessions: {
            orderBy: { start: 'asc' }
          }
        }
      }),
      prisma.rSVP.findMany({
        include: {
          session: {
            include: { event: true }
          }
        }
      })
    ]);

    const totalLeads = leads.length;
    const waitlistSignups = leads.filter(l => JSON.parse(l.tags || '[]').includes('waitlist')).length;
    const loyaltySignups = leads.filter(l => JSON.parse(l.tags || '[]').includes('loyalty')).length;
    const partyReminders = leads.filter(l => JSON.parse(l.tags || '[]').includes('party')).length;

    const rsvpTastings = rsvps.filter(r => r.session.event.slug === 'coffee-tasting').length;
    const rsvpParty = rsvps.filter(r => r.session.event.slug === 'launch-party').length;

    const recentLeads = leads.slice(0, 10).map(lead => ({
      id: lead.id,
      name: lead.name || 'Анонимен',
      email: lead.email || 'Без имейл',
      source: lead.source || 'website',
      date: lead.createdAt.toLocaleDateString('bg-BG'),
      consent: lead.consentMarketing,
    }));

    // Calculate event stats for the UI
    const eventStats = {
      coffeeTasting: {
        total: events.find(e => e.slug === 'coffee-tasting')?.sessions.reduce((sum, s) => sum + s.capacity, 0) || 0,
        reserved: events.find(e => e.slug === 'coffee-tasting')?.sessions.reduce((sum, s) => sum + s.reserved, 0) || 0,
        available: 0
      },
      launchParty: {
        total: events.find(e => e.slug === 'launch-party')?.sessions[0]?.capacity || 0,
        reserved: events.find(e => e.slug === 'launch-party')?.sessions[0]?.reserved || 0,
        available: 0
      }
    };

    // Calculate available seats
    eventStats.coffeeTasting.available = eventStats.coffeeTasting.total - eventStats.coffeeTasting.reserved;
    eventStats.launchParty.available = eventStats.launchParty.total - eventStats.launchParty.reserved;

    return {
      totalLeads,
      waitlistSignups,
      loyaltySignups,
      partyReminders,
      rsvpTastings,
      rsvpParty,
      recentLeads,
      eventStats,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      totalLeads: 0,
      waitlistSignups: 0,
      loyaltySignups: 0,
      partyReminders: 0,
      rsvpTastings: 0,
      rsvpParty: 0,
      recentLeads: [],
      eventStats: {
        coffeeTasting: { total: 0, reserved: 0, available: 0 },
        launchParty: { total: 0, reserved: 0, available: 0 }
      },
    };
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData();
  
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-mokka-gy">Dashboard</h1>
        <p className="text-mokka-gy/70 mt-2">Overview of Mokka Coffee launch campaign</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-mokka-tq/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-mokka-gy">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-mokka-tq" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-mokka-gy">{data.totalLeads}</div>
            <p className="text-xs text-mokka-gy/70">+12% from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-mokka-br/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-mokka-gy">Waitlist</CardTitle>
            <Mail className="h-4 w-4 text-mokka-br" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-mokka-gy">{data.waitlistSignups}</div>
            <p className="text-xs text-mokka-gy/70">+8% from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-mokka-tq/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-mokka-gy">Loyalty Signups</CardTitle>
            <Coffee className="h-4 w-4 text-mokka-tq" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-mokka-gy">{data.loyaltySignups}</div>
            <p className="text-xs text-mokka-gy/70">+15% from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-mokka-br/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-mokka-gy">Party Reminders</CardTitle>
            <Calendar className="h-4 w-4 text-mokka-br" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-mokka-gy">{data.partyReminders}</div>
            <p className="text-xs text-mokka-gy/70">+5% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Event Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-mokka-tq/20">
          <CardHeader>
            <CardTitle className="text-mokka-gy">Coffee Tasting Sessions</CardTitle>
            <CardDescription>Friday 05.09 • 18:30 & 19:30</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-mokka-gy">Total Capacity:</span>
                <Badge variant="outline" className="border-mokka-tq text-mokka-tq">
                  {data.eventStats.coffeeTasting.total} seats
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-mokka-gy">Reserved:</span>
                <Badge className="bg-mokka-tq text-white">
                  {data.eventStats.coffeeTasting.reserved} seats
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-mokka-gy">Available:</span>
                <Badge variant="outline" className="border-green-500 text-green-600">
                  {data.eventStats.coffeeTasting.available} seats
                </Badge>
              </div>
              <div className="w-full bg-mokka-gy/20 rounded-full h-2">
                <div 
                  className="bg-mokka-tq h-2 rounded-full" 
                  style={{ width: `${(data.eventStats.coffeeTasting.reserved / data.eventStats.coffeeTasting.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-mokka-br/20">
          <CardHeader>
            <CardTitle className="text-mokka-gy">Launch Party</CardTitle>
            <CardDescription>Saturday 06.09 • 17:00–20:00</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-mokka-gy">Total Capacity:</span>
                <Badge variant="outline" className="border-mokka-br text-mokka-br">
                  {data.eventStats.launchParty.total} guests
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-mokka-gy">RSVPs:</span>
                <Badge className="bg-mokka-br text-white">
                  {data.eventStats.launchParty.reserved} guests
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-mokka-gy">Available:</span>
                <Badge variant="outline" className="border-green-500 text-green-600">
                  {data.eventStats.launchParty.available} spots
                </Badge>
              </div>
              <div className="w-full bg-mokka-gy/20 rounded-full h-2">
                <div 
                  className="bg-mokka-br h-2 rounded-full" 
                  style={{ width: `${(data.eventStats.launchParty.reserved / data.eventStats.launchParty.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-mokka-gy/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-mokka-gy">Recent Leads</CardTitle>
              <Button variant="outline" size="sm" className="border-mokka-tq text-mokka-tq hover:bg-mokka-tq hover:text-white">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
            <CardDescription>Latest signups and registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-mokka-cr/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-mokka-tq/20 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-mokka-tq" />
                    </div>
                    <div>
                      <p className="font-medium text-mokka-gy">{lead.name}</p>
                      <p className="text-sm text-mokka-gy/70">{lead.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={lead.source === 'waitlist' ? 'default' : lead.source === 'loyalty' ? 'secondary' : 'outline'}
                      className={lead.source === 'waitlist' ? 'bg-mokka-tq' : lead.source === 'loyalty' ? 'bg-mokka-br' : ''}
                    >
                      {lead.source}
                    </Badge>
                    {lead.consent && (
                      <Badge variant="outline" className="border-green-500 text-green-600">
                        <Mail className="w-3 h-3 mr-1" />
                        Consent
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-mokka-gy/20">
          <CardHeader>
            <CardTitle className="text-mokka-gy">Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start bg-mokka-tq hover:bg-mokka-tq/90">
                <Eye className="w-4 h-4 mr-2" />
                View All Leads
              </Button>
              <Button variant="outline" className="w-full justify-start border-mokka-br text-mokka-br hover:bg-mokka-br hover:text-white">
                <Calendar className="w-4 h-4 mr-2" />
                Manage Events
              </Button>
              <Button variant="outline" className="w-full justify-start border-mokka-tq text-mokka-tq hover:bg-mokka-tq hover:text-white">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" className="w-full justify-start border-mokka-gy text-mokka-gy hover:bg-mokka-gy hover:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Progress */}
      <Card className="bg-white border-mokka-tq/20">
        <CardHeader>
          <CardTitle className="text-mokka-gy">Campaign Progress</CardTitle>
          <CardDescription>Launch campaign performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-mokka-tq mb-2">
                {Math.round((data.totalLeads / 300) * 100)}%
              </div>
              <p className="text-mokka-gy/70">Waitlist Goal (300 contacts)</p>
              <div className="w-full bg-mokka-gy/20 rounded-full h-2 mt-2">
                <div 
                  className="bg-mokka-tq h-2 rounded-full" 
                  style={{ width: `${Math.min((data.totalLeads / 300) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-mokka-br mb-2">
                {Math.round((data.rsvpTastings / 24) * 100)}%
              </div>
              <p className="text-mokka-gy/70">Tasting Sessions (24 seats)</p>
              <div className="w-full bg-mokka-gy/20 rounded-full h-2 mt-2">
                <div 
                  className="bg-mokka-br h-2 rounded-full" 
                  style={{ width: `${Math.min((data.rsvpTastings / 24) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-mokka-tq mb-2">
                {Math.round((data.rsvpParty / 100) * 100)}%
              </div>
              <p className="text-mokka-gy/70">Launch Party (100 guests)</p>
              <div className="w-full bg-mokka-gy/20 rounded-full h-2 mt-2">
                <div 
                  className="bg-mokka-tq h-2 rounded-full" 
                  style={{ width: `${Math.min((data.rsvpParty / 100) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
