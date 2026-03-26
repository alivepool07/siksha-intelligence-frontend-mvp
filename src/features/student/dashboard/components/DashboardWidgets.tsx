
import { format, differenceInDays } from "date-fns";
import { useAppSelector } from "@/store/hooks";
import { ProfileImageUploader } from "@/components/shared/ProfileImageUploader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Receipt, Bell, Clock, CalendarClock, TrendingUp, Trophy, AlertCircle, FileText } from "lucide-react";
import type { 
  StudentProfileDTO, 
  KpiOverviewDTO, 
  TodayScheduleDTO, 
  PendingAssignmentDTO, 
  PerformanceTrendDTO, 
  RecentAnnouncementDTO 
} from "@/services/types/studentIntelligence";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

// ────────────────────────────────────────────────────────────
// 1. KPI Ribbon & Greeting Widget
// ────────────────────────────────────────────────────────────
export function KpiRibbonWidget({ profile, kpis }: { profile?: StudentProfileDTO; kpis?: KpiOverviewDTO }) {
  const user = useAppSelector((s) => s.auth.user);
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = profile?.fullName?.split(" ")[0] || user?.username?.split(" ")[0] || "Student";
  const hasUpdatePermission = user?.roles?.includes("ROLE_ADMIN") || user?.roles?.includes("ROLE_STUDENT");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
      {/* Greeting Card - Spans 2 cols on lg, glassmorphic */}
      <Card className="lg:col-span-2 border-none shadow-md bg-gradient-to-br from-primary/10 via-background to-background overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <CardContent className="p-6 md:p-8 flex items-center gap-6">
          {hasUpdatePermission ? (
            <ProfileImageUploader
              currentProfileUrl={profile?.profileUrl || user?.profileUrl}
              name={profile?.fullName || user?.username}
              className="w-16 h-16 sm:w-20 sm:h-20 text-3xl border-4 border-background shadow-md shrink-0"
            />
          ) : (
            <UserAvatar 
              profileUrl={profile?.profileUrl || user?.profileUrl} 
              name={profile?.fullName || user?.username} 
              className="w-16 h-16 sm:w-20 sm:h-20 text-3xl border-4 border-background shadow-md shrink-0" 
            />
          )}
          <div className="space-y-1.5 relative z-10 w-full">
            <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              {format(new Date(), "EEEE, MMMM do")}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {greeting}, <span className="text-primary">{firstName}</span>.
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <Badge variant="secondary" className="font-normal text-xs">{profile?.courseOrClass || "Enrolled Course"}</Badge>
              <span className="text-xs text-muted-foreground">ID: {profile?.enrollmentNumber || "TBD"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI 1: Attendance */}
      <Card className="shadow-sm border-border/50 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute right-0 top-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity"><UserAvatar className="w-24 h-24 rounded-none bg-transparent" name="Attendance Tracker" /></div>
        <CardContent className="p-6">
          <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2"><Clock className="w-4 h-4" /> Attendance Status</p>
          <div className="flex items-end gap-2">
            <h3 className="text-4xl font-bold tracking-tighter text-foreground">{kpis?.attendancePercentage ?? 0}%</h3>
          </div>
          <div className="mt-4 w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${(kpis?.attendancePercentage ?? 0) < 75 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
              style={{ width: `${kpis?.attendancePercentage || 0}%` }} 
            />
          </div>
        </CardContent>
      </Card>

      {/* KPI 2: Finance / Action */}
      <Card className="shadow-sm border-border/50 flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-colors">
        <div className="absolute right-0 top-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity"><Receipt className="w-24 h-24" /></div>
        <CardContent className="p-6 flex flex-col h-full justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2"><Receipt className="w-4 h-4" /> Fee Balance</p>
            <h3 className={`text-3xl font-bold tracking-tighter ${(kpis?.totalOverdueFees ?? 0) > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
              ${(kpis?.totalOverdueFees ?? 0).toLocaleString()}
            </h3>
          </div>
          <div className="mt-4">
            {(kpis?.totalOverdueFees ?? 0) > 0 ? (
              <Button size="sm" variant="destructive" className="w-full text-xs box-border">Make Payment</Button>
            ) : (
              <Badge variant="outline" className="w-full justify-center bg-emerald-500/10 text-emerald-600 border-none py-1.5">Cleared</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 2. Daily Routine Timeline Widget
// ────────────────────────────────────────────────────────────
export function DailyRoutineTimelineWidget({ schedule }: { schedule?: TodayScheduleDTO[] }) {
  if (!schedule || schedule.length === 0) {
    return (
      <Card className="h-full shadow-sm border-border/50">
        <CardHeader><CardTitle>Today's Routine</CardTitle></CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground min-h-[300px]">
          <CalendarClock className="w-12 h-12 mb-4 opacity-20" />
          <p>No classes scheduled for today.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full shadow-sm border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center justify-between">
          Today's Routine
          <Badge variant="secondary" className="font-normal text-xs">{schedule.length} Sessions</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        <div className="relative border-l-2 border-muted ml-3 space-y-8 pb-4">
          {schedule.map((session, i) => {
            const isLive = session.status === 'LIVE';
            const isDone = session.status === 'COMPLETED';
            return (
              <div key={session.id || i} className="relative pl-6 group">
                {/* Timeline Dot */}
                <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-background 
                  ${isLive ? 'bg-primary ring-4 ring-primary/20 animate-pulse' : isDone ? 'bg-muted-foreground' : 'bg-muted'}
                `} />
                
                {/* Content */}
                <div className={`space-y-1.5 ${isDone ? 'opacity-60' : 'opacity-100'}`}>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-bold ${isLive ? 'text-primary' : 'text-foreground'}`}>
                      {format(new Date(session.startTime), "h:mm a")} - {format(new Date(session.endTime), "h:mm a")}
                    </p>
                    {isLive && <Badge variant="default" className="text-[10px] h-5 px-1.5 shadow-sm bg-primary/90">LIVE NOW</Badge>}
                  </div>
                  <h4 className="text-base font-semibold text-foreground tracking-tight leading-none">{session.subject}</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    {session.room} • <span className="text-foreground/80 font-medium">{session.teacher}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────
// 3. Pending Tasks / Assignments Widget
// ────────────────────────────────────────────────────────────
export function PendingTasksWidget({ assignments }: { assignments?: PendingAssignmentDTO[] }) {
  if (!assignments || assignments.length === 0) {
    return (
      <Card className="h-full shadow-sm border-border/50">
        <CardHeader><CardTitle>Deadlines</CardTitle></CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground min-h-[300px]">
          <Trophy className="w-12 h-12 mb-4 opacity-20" />
          <p>You're all caught up! No pending assignments.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full shadow-sm border-border/50 flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          Deadlines & Tasks
          {assignments.length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              {assignments.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-4">
          {assignments.map((task) => {
            const daysLeft = differenceInDays(new Date(task.dueDate), new Date());
            const isUrgent = daysLeft <= 2 || task.priority === 'HIGH';
            
            return (
              <div key={task.id} className="group flex items-start gap-4 p-3 rounded-lg border border-border/40 bg-card hover:border-primary/30 hover:bg-muted/30 transition-all shadow-sm">
                <div className={`mt-0.5 shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${isUrgent ? 'bg-rose-500/10 text-rose-500' : 'bg-primary/10 text-primary'}`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{task.subject}</p>
                  <h4 className="text-sm font-semibold text-foreground truncate">{task.title}</h4>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-rose-500' : 'text-muted-foreground'}`} />
                    <span className={`text-xs font-medium ${isUrgent ? 'text-rose-500' : 'text-muted-foreground'}`}>
                      Due {format(new Date(task.dueDate), "MMM do")} ({daysLeft > 0 ? `${daysLeft} days left` : 'Today'})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <div className="p-4 pt-0 mt-auto">
        <Button variant="outline" className="w-full text-xs shadow-sm bg-transparent border-dashed">View All Assignments</Button>
      </div>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────
