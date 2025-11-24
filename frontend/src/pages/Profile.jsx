import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Train,
  MapPin,
  Clock,
  Users,
  Settings,
  Bell,
  Shield,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import vi from '@/lib/translations';

export default function Profile() {
  const userProfile = {
    name: "Sarah Johnson",
    role: vi.profile.roles.stationManager,
    email: "sarah.johnson@trainstation.com",
    phone: "+1 (555) 123-4567",
    joinDate: "Tháng 1 năm 2022",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  };

  const assignedStations = [
    { name: "Nhà ga Trung tâm", location: vi.profile.locations.downtown, status: "active", trains: 45 },
    { name: "Nhà ga Bắc", location: vi.profile.locations.northDistrict, status: "active", trains: 32 },
    { name: "Giao lộ Đông", location: vi.profile.locations.eastQuarter, status: "maintenance", trains: 18 },
  ];

  const recentActivity = [
    { action: vi.profile.recentActivity.actions.updatedSchedule, station: "Nhà ga Trung tâm", time: `2 ${vi.profile.recentActivity.time.hoursAgo}`, type: "success" },
    { action: vi.profile.recentActivity.actions.maintenanceAlert, station: "Giao lộ Đông", time: `5 ${vi.profile.recentActivity.time.hoursAgo}`, type: "warning" },
    { action: vi.profile.recentActivity.actions.staffMeeting, station: "Nhà ga Bắc", time: `1 ${vi.profile.recentActivity.time.daysAgo}`, type: "info" },
    { action: vi.profile.recentActivity.actions.safetyInspection, station: "Nhà ga Trung tâm", time: `2 ${vi.profile.recentActivity.time.daysAgo}`, type: "success" },
  ];

  const stats = [
    { label: vi.profile.stats.totalStations, value: "3", icon: MapPin },
    { label: vi.profile.stats.activeTrains, value: "95", icon: Train },
    { label: vi.profile.stats.staffMembers, value: "127", icon: Users },
    { label: vi.profile.stats.avgOnTime, value: "94%", icon: Clock },
  ];

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{vi.profile.title}</h1>
          <p className="mt-1.5 text-slate-600 dark:text-slate-400">
            {vi.profile.description}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          {vi.common.settings}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar className="w-24 h-24">
              <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
              <AvatarFallback>SJ</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">{userProfile.name}</h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-3">{userProfile.role}</p>
                  <div className="flex flex-wrap gap-4 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{userProfile.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{userProfile.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{vi.profile.joined} {userProfile.joinDate}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button>{vi.profile.editProfile}</Button>
                  <Button variant="outline">
                    <Bell className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg">
                  <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="stations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stations">{vi.profile.tabs.stations}</TabsTrigger>
          <TabsTrigger value="activity">{vi.profile.tabs.activity}</TabsTrigger>
          <TabsTrigger value="preferences">{vi.profile.tabs.preferences}</TabsTrigger>
        </TabsList>

        <TabsContent value="stations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{vi.profile.assignedStations.title}</CardTitle>
              <CardDescription>
                {vi.profile.assignedStations.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignedStations.map((station, index) => (
                  <div key={index}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-start gap-4">
                        <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                          <MapPin className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                        </div>
                        <div>
                          <h3 className="text-slate-900 dark:text-slate-100 font-medium mb-1">{station.name}</h3>
                          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">{station.location}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={station.status === "active" ? "default" : "secondary"}>
                              {station.status}
                            </Badge>
                            <span className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-1">
                              <Train className="w-3 h-3" />
                              {station.trains} {vi.profile.assignedStations.trainsPerDay}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">{vi.common.viewDetails}</Button>
                    </div>
                    {index < assignedStations.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{vi.profile.recentActivity.title}</CardTitle>
              <CardDescription>
                {vi.profile.recentActivity.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index}>
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${
                        activity.type === "success" ? "bg-green-100 dark:bg-green-900/50" :
                        activity.type === "warning" ? "bg-orange-100 dark:bg-orange-900/50" :
                        "bg-blue-100 dark:bg-blue-900/50"
                      }`}>
                        {activity.type === "success" ? (
                          <CheckCircle className={`w-4 h-4 ${
                            activity.type === "success" ? "text-green-600 dark:text-green-400" :
                            activity.type === "warning" ? "text-orange-600 dark:text-orange-400" :
                            "text-blue-600 dark:text-blue-400"
                          }`} />
                        ) : activity.type === "warning" ? (
                          <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-900 dark:text-slate-100 font-medium">{activity.action}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-slate-600 dark:text-slate-400 text-sm">{activity.station}</span>
                          <span className="text-slate-400 text-sm">•</span>
                          <span className="text-slate-500 dark:text-slate-500 text-sm">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                    {index < recentActivity.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{vi.profile.notificationPreferences.title}</CardTitle>
              <CardDescription>
                {vi.profile.notificationPreferences.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{vi.profile.notificationPreferences.emailNotifications}</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{vi.profile.notificationPreferences.emailNotificationsDesc}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{vi.profile.notificationPreferences.maintenanceAlerts}</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{vi.profile.notificationPreferences.maintenanceAlertsDesc}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{vi.profile.notificationPreferences.scheduleChanges}</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{vi.profile.notificationPreferences.scheduleChangesDesc}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{vi.profile.notificationPreferences.safetyReports}</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{vi.profile.notificationPreferences.safetyReportsDesc}</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{vi.profile.securitySettings.title}</CardTitle>
              <CardDescription>
                {vi.profile.securitySettings.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{vi.profile.securitySettings.twoFactor}</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{vi.profile.securitySettings.twoFactorDesc}</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label>{vi.profile.securitySettings.password}</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{vi.profile.securitySettings.passwordDesc}</p>
                </div>
                <Button variant="outline" size="sm">{vi.profile.securitySettings.changePassword}</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {vi.profile.securitySettings.accessLevel}
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{vi.profile.securitySettings.accessLevelDesc}</p>
                </div>
                <Badge>{vi.profile.securitySettings.verified}</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