// 4. Performance Trend Widget (Recharts)
// ────────────────────────────────────────────────────────────
export function PerformanceChartWidget({ trends }: { trends?: PerformanceTrendDTO[] }) {
  if (!trends || trends.length === 0) {
    return (
      <Card className="h-full shadow-sm border-border/50">
        <CardHeader><CardTitle>Academic Growth</CardTitle></CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20">Not enough data to graph.</CardContent>
      </Card>
    );
  }

  // Pre-process data to ensure Recharts maps it correctly
  const chartData = trends.map(t => ({
    name: t.term.length > 8 ? t.term.substring(0, 8) + '...' : t.term,
    CGPA: t.score
  }));

  // Calculate dynamic Y-axis bounds based on data
  const minScore = Math.floor(Math.min(...trends.map(t => t.score)) - 1);
  const maxScore = Math.ceil(Math.max(...trends.map(t => t.score)) + 1);

  return (
    <Card className="h-full shadow-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Academic Trajectory</CardTitle>
        <CardDescription>Your CGPA progression across terms</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCgpa" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
            <YAxis domain={[Math.max(0, minScore), Math.min(10, maxScore)]} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
            />
            <Area type="monotone" dataKey="CGPA" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorCgpa)" activeDot={{ r: 6, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────
// 5. Notice Board Widget
// ────────────────────────────────────────────────────────────
export function NoticeBoardWidget({ notices }: { notices?: RecentAnnouncementDTO[] }) {
  if (!notices || notices.length === 0) {
    return (
      <Card className="h-full shadow-sm border-border/50">
        <CardHeader><CardTitle>Notice Board</CardTitle></CardHeader>
        <CardContent className="p-6 text-center text-muted-foreground min-h-[300px] flex items-center justify-center bg-muted/20">All caught up!</CardContent>
      </Card>
    );
  }

  const getNoticeConfig = (type: string) => {
    switch (type) {
      case 'ALERT': return { icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' };
      case 'ACADEMIC': return { icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' };
      default: return { icon: Bell, color: 'text-amber-500', bg: 'bg-amber-500/10' };
    }
  };

  return (
    <Card className="h-full shadow-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Notice Board</CardTitle>
        <CardDescription>Latest campus announcements</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
        {notices.map((notice) => {
          const { icon: Icon, color, bg } = getNoticeConfig(notice.type);
          return (
            <div key={notice.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className={`shrink-0 p-2 rounded-md ${bg} ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold leading-tight mb-1">{notice.title}</h4>
                <p className="text-xs text-muted-foreground font-mono">{format(new Date(notice.date), "MMM d, h:mm a")}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
